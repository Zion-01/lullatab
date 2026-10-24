# Lullatab store listing

Copy these into each store's form. The same text works in every store.

## Name

Lullatab

## Short description / summary (max 132 characters)

Cuts your browser's memory use by putting tabs you aren't using to sleep.

## Category

- Chrome Web Store: **Productivity → Tools**
- Edge Add-ons: **Productivity**
- Firefox Add-ons: **Tabs**
- Opera add-ons: **Productivity**

## Full description

> Too many tabs slowing your computer down? Lullatab puts the tabs you
> aren't using to sleep, so your browser gives memory back to the rest of
> your computer.
>
> A sleeping tab stays right where it was in your tab bar, with its title and
> icon. Click it and it wakes up and reloads. Nothing to restore, nothing lost
> in a list somewhere.
>
> WHAT IT DOES
> • Auto-sleep: tabs you haven't looked at for 30 minutes go to sleep on
>   their own. Pick anything from 5 minutes to 4 hours.
> • Sleep all background tabs with one click.
> • Close duplicate tabs: finds tabs open on the same page and closes the
>   extras.
> • See how much of your computer's memory is in use (Chrome, Edge, Brave,
>   Opera and Vivaldi).
> • The toolbar badge shows how many tabs are asleep.
>
> NEVER SLEEPS WHAT YOU NEED
> • The tab you're looking at
> • Pinned tabs and tabs playing audio (you can change this)
> • Sites you mark "Keep awake", like your email or a document you're writing
>
> PRIVATE BY DESIGN
> Lullatab uses the browser's own built-in tab sleeping. It never reads page
> content, never changes pages, has no account, no analytics, and sends
> nothing anywhere. Everything stays on your computer.
>
> Tip: a page reloads when it wakes, so unsent text in a form could be lost.
> Add sites where you write long things to "Keep awake".

## Screenshots and images (in `store/images/`)

| File | Size | Used by |
| --- | --- | --- |
| `screenshot-1-overview.png` | 1280×800 | All stores |
| `screenshot-2-dark.png` | 1280×800 | All stores |
| `screenshot-3-settings.png` | 1280×800 | All stores |
| `promo-small-440x280.png` | 440×280 | Chrome Web Store (small promo tile), Edge |
| `promo-marquee-1400x560.png` | 1400×560 | Chrome Web Store (marquee, optional) |
| `logo-300.png` | 300×300 | Edge (store logo) |
| `../icons/icon128.png` | 128×128 | Chrome Web Store (store icon) |

## Chrome Web Store: privacy practices tab

**Single purpose**

> Lullatab reduces browser memory use by putting inactive tabs to sleep
> (discarding them) and helping users close duplicate tabs.

**Permission justifications**

| Permission | Justification |
| --- | --- |
| `tabs` | Needed to see each tab's title, address, pinned and audio state so the popup can list them, skip protected tabs, find duplicates, and put idle tabs to sleep with tabs.discard. Tab information never leaves the device. |
| `storage` | Saves the user's settings (idle time, sites to keep awake) and when each tab was last used, locally in the browser. |
| `alarms` | Runs a check once a minute to find tabs that have been idle longer than the user's chosen time. |
| `system.memory` | Shows the user how much of their computer's memory is in use, so they can see the effect of sleeping tabs. |

**Remote code:** No, I am not using remote code.

**Data usage:** tick **none** of the data types. Then tick all three
certifications (no selling data, no unrelated use, no creditworthiness use).

**Privacy policy URL:** https://github.com/Zion-01/lullatab/blob/main/PRIVACY.md

## Links (all stores)

| Field | Link |
| --- | --- |
| Privacy policy | https://github.com/Zion-01/lullatab/blob/main/PRIVACY.md |
| Homepage / website | https://github.com/Zion-01/lullatab |
| Support | https://github.com/Zion-01/lullatab/issues |

## Firefox Add-ons (AMO) extras

- **License:** you choose. MIT is a common, permissive choice for a free
  extension. AMO asks for this when you submit.
- **Source code:** not needed. Nothing is minified or bundled.
- **Notes to reviewer:**

  > No build step: the package is the plain source. The memory gauge uses
  > chrome.system.memory only when it exists, so it is hidden in Firefox
  > (that is what the two UNSUPPORTED_API lint warnings refer to).
  > To test: open several tabs, set "Sleep tabs after" to 5 minutes, or
  > click "Sleep N background tabs now" in the popup.
