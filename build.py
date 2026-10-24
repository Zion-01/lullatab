"""Build store-ready zips for Lunatab.

    python build.py

Writes dist/lunatab-chromium-<version>.zip (Chrome Web Store, Edge Add-ons,
Opera add-ons) and dist/lunatab-firefox-<version>.zip (addons.mozilla.org).
The shared manifest.json loads unpacked in every browser; each zip gets a
manifest with the other browser family's entries removed.
"""

import copy
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"
FILES = [
    "background.js",
    "lib.js",
    "popup.html",
    "popup.css",
    "popup.js",
    "icons/icon16.png",
    "icons/icon32.png",
    "icons/icon48.png",
    "icons/icon128.png",
]


def chromium_manifest(base):
    m = copy.deepcopy(base)
    m["background"].pop("scripts")
    m.pop("browser_specific_settings")
    return m


def firefox_manifest(base):
    m = copy.deepcopy(base)
    m["background"].pop("service_worker")
    m.pop("minimum_chrome_version")
    # Firefox has no system.memory API; the popup hides the gauge without it.
    m["permissions"] = [p for p in m["permissions"] if p != "system.memory"]
    return m


def build(name, manifest):
    DIST.mkdir(exist_ok=True)
    out = DIST / f"lunatab-{name}-{manifest['version']}.zip"
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("manifest.json", json.dumps(manifest, indent=2) + "\n")
        for f in FILES:
            z.write(ROOT / f, f)
    # Unversioned copy for GitHub releases, so the README's
    # releases/latest/download/... links keep working across versions.
    latest = DIST / f"lunatab-{name}.zip"
    latest.write_bytes(out.read_bytes())
    print(f"built {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
    return out


if __name__ == "__main__":
    base = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    build("chromium", chromium_manifest(base))
    build("firefox", firefox_manifest(base))
