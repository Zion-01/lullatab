// Shared logic for the background worker and the popup.

export const DEFAULTS = {
  enabled: true,
  idleMinutes: 30,
  skipPinned: true,
  skipAudible: true,
  whitelist: [],
};

export function getSettings() {
  return chrome.storage.sync.get(DEFAULTS);
}

export function saveSettings(changes) {
  return chrome.storage.sync.set(changes);
}

// When each tab was last in use, keyed by tab id. Session storage survives
// service-worker restarts but is cleared when the browser closes, which is
// what we want: restored tabs start with a fresh clock.
export async function getLastActive() {
  const { lastActive = {} } = await chrome.storage.session.get('lastActive');
  return lastActive;
}

export function setLastActive(lastActive) {
  return chrome.storage.session.set({ lastActive });
}

export async function getSleptCount() {
  const { sleptCount = 0 } = await chrome.storage.local.get('sleptCount');
  return sleptCount;
}

export function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export function isWhitelisted(url, whitelist) {
  const host = hostOf(url);
  return !!host && whitelist.some((d) => host === d || host.endsWith('.' + d));
}

// Returns why a tab must not be put to sleep automatically, or null if it can.
export function autoSleepBlocker(tab, settings) {
  if (tab.active) return 'In use';
  if (tab.discarded) return 'Asleep';
  if (!/^https?:/.test(tab.url || '')) return 'Browser page';
  if (tab.status === 'loading') return 'Loading';
  if (tab.autoDiscardable === false) return 'Protected';
  if (settings.skipPinned && tab.pinned) return 'Pinned';
  if (settings.skipAudible && tab.audible) return 'Playing audio';
  if (isWhitelisted(tab.url, settings.whitelist)) return 'Kept awake';
  return null;
}

export function canSleepManually(tab) {
  return !tab.active && !tab.discarded;
}

export async function sleepTab(tabId) {
  try {
    // Chrome resolves with the discarded tab (possibly under a new id),
    // Firefox with nothing, so look the tab up to see whether it worked.
    const result = await chrome.tabs.discard(tabId);
    const tab = await chrome.tabs.get(result?.id ?? tabId);
    if (!tab.discarded) return null;
    const count = await getSleptCount();
    await chrome.storage.local.set({ sleptCount: count + 1 });
    return tab;
  } catch {
    return null;
  }
}

// Tabs showing the same page as another tab. For each group we keep the
// active tab, else a pinned one, else the first one (tabs.query returns tabs
// in window and tab-strip order), and return the rest.
export function findDuplicates(tabs) {
  const groups = new Map();
  for (const tab of tabs) {
    if (!/^https?:/.test(tab.url || '')) continue;
    const key = tab.url.split('#')[0];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(tab);
  }
  const extras = [];
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const keep = group.find((t) => t.active) || group.find((t) => t.pinned) || group[0];
    extras.push(...group.filter((t) => t !== keep && !t.pinned));
  }
  return extras;
}
