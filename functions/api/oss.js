// /functions/api/oss.js  —  Cloudflare Pages Function (Worker-mode)
// Fetches from GitHub contribution calendar + PR search, caches in KV.
// No build-time dependency; runs at request time or is pre-warmed by cron.

const USER = 'paramcodes';
const CACHE_TTL = 3600; // 1 hour
const KV_KEY = 'oss-data-v1';

async function get(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      'User-Agent': 'yunhi-portfolio',
      Accept: opts.json ? 'application/vnd.github+json' : 'text/html',
    },
  });
  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get('x-ratelimit-reset');
    const msg = reset ? `resets ${new Date(+reset * 1000).toISOString()}` : '';
    throw new Error(`Rate limited (${res.status}) ${msg}`);
  }
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res;
}

function parseCalendar(html) {
  const dates = [...html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g)].map((m) => ({
    date: m[1], level: +m[2],
  }));
  const tips = [...html.matchAll(/<tool-tip[^>]*>(.*?)<\/tool-tip>/gs)].map((m) =>
    m[1].replace(/\s+/g, ' ').trim()
  );
  if (!dates.length || dates.length !== tips.length) {
    throw new Error(`Calendar parse mismatch: ${dates.length} cells vs ${tips.length} tips`);
  }
  const days = dates.map((d, i) => {
    const m = tips[i].match(/^(No|\d+)\s+contribution/);
    return { ...d, count: !m || m[1] === 'No' ? 0 : +m[1] };
  });
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const total = days.reduce((s, d) => s + d.count, 0);
  let end = days.length - 1;
  if (days[end].count === 0) end -= 1;
  let current = 0;
  for (let i = end; i >= 0 && days[i].count > 0; i--) current++;
  let longest = 0, run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  return { weeks, total, currentStreak: current, longestStreak: longest };
}

async function fetchGitHubData(env) {
  // Contrib calendar
  const calHtml = await (await get(`https://github.com/users/${USER}/contributions`, { headers: {} })).text();
  const cal = parseCalendar(calHtml);

  // PRs
  const search = await (await get(
    `https://api.github.com/search/issues?q=author:${USER}+type:pr&per_page=12&sort=created&order=desc`,
    { json: true }
  )).json();
  const items = search.items ?? [];

  // Repo details (only unique repos from PR results, limited)
  const repoUrls = [...new Set(items.map((i) => i.repository_url))].slice(0, 8);
  const repoInfo = {};
  for (const url of repoUrls) {
    try {
      const r = await (await get(url, { json: true })).json();
      repoInfo[url] = { repo: r.full_name, stars: r.stargazers_count ?? 0 };
    } catch (e) { /* skip on rate/fail */ }
    await new Promise((r) => setTimeout(r, 650)); // be polite
  }

  const prs = items.slice(0, 12).map((i) => {
    const info = repoInfo[i.repository_url] ?? { repo: i.repository_url.split('/repos/')[1] ?? 'unknown', stars: 0 };
    const state = i.state === 'open' ? 'open' : i.pull_request?.merged_at ? 'merged' : 'closed';
    return {
      title: i.title,
      number: i.number,
      url: i.html_url,
      state,
      date: (i.pull_request?.merged_at ?? i.closed_at ?? i.created_at ?? '').slice(0, 10),
      ...info,
    };
  });

  const byRepo = {};
  for (const i of items) {
    const info = repoInfo[i.repository_url];
    const name = info?.repo ?? i.repository_url.split('/repos/')[1] ?? 'unknown';
    byRepo[name] = byRepo[name] ?? { repo: name, stars: info?.stars ?? 0, count: 0 };
    byRepo[name].count++;
  }
  const topRepos = Object.values(byRepo).sort((a, b) => b.count - a.count).slice(0, 8);
  const merged = items.filter((i) => i.pull_request?.merged_at).length;
  const open = items.filter((i) => i.state === 'open').length;

  return {
    updatedAt: new Date().toISOString(),
    user: USER,
    totalContributions: cal.total,
    currentStreak: cal.currentStreak,
    longestStreak: cal.longestStreak,
    weeks: cal.weeks,
    stats: {
      prsTotal: search.total_count,
      prsMerged: merged,
      prsOpen: open,
      reposCount: Object.keys(byRepo).length,
    },
    topRepos,
    prs,
    fresh: true,
  };
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Only serve /api/oss
  if (url.pathname !== '/api/oss') {
    return new Response('Not Found', { status: 404 });
  }

  // 1. Try cached KV data first (fast)
  try {
    const cached = await env.OSS_KV.get(KV_KEY, 'json');
    if (cached && !cached.stale) {
      // If cache is < 30 min old, serve immediately
      const age = Date.now() - new Date(cached.updatedAt).getTime();
      if (age < 1800_000) {
        return new Response(JSON.stringify({ ...cached, servedFrom: 'kv', ageMs: age }), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600' },
        });
      }
    }
  } catch { /* KV missing / not bound */ }

  // 2. Try fetching (with graceful fallback to stale KV)
  try {
    const fresh = await fetchGitHubData(env);
    try {
      await env.OSS_KV.put(KV_KEY, JSON.stringify(fresh), { expirationTtl: CACHE_TTL });
    } catch { /* KV write fails — serve fresh anyway */ }
    return new Response(JSON.stringify({ ...fresh, servedFrom: 'fetch' }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600' },
    });
  } catch (e) {
    // 3. Fallback to stale KV or static json embedded in site
    console.error('[oss-worker] fetch failed:', e.message);
    try {
      const stale = await env.OSS_KV.get(KV_KEY, 'json');
      if (stale) {
        return new Response(JSON.stringify({ ...stale, servedFrom: 'kv-stale', stale: true, error: e.message }), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
        });
      }
    } catch {}
    // 4. Ultimate fallback: return a minimal skeleton so page never crashes
    return new Response(JSON.stringify({
      updatedAt: new Date().toISOString(), user: USER, fresh: false, stale: true, error: e.message,
      totalContributions: 0, currentStreak: 0, longestStreak: 0, weeks: [], stats: {}, topRepos: [], prs: [],
    }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
      status: 200,
    });
  }
}
