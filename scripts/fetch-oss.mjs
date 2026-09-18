// Fetches public GitHub OSS data (contribution calendar + PRs) and writes
// src/data/oss.json. Runs automatically on `prebuild`; safe to run manually.
// No token needed. If the API fails, the existing oss.json is kept so builds
// never break.
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const USER = 'paramcodes';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'oss.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, accept = 'application/vnd.github+json') {
  const res = await fetch(url, { headers: { Accept: accept, 'User-Agent': 'yunhi-portfolio' } });
  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get('x-ratelimit-reset');
    throw new Error(`Rate limited (${res.status})${reset ? `, resets ${new Date(+reset * 1000).toISOString()}` : ''}`);
  }
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res;
}

function parseCalendar(html) {
  const dates = [...html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g)].map((m) => ({
    date: m[1],
    level: +m[2],
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
  // current streak (ending today, or yesterday if today is empty)
  let end = days.length - 1;
  if (days[end].count === 0) end -= 1;
  let current = 0;
  for (let i = end; i >= 0 && days[i].count > 0; i--) current++;
  // longest streak
  let longest = 0, run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  return { weeks, total, currentStreak: current, longestStreak: longest };
}

async function main() {
  // 1. contribution calendar
  const calHtml = await (await get(`https://github.com/users/${USER}/contributions`, 'text/html')).text();
  const cal = parseCalendar(calHtml);
  console.log(`[oss] calendar: ${cal.total} contributions, streak ${cal.currentStreak}/${cal.longestStreak}`);
  await sleep(1000);

  // 2. all authored PRs (open + closed + merged)
  const search = await (await get(
    `https://api.github.com/search/issues?q=author:${USER}+type:pr&per_page=50&sort=created&order=desc`
  )).json();
  const items = search.items ?? [];
  console.log(`[oss] PRs: ${search.total_count} total, fetched ${items.length}`);

  // 3. repo details (stars) for unique repos
  const repoUrls = [...new Set(items.map((i) => i.repository_url))].slice(0, 15);
  const repoInfo = {};
  for (const url of repoUrls) {
    try {
      const r = await (await get(url)).json();
      repoInfo[url] = { repo: r.full_name, stars: r.stargazers_count ?? 0 };
      console.log(`[oss] repo ${r.full_name} ★${r.stargazers_count}`);
    } catch (e) {
      console.warn(`[oss] repo fetch failed: ${url} (${e.message})`);
    }
    await sleep(1000);
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

  const out = {
    updatedAt: new Date().toISOString(),
    user: USER,
    totalContributions: cal.total,
    currentStreak: cal.currentStreak,
    longestStreak: cal.longestStreak,
    weeks: cal.weeks,
    stats: { prsTotal: search.total_count, prsMerged: merged, prsOpen: open, reposCount: Object.keys(byRepo).length },
    topRepos,
    prs,
  };
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`[oss] wrote ${OUT}`);
}

try {
  await main();
} catch (e) {
  console.error(`[oss] FAILED: ${e.message}`);
  if (existsSync(OUT)) {
    console.log('[oss] keeping existing oss.json so the build survives');
    const stale = JSON.parse(readFileSync(OUT, 'utf8'));
    stale.stale = true;
    writeFileSync(OUT, JSON.stringify(stale, null, 2));
  } else {
    writeFileSync(OUT, JSON.stringify({
      updatedAt: new Date().toISOString(), user: USER, totalContributions: 0,
      currentStreak: 0, longestStreak: 0, weeks: [], stats: { prsTotal: 0, prsMerged: 0, prsOpen: 0, reposCount: 0 },
      topRepos: [], prs: [], stale: true,
    }, null, 2));
    console.log('[oss] wrote empty skeleton oss.json');
  }
}
