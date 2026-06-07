# Asset audit (phase 1)

Inventory of files that were dropped into the repo before the rebuild started, with
the decisions and follow-ups required before launch.

## `public/video/bg3.mp4` (17.7 MB)

**Status:** unacceptable for production. 17 MB hits the homepage LCP path on every
visit and on mobile data plans is roughly a 30-second download.

**Required before launch:**
1. Re-encode to AV1 (`.webm`) primary + H.264 (`.mp4`) fallback. Target ≤ 3 MB at
   1080p, 30 fps, low motion.
2. Generate a poster image (still frame, JPG or WebP, ≤ 200 KB) for use as the
   `prefers-reduced-motion` fallback and the LCP image.
3. Upload re-encoded files to Vercel Blob, Mux, or Cloudflare Stream and pin the
   exact host in the marketing CSP `media-src` directive
   (`next.config.ts` → `marketingCsp`).
4. Remove the raw `.mp4` from the repo once the host has the encoded copies.

Suggested ffmpeg pipeline (run locally when re-encoding):

```sh
# AV1 (smaller, modern UAs)
ffmpeg -i public/video/bg3.mp4 \
  -c:v libsvtav1 -preset 6 -crf 35 -g 240 -an \
  -movflags +faststart \
  bg3.av1.webm

# H.264 (legacy fallback)
ffmpeg -i public/video/bg3.mp4 \
  -c:v libx264 -preset slow -crf 28 -an \
  -movflags +faststart -pix_fmt yuv420p \
  bg3.h264.mp4

# Poster frame
ffmpeg -i public/video/bg3.mp4 -ss 00:00:01.0 -frames:v 1 -q:v 3 bg3.poster.jpg
```

## `public/brand/logo.png` and `logo-black.png`

**Status:** PNGs are wrong for a luxury brand identity. They alias on retina, can't
be themed, and bloat the bundle.

**Required before launch:**
1. Request the original vector files from the brand owner (Adobe Illustrator,
   Figma, or Sketch source). The dark + light variants should come from the
   same vector master.
2. Export to optimised SVG (run through SVGO with `removeViewBox: false`).
3. Place at `public/brand/logo.svg` and `public/brand/logo-mark.svg` (mark-only
   variant for the nav and favicon). Inline at small sizes; reference for hero
   variants.
4. Delete the PNG files once SVGs are committed.
5. Tracing the PNG should be a last resort and requires brand-owner approval —
   tracing artefacts (jagged curves, lost optical adjustments) defeat the point.

Until the SVGs land, the marketing site should not use the existing PNGs on the
hero or the nav — they are placeholders for the asset audit, not approved brand
assets.
