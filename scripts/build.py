#!/usr/bin/env python3
"""Build and schedule Yume carousels.

For every posts/<id>/post.json that has no zernio.json yet:
  1. resolve each slide photo (Wikimedia Commons file/search, URL or repo file) and build its credit,
  2. render the 7 slides in headless Chrome with scripts/renderer.js -> posts/<id>/slides/NN.jpg,
  3. (unless --render-only) commit + push the slides, then create the scheduled Instagram post in
     Zernio using the public raw.githubusercontent.com URLs, and commit zernio.json.

Env: ZERNIO_API_KEY, GITHUB_REPOSITORY (owner/repo), optional CHROME_CHANNEL (default "chrome").
"""
import base64, datetime as dt, html, json, os, re, subprocess, sys, urllib.parse
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

ROOT = Path(__file__).resolve().parent.parent
POSTS = ROOT / "posts"
UA = {"User-Agent": "YumeCarouselBot/1.0 (https://github.com/superyachtdev/yume-social-media)"}
IG_ACCOUNT = "6b098d899a69aff68dd0c525"
ZERNIO = "https://zernio.com/api/v1"
ALLOWED = re.compile(r"^(CC0|Public domain|PD.*|CC BY(-SA)? [0-9.]+.*|CC BY [0-9.]+)$", re.I)


def log(*a):
    print(*a, flush=True)


def commons_info(title=None, search=None):
    params = {"action": "query", "format": "json", "prop": "imageinfo",
              "iiprop": "url|size|mime|extmetadata", "iiurlwidth": 1600}
    if title:
        params["titles"] = title if title.startswith("File:") else "File:" + title
    else:
        params.update({"generator": "search", "gsrnamespace": 6, "gsrlimit": 15, "gsrsearch": search})
    r = requests.get("https://commons.wikimedia.org/w/api.php", params=params, headers=UA, timeout=30)
    r.raise_for_status()
    pages = list((r.json().get("query") or {}).get("pages", {}).values())
    pages.sort(key=lambda p: p.get("index", 0))
    for p in pages:
        if "imageinfo" not in p:
            continue
        ii = p["imageinfo"][0]
        m = ii.get("extmetadata", {})
        lic = (m.get("LicenseShortName") or {}).get("value", "")
        if ii.get("mime") not in ("image/jpeg", "image/png") or ii.get("width", 0) < 1000:
            continue
        if not ALLOWED.match(lic.strip()):
            continue
        artist = re.sub(r"<[^>]+>", "", (m.get("Artist") or {}).get("value", "")).strip() or "Unknown"
        artist = re.sub(r"\s+", " ", html.unescape(artist))[:60]
        return {"url": ii.get("thumburl") or ii["url"], "artist": artist, "licence": lic.strip(), "title": p["title"]}
    raise RuntimeError(f"No usable openly licensed image for {title or search!r}")


def fetch_data_url(url):
    if url.startswith(("http://", "https://")):
        r = requests.get(url, headers=UA, timeout=60)
        r.raise_for_status()
        data, mime = r.content, r.headers.get("content-type", "image/jpeg").split(";")[0]
    else:
        p = (ROOT / url).resolve()
        data, mime = p.read_bytes(), "image/png" if p.suffix.lower() == ".png" else "image/jpeg"
    return f"data:{mime};base64," + base64.b64encode(data).decode()


def resolve_slides(post):
    slides = []
    for s in post["slides"]:
        s = dict(s)
        src = s["img"]
        info = None
        if src.startswith("commons:"):
            info = commons_info(title=src[len("commons:"):].strip())
        elif src.startswith("search:"):
            info = commons_info(search=src[len("search:"):].strip())
        if info:
            s["img"] = info["url"]
            if "credit" not in s:
                place = s.get("credit_place", "").strip()
                s["credit"] = (place + ". " if place else "") + f"Photo: {info['artist']}, {info['licence']}, via Wikimedia Commons"
            s["_source"] = info["title"]
        s.setdefault("credit", s.get("credit_place", "Yume by Nyara, Bingin"))
        log("  photo:", s.get("_source", s["img"]))
        s["img"] = fetch_data_url(s["img"])
        slides.append(s)
    return slides


