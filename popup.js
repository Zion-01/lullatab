import {
  autoSleepBlocker,
  canSleepManually,
  findDuplicates,
  getLastActive,
  getSettings,
  getSleptCount,
  hostOf,
  isWhitelisted,
  saveSettings,
  sleepTab,
} from './lib.js';

const $ = (id) => document.getElementById(id);
let settings;

function formatIdle(ms) {
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `idle ${min} min`;
  const h = Math.floor(min / 60);
  return `idle ${h} h${min % 60 ? ` ${min % 60} min` : ''}`;
}

async function renderMemory() {
  // Firefox has no system.memory API, so the gauge is Chromium-only.
  if (!chrome.system?.memory) {
    $('memory').hidden = true;
    return;
  }
  try {
    const { capacity, availableCapacity } = await chrome.system.memory.getInfo();
    const used = capacity - availableCapacity;
    const pct = Math.round((used / capacity) * 100);
    const gb = (b) => (b / 1024 ** 3).toFixed(1);
    $('mem-text').textContent = `${gb(used)} / ${gb(capacity)} GB (${pct}%)`;
    const bar = $('mem-bar');
    bar.style.width = `${pct}%`;
    bar.classList.toggle('high', pct >= 75 && pct < 90);
    bar.classList.toggle('critical', pct >= 90);
  } catch {
    $('mem-text').textContent = 'unavailable';
  }
}

function tabRow(tab, lastActive, now) {
  const li = document.createElement('li');

  const icon = document.createElement('img');
  icon.src = tab.favIconUrl || 'icons/icon16.png';
  icon.alt = '';
  icon.onerror = () => (icon.src = 'icons/icon16.png');

  const info = document.createElement('div');
  info.className = 'tab-info';
  info.title = 'Go to this tab';
  info.onclick = async () => {
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  };

  const title = document.createElement('div');
  title.className = 'tab-title';
  title.textContent = tab.title || tab.url;

  const meta = document.createElement('div');
  meta.className = 'tab-meta';
  const host = /^https?:/.test(tab.url || '') ? hostOf(tab.url) : '';
  // The reason a tab won't auto-sleep goes before the idle time so it
  // survives truncation.
  const blocker = settings.enabled ? autoSleepBlocker(tab, settings) : 'Auto-sleep off';
  if (host) meta.append(`${host} · `);
  if (blocker) {
    const b = document.createElement('span');
    b.className = 'blocked';
    b.textContent = `${blocker} · `;
    meta.append(b);
  }
  meta.append(formatIdle(now - (lastActive[tab.id] ?? now)));
  meta.title = meta.textContent;
  info.append(title, meta);
  li.append(icon, info);

  if (host) {
    const kept = isWhitelisted(tab.url, settings.whitelist);
    const keep = document.createElement('button');
    keep.className = 'row-btn link';
    keep.textContent = kept ? 'Allow sleep' : 'Keep awake';
    keep.title = kept ? `Let ${host} sleep again` : `Never auto-sleep ${host}`;
    keep.onclick = () => toggleWhitelist(host, kept);
    li.append(keep);
  }

  const sleep = document.createElement('button');
  sleep.className = 'row-btn';
  sleep.textContent = 'Sleep';
  sleep.onclick = async () => {
    sleep.disabled = true;
    await sleepTab(tab.id);
    render();
  };
  li.append(sleep);
  return li;
}

async function toggleWhitelist(host, kept) {
  const whitelist = kept
    ? settings.whitelist.filter((d) => d !== host && !host.endsWith('.' + d))
    : [...settings.whitelist, host];
  await saveSettings({ whitelist });
  render();
}

function renderSettings() {
  $('enabled').checked = settings.enabled;
  $('idleMinutes').value = String(settings.idleMinutes);
  $('skipPinned').checked = settings.skipPinned;
  $('skipAudible').checked = settings.skipAudible;
  if (document.activeElement !== $('whitelist')) {
    $('whitelist').value = settings.whitelist.join('\n');
  }
}

async function render() {
  const [tabs, lastActive, sleptCount] = await Promise.all([
    chrome.tabs.query({}),
    getLastActive(),
    getSleptCount(),
  ]);
  settings = await getSettings();
  const now = Date.now();

  const asleep = tabs.filter((t) => t.discarded);
  const awake = tabs.filter((t) => !t.discarded);
  $('stat-open').textContent = tabs.length;
  $('stat-awake').textContent = awake.length;
  $('stat-asleep').textContent = asleep.length;
  $('stat-total').textContent = sleptCount;

  const background = awake
    .filter((t) => canSleepManually(t))
    .sort((a, b) => (lastActive[a.id] ?? now) - (lastActive[b.id] ?? now));

  const list = $('tab-list');
  list.replaceChildren(...background.map((t) => tabRow(t, lastActive, now)));
  $('empty').hidden = background.length > 0;

  const sleepable = background.filter((t) => !autoSleepBlocker(t, settings));
  $('sleep-all').disabled = sleepable.length === 0;
  $('sleep-all').textContent = sleepable.length
    ? `Sleep ${sleepable.length} background tab${sleepable.length === 1 ? '' : 's'} now`
    : 'No tabs to put to sleep';

  const dupes = findDuplicates(tabs);
  $('close-dupes').hidden = dupes.length === 0;
  $('close-dupes').textContent = `Close ${dupes.length} duplicate tab${dupes.length === 1 ? '' : 's'}`;

  renderSettings();
  renderMemory();
}

$('sleep-all').onclick = async () => {
  $('sleep-all').disabled = true;
  const tabs = await chrome.tabs.query({});
  // Pinned, audio and kept-awake tabs are respected even when sleeping manually.
  for (const tab of tabs) {
    if (!autoSleepBlocker(tab, settings)) await sleepTab(tab.id);
  }
  render();
};

$('close-dupes').onclick = async () => {
  const dupes = findDuplicates(await chrome.tabs.query({}));
  await chrome.tabs.remove(dupes.map((t) => t.id));
  render();
};

$('enabled').onchange = (e) => saveSettings({ enabled: e.target.checked }).then(render);
$('idleMinutes').onchange = (e) => saveSettings({ idleMinutes: Number(e.target.value) }).then(render);
$('skipPinned').onchange = (e) => saveSettings({ skipPinned: e.target.checked }).then(render);
$('skipAudible').onchange = (e) => saveSettings({ skipAudible: e.target.checked }).then(render);
$('whitelist').onchange = (e) => {
  const whitelist = e.target.value
    .split('\n')
    .map((line) => hostOf(line.includes('://') ? line.trim() : `https://${line.trim()}`))
    .filter(Boolean);
  saveSettings({ whitelist }).then(render);
};

render();
// Keep the idle times and memory reading fresh while the popup is open.
setInterval(render, 5000);
