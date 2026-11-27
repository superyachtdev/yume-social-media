# Yume carousel playbook (@yumebynyara)

Automated Instagram carousels for Yume by Nyara (nyarastays.co/locations/yume.html). Two posts a day: **09:00 and 20:00 Europe/Madrid time** (the user wants Europe time). No music. Instagram only for now (TikTok not connected in Zernio).

## Brand facts (only use these about Yume)
- Yume by Nyara: three standalone clifftop villas above Bingin, Uluwatu, Bali, each with its own gate and private pool. From USD 135/night, 3-night minimum.
- Villa Tiga (1 bed, sleeps 2, USD 135), Villa Satu (2 bed, sleeps 3, USD 320), Villa Dua (2 bed, sleeps 4, largest, big garden + pool, USD 380). Pair villas for groups of 5+.
- Impossible Beach ~4 min walk; Bingin ~10 min walk. Arrival drinks, daily housekeeping, 500 Mbps fibre, in-villa Thai massage (2 days' notice), bougainvillea + frangipani gardens.
- Voice: calm, unhurried, warm, short sentences, British spelling. Never hard-sell.
- CTA on the last slide: "Link in bio to book your stay in Bali".
- Own photos (public): https://nyarastays.co/assets/images/yume/yume-drone-hero.jpg, .../yume/villas/villa-(tiga|satu|dua)-(main|a|b|c).jpg, .../yume/(781406037|352665482|352682722|352682723|352684018|352682726|352684021|411713773).jpg

## Format (Boplo-style list carousel, Nyara look)
7 slides, 1080x1350:
1. Hook (kind "hook"): full-bleed photo, dark fade, eyebrow + big serif headline with italic second half + teaser line ("Number 1 is…", "Save this for…").
2-6. Items counting down N° 05 → N° 01 (kind "item"): photo top, cream panel, place label, question headline (italic end), short answer in italic brown, 2-3 sentence body, photo credit.
7. CTA (kind "cta"): Yume villa photo, "Come home *to Yume.*" style headline, one-line pitch, button "Link in bio to book your stay in Bali".
Make item N° 01 tie back to Yume where honest (near Bingin/Uluwatu), so the CTA follows naturally.
Fonts: Cormorant Garamond + Manrope. Colours: #0F0F0F, #4A3A2C, #F0EEE9, #5C5C5C.

## Content rules
- Travel-adjacent Bali content for people planning a trip (beaches, etiquette, food, day trips, surf, sunsets, seasons, costs, packing, myths, Uluwatu/Bukit focus). Facts must be checked with web search before use; no invented numbers.
- Photos: Wikimedia Commons via the API (search, check licence). Prefer CC0 / public domain / CC BY; avoid CC BY-SA if a good alternative exists. Credit every non-Yume photo on its slide: "Place. Photo: Author, LICENCE, via Wikimedia Commons". Use thumb URLs at 1280px (thumb.wikimedia.org/.../1280px-...). Never use photos of identifiable private people as the subject.
- Never repeat a topic in the log below or in Zernio posts tagged yume-carousel.
- Caption: hook line, the 5 items as a short list (05→01), one Yume line + "Link in bio to book your stay in Bali.", 6-10 hashtags.

## Pipeline
Write `posts/<YYYY-MM-DD-HHMM-topic-slug>/post.json` (format in README.md) and push to `main`. The GitHub Action renders the slides and schedules the post in Zernio. Every folder under `posts/` is a past or queued topic: never repeat one.

## Photos
Use `commons:File:<exact name>` once you have checked the file exists and shows the right place, or `search:<place> Bali` to let the Action pick the first openly licensed photo. Give `credit_place` (e.g. "Green Bowl"); the credit is generated. The CTA slide uses Yume's own photos (URLs above) with an explicit `credit`.

## Topic log
- 2026-11-28 09:00 Madrid: 5 Bali beaches most people walk right past (Suluban, Gunung Payung, Green Bowl, Nyang Nyang, Impossibles)