def render(slides, out_dir):
    from playwright.sync_api import sync_playwright
    renderer = (ROOT / "scripts" / "renderer.js").read_text()
    page_html = ("<!doctype html><html><head><meta charset='utf-8'>"
                 "<link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Manrope:wght@400;500;600&display=swap'>"
                 "</head><body><span style=\"font-family:'Cormorant Garamond'\">a</span><i style=\"font-family:'Cormorant Garamond'\">a</i><span style='font-family:Manrope'>a</span></body></html>")
    out_dir.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        channel = os.environ.get("CHROME_CHANNEL", "chrome")
        browser = p.chromium.launch(channel=channel or None)
        page = browser.new_page()
        page.set_content(page_html, wait_until="networkidle")
        page.add_script_tag(content=renderer)
        fonts = page.evaluate("window.__yume.fonts()")
        log("  fonts loaded:", fonts)
        n = page.evaluate("(s) => window.__yume.renderAll(s)", slides)
        urls = page.evaluate("window.__yume.exportAll(0.9)")
        browser.close()
    files = []
    for i, u in enumerate(urls, 1):
        f = out_dir / f"{i:02d}.jpg"
        f.write_bytes(base64.b64decode(u.split(",", 1)[1]))
        files.append(f)
    log(f"  rendered {n} slides -> {out_dir.relative_to(ROOT)}")
    return files


def git(*args):
    subprocess.run(["git", *args], cwd=ROOT, check=True)


def commit_push(paths, msg):
    git("add", *[str(p) for p in paths])
    if subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=ROOT).returncode == 0:
        return
    git("commit", "-m", msg)
    git("pull", "--rebase", "origin", "HEAD")
    git("push", "origin", "HEAD")


def schedule(post_id, post, files):
    tz = post.get("timezone", "Europe/Madrid")
    when = dt.datetime.fromisoformat(post["scheduled_for"]).replace(tzinfo=ZoneInfo(tz))
    if when < dt.datetime.now(ZoneInfo(tz)) - dt.timedelta(minutes=10):
        raise RuntimeError(f"{post_id}: scheduled_for {when} is in the past; not posting")
    repo = os.environ["GITHUB_REPOSITORY"]
    sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()
    media = [{"type": "image", "url": f"https://raw.githubusercontent.com/{repo}/{sha}/{f.relative_to(ROOT).as_posix()}"} for f in files]
    body = {"content": post["caption"], "mediaItems": media,
            "platforms": [{"platform": "instagram", "accountId": post.get("account_id", IG_ACCOUNT)}],
            "scheduledFor": post["scheduled_for"], "timezone": tz,
            "tags": ["yume-carousel", post.get("topic_slug", post_id)], "externalId": post_id}
    r = requests.post(f"{ZERNIO}/posts", json=body, timeout=120,
                      headers={"Authorization": f"Bearer {os.environ['ZERNIO_API_KEY']}", "Idempotency-Key": "yume-" + post_id})
    if r.status_code >= 300:
        raise RuntimeError(f"Zernio {r.status_code}: {r.text[:500]}")
    data = r.json().get("post", r.json())
    return {"zernio_post_id": data.get("_id"), "status": data.get("status"),
            "scheduled_for": post["scheduled_for"], "timezone": tz, "media": [m["url"] for m in media]}


def main():
    render_only = "--render-only" in sys.argv
    only = [a for a in sys.argv[1:] if not a.startswith("--")]
    failures = 0
    for pj in sorted(POSTS.glob("*/post.json")):
        d = pj.parent
        if only and d.name not in only:
            continue
        if (d / "zernio.json").exists() and not render_only:
            continue
        log(f"== {d.name}")
        try:
            post = json.loads(pj.read_text())
            assert len(post["slides"]) >= 3 and post["caption"].strip()
            files = render(resolve_slides(post), d / "slides")
            if render_only:
                continue
            commit_push(files, f"Render slides for {d.name}")
            result = schedule(d.name, post, files)
            (d / "zernio.json").write_text(json.dumps(result, indent=2) + "\n")
            commit_push([d / "zernio.json"], f"Scheduled {d.name} in Zernio")
            log("  scheduled:", result["zernio_post_id"], result["status"])
        except Exception as e:  # keep going with other posts, fail the run at the end
            failures += 1
            log(f"  FAILED: {e}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
