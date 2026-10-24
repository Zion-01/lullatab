import {
  autoSleepBlocker,
  getLastActive,
  getSettings,
  setLastActive,
  sleepTab,
} from './lib.js';

const CHECK_ALARM = 'check-idle-tabs';

// Run storage read-modify-write steps one at a time so events don't clobber
// each other's updates to the lastActive map.
let queue = Promise.resolve();
function serial(fn) {
  queue = queue.then(fn).catch((err) => console.error('Lunatab:', err));
  return queue;
}

async function stamp(tabId) {
  const last = await getLastActive();
  last[tabId] = Date.now();
  await setLastActive(last);
}

async function checkTabs() {
  const settings = await getSettings();
  const tabs = await chrome.tabs.query({});
  const last = await getLastActive();
  const now = Date.now();

  const open = new Set(tabs.map((t) => String(t.id)));
  for (const id of Object.keys(last)) {
    if (!open.has(id)) delete last[id];
  }

  for (const tab of tabs) {
    // Active tabs are restamped every check, so a tab's idle clock starts
    // (to within a minute) from when you switched away from it.
    if (tab.active || !(tab.id in last)) {
      last[tab.id] = now;
      continue;
    }
    if (!settings.enabled || autoSleepBlocker(tab, settings)) continue;
    if (now - last[tab.id] >= settings.idleMinutes * 60_000) {
      await sleepTab(tab.id);
    }
  }

  await setLastActive(last);
  await updateBadge();
}

async function updateBadge() {
  const tabs = await chrome.tabs.query({});
  const asleep = tabs.filter((t) => t.discarded).length;
  await chrome.action.setBadgeBackgroundColor({ color: '#5b5bd6' });
  await chrome.action.setBadgeText({ text: asleep ? String(asleep) : '' });
}

async function ensureAlarm() {
  if (!(await chrome.alarms.get(CHECK_ALARM))) {
    await chrome.alarms.create(CHECK_ALARM, { periodInMinutes: 1 });
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === CHECK_ALARM) serial(checkTabs);
});

chrome.tabs.onActivated.addListener(({ tabId }) => serial(() => stamp(tabId)));
chrome.tabs.onCreated.addListener((tab) => serial(() => stamp(tab.id)));

chrome.tabs.onRemoved.addListener((tabId) =>
  serial(async () => {
    const last = await getLastActive();
    delete last[tabId];
    await setLastActive(last);
    await updateBadge();
  })
);

// Some Chrome versions give a discarded tab a new id.
chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) =>
  serial(async () => {
    const last = await getLastActive();
    if (removedTabId in last) last[addedTabId] = last[removedTabId];
    delete last[removedTabId];
    await setLastActive(last);
  })
);

chrome.tabs.onUpdated.addListener((tabId, info) => {
  if ('discarded' in info) serial(() => updateBadge());
});

chrome.runtime.onInstalled.addListener(() => serial(checkTabs));
chrome.runtime.onStartup.addListener(() => serial(checkTabs));
ensureAlarm();
