# Publishing Lullatab

Two store listings cover every supported browser:

| Store | Reaches | Cost | Package |
| --- | --- | --- | --- |
| Chrome Web Store | Chrome, Brave, Vivaldi, Arc, and Opera (Opera can install from it) | $5 one-time | `dist/lullatab-chromium-*.zip` |
| Firefox Add-ons (AMO) | Firefox | Free | `dist/lullatab-firefox-*.zip` |
| Edge Add-ons (recommended) | Edge (Edge can also install from the Chrome Web Store, but most Edge users search their own store) | Free | `dist/lullatab-chromium-*.zip` |
| Opera add-ons (optional) | Opera | Free | `dist/lullatab-chromium-*.zip` |

All the text to paste is in [store/listing.md](store/listing.md), and the
images are in [store/images](store/images).

## 0. Before you start

1. **Build the packages** (run again after any code change, and bump
   `version` in `manifest.json` first for updates):

   ```
   python build.py
   ```

2. **Privacy policy, homepage and support links** are already online in the
   public GitHub repository. They're listed under "Links" in
   [store/listing.md](store/listing.md):
   - Privacy policy: https://github.com/Zion-01/lullatab/blob/main/PRIVACY.md
   - Homepage: https://github.com/Zion-01/lullatab
   - Support: https://github.com/Zion-01/lullatab/issues

3. **Decide which email address stores show publicly** as the developer
   contact. A separate address just for this is a good idea.

## 1. Chrome Web Store

1. Go to the Chrome Web Store Developer Dashboard
   (chrome.google.com/webstore/devconsole) and sign in with a Google
   account. You'll need 2-step verification turned on.
2. Pay the one-time $5 registration fee and verify your contact email.
3. In **Account**, choose whether you're a *trader* (selling or acting as a
   business) or a *non-trader* (a hobby project). This is an EU rule; for a
   free personal project, non-trader is usual.
4. Click **New item** and upload `dist/lullatab-chromium-*.zip`.
5. **Store listing** tab: paste the description, pick the category, upload
   the 128px icon, the 3 screenshots and the 440×280 promo tile.
6. **Privacy practices** tab: paste the single purpose and the four
   permission justifications from `store/listing.md`, answer *no remote
   code*, tick no data types, tick the three certifications, and add your
   privacy policy link.
7. **Distribution**: Public, all regions.
8. Click **Submit for review**. Reviews usually take a few days; you get an
   email when it's live.

## 2. Firefox Add-ons (addons.mozilla.org)

1. Go to addons.mozilla.org/developers and sign in or create a Mozilla
   account (free).
2. Click **Submit a New Add-on** → **On this site** (public listing).
3. Upload `dist/lullatab-firefox-*.zip`. The automatic check will show two
   warnings about `system.memory`; that is expected (see the reviewer notes
   in `store/listing.md`).
4. Answer **No** to "Do you need to submit source code?" (nothing is minified).
5. Fill in the listing: name, summary, description, category **Tabs**, a
   license, privacy policy, and the reviewer notes. Upload the screenshots.
6. Submit. Mozilla often approves within a day, sometimes after a later
   manual review.

The add-on ID `lullatab@inventions.local` in `manifest.json` becomes
permanent once you submit, so don't change it afterwards.

## 3. Edge Add-ons

1. Go to Partner Center (partner.microsoft.com/dashboard/microsoftedge) and
   sign in with a personal Microsoft account (or GitHub). Registering is
   free; pick **Individual**.
2. Click **Create new extension** and upload `dist/lullatab-chromium-*.zip`.
3. **Availability**: Public, all markets.
4. **Properties**: category Productivity, privacy policy link, website and
   support links.
5. **Store listings** → English: description, the 300×300 `logo-300.png`,
   the 440×280 promo tile and the screenshots.
6. Submit. Microsoft's review can take up to about a week.

## 4. Opera add-ons (optional)

Opera users can already install Lullatab from the Chrome Web Store, and
Opera's own store reviews are known to take weeks or months. If you still
want a listing there: sign in at addons.opera.com/developer, upload the
Chromium zip, then fill in the **General**, **Media** and **Translations**
tabs for the version and submit.

## Updating later

1. Change the code and bump `version` in `manifest.json` (for example 1.1.0 →
   1.2.0). Stores reject an upload whose version isn't higher.
2. Run `python build.py`.
3. Upload the new zip to each store's existing listing (Chrome: **Package →
   Upload new package**; Firefox: **Upload new version**; Edge: **Packages →
   Replace**), then submit.
