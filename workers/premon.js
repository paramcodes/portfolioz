// Cloudflare Worker — standalone cron-triggered prewarmer.
// This is **Option B** (pure Cloudflare-native scheduling) — only
// needed if you don't want the GitHub Actions workflow.
//
// Deploy with:
//   cd workers && wrangler deploy --env production --config ../wrangler-worker.toml
//
// Shares the same OSS_KV namespace as the Pages Function, so
// /api/oss serves the freshly warmed data to visitors.

const USER = 'paramcodes';
const CACHE_TTL = 3600;
const KV_KEY = 'oss-data-v1';

async function get(url, accept = 'application/vnd.github+json') {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'yunhi-portfolio-premon', Accept: accept },
  });
  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get('x-ratelimit-reset');
    throw new Error(`Rate limited (${res.status})${reset ? `, resets ${new Date(+reset * 1000).toISOString()}` : ''}`);
  }
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res;
}

function parseCalendar(html) {
  const dates = [...html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g)].map((m) => ({ date: m[1], level: +m[2] }));
  const tips = [...html.matchAll(/<tool-tip[^>]*>(.*?)<\/tool-tip>/gs)].map((m) => m[1].replace(/\s+/g, ' ').trim());
  if (!dates.length || dates.length !== tips.length) throw new Error(`Calendar parse mismatch: ${dates.length} cells vs ${tips.length} tips`);
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
  for (const d of days) { run = d.count > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  return { weeks, total, currentStreak: current, longestStreak: longest };
}

async function fetchGitHubData(env) {
  const calHtml = await (await get(`https://github.com/users/${USER}/contributions`)).text();
  const cal = parseCalendar(calHtml);

  const search = await (await get(
    `https://api.github.com/search/issues?q=author:${USER}+type:pr&per_page=12&sort=created&order=desc`,
    'application/vnd.github+json'
  )).json();
  const items = search.items ?? [];

  const repoUrls = [...new Set(items.map((i) => i.repository_url))].slice(0, 8);
  const repoInfo = {};
  for (const url of repoUrls) {
    try { const r = await (await get(url, 'application/vnd.github+json')).json(); repoInfo[url] = { repo: r.full_name, stars: r.stargazers_count ?? 0 }; }
    catch {}
    await new Promise((r) => setTimeout(r, 650));
  }

  const prs = items.slice(0, 12).map((i) => {
    const info = repoInfo[i.repository_url] ?? { repo: i.repository_url.split('/repos/')[1] ?? 'unknown', stars: 0 };
    const state = i.state === 'open' ? 'open' : i.pull_request?.merged_at ? 'merged' : 'closed';
    return { title: i.title, number: i.number, url: i.html_url, state, date: (i.pull_request?.merged_at ?? i.closed_at ?? i.created_at ?? '').slice(0, 10), ...info };
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

  return { updatedAt: new Date().toISOString(), user: USER, totalContributions: cal.total, currentStreak: cal.currentStreak, longestStreak: cal.longestStreak, weeks: cal.weeks, stats: { prsTotal: search.total_count, prsMerged: merged, prsOpen: open, reposCount: Object.keys(byRepo).length }, topRepos, prs, fresh: true };
}

export default {
  async scheduled(controller, env, ctx) {
    console.log('[oss-premon] Running cron pre-warm');
    const data = await fetchGitHubData(env);
    await env.OSS_KV.put(KV_KEY, JSON.stringify(data), { expirationTtl: CACHE_TTL });
    console.log('[oss-premon] Warmed cache at', new Date().toISOString());
  },
};