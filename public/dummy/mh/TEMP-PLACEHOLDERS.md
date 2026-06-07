# TEMPORARY placeholder images — replace before launch

The files in this directory (`cta-01.jpg` through `cta-06.jpg`) were
downloaded from `mahsheed.com/app/themes/mahsheed.com/images/home/`
to serve as visual stand-ins during the Mahsheed-style home page
rebuild.

They are **not licensed for production use on puertadubai.com** and must
be swapped for Puerta-owned photography (or licensed stock) before the
DNS cutover (Phase E).

What we deliberately did NOT copy from mahsheed.com:

- Personal portraits (`mahsheed-photo.png`, `Top-Producer-2024.jpg`)
- Likeness-rights cases (`Jennifer-Tilly.jpg`, `Trevor-Davis.jpg`)
- Magazine/press covers (`masheed-magazine-cover-2025.jpg`)
- Affiliation / press-mention logos (Fox News, WSJ, LA Times, etc.)
- The hero Vimeo video

When swapping: keep the same filenames so `lib/home/placeholders.ts`
doesn't need editing, OR update the `image` field of each entry in
`CTA_CARDS` to point at the new asset.
