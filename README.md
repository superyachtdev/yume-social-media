# yume-social-media

Automated Instagram carousels for [@yumebynyara](https://www.instagram.com/yumebynyara) (Yume by Nyara, [nyarastays.co](https://nyarastays.co/locations/yume.html)).

Two posts a day, **09:00 and 20:00 Europe/Madrid**. No music.

## How it works

1. A daily Claude scheduled task writes the next posts as `posts/<YYYY-MM-DD-HHMM-topic>/post.json` and pushes them.
2. The GitHub Action (`.github/workflows/build-and-schedule.yml`) runs on that push:
   - finds each slide photo (Wikimedia Commons file or search, or a direct URL) and writes the photo credit from its licence,
   - renders the 7 slides (1080×1350) in headless Chrome with `scripts/renderer.js` into `posts/<id>/slides/`,
   - commits the slides, then schedules the post in Zernio with their public GitHub links,
   - writes `posts/<id>/zernio.json` so a post is never scheduled twice.

A post folder with `zernio.json` is done. To redo one, delete it from Zernio and from the folder.

## Setup

- Repo secret `ZERNIO_API_KEY` (Settings → Secrets and variables → Actions).
- The repo must stay public, because Zernio fetches the slides from `raw.githubusercontent.com`.

## post.json

```json
{
  "scheduled_for": "2026-11-28T20:00:00",
  "timezone": "Europe/Madrid",
  "topic_slug": "temple-etiquette",
  "caption": "Hook line…\n\n05 …\n…\nLink in bio to book your stay in Bali.\n\n#bali …",
  "slides": [
    {"kind": "hook", "img": "commons:File:Example.jpg", "credit_place": "Uluwatu",
     "eyebrow": "ULUWATU · SAVE FOR YOUR TRIP", "h1": "5 Bali beaches", "h1it": "most people walk right past.",
     "sub": "Number 1 is four minutes from our gate."},
    {"kind": "item", "img": "search:Green Bowl beach Bali", "credit_place": "Green Bowl", "fy": 0.35,
     "num": "05", "place": "GREEN BOWL · UNGASAN", "h1": "Why the", "h1it": "name?",
     "answer": "Look down at low tide.", "body": "Two or three short sentences."},
    {"kind": "cta", "img": "https://nyarastays.co/assets/images/yume/villas/villa-dua-main.jpg",
     "credit": "Villa Dua, Yume by Nyara, Bingin", "eyebrow": "NOW YOU KNOW WHERE TO SWIM",
     "h1": "Come home", "h1it": "to Yume.", "body": "One-line pitch.", "button": "Link in bio to book your stay in Bali"}
  ]
}
```

- `img`: `commons:File:<name>` (exact Commons file), `search:<words>` (first suitable openly licensed Commons photo), an `https://` URL, or a repo path.
- Photo credits for Commons images are written automatically (`credit_place` is put in front). Give `credit` yourself for any other photo.
- `fy` (0–1) moves the photo crop up or down.

Run locally: `pip install playwright requests && python scripts/build.py --render-only <post-folder>`.
