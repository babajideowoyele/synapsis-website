# Demo clips

Short, consent-cleared sample clips shown on the site. Nothing here is tracked in git yet —
drop the files in and they appear automatically.

## Landing page sample strip (`index.html#samples`)

The strip is hidden until the clips load, so the page never shows empty players.
Add all three and the section reveals itself:

| File | Shows | Route |
|------|-------|-------|
| `sample-blur.mp4` | Gaussian blur over detected people | 3 (Masked-Piper) |
| `sample-silhouette.mp4` | Silhouette / skeleton-only rendering | 3 (Masked-Piper) |
| `sample-sam2.mp4` | Pixel-accurate SAM2 mask | 4–6 (MaskAnyone) |

Keep them short (5–10 s), muted, loopable, and small — they autoplay, so aim for
under ~2 MB each. Ideally the same source recording in all three, so the strip reads
as a comparison of strategies rather than three unrelated clips.

## Demo page (`demo.html`)

Still referenced but not yet installed:

- `sample_original.mp4`, `sample_masked.mp4` (+ `poster-original.jpg`, `poster-masked.jpg`)
- `classroom_original.mp4`, `classroom_masked.mp4`

## Before adding anything

These clips are published on a public website. The people in them need consent that
covers **public dissemination**, not only research reuse — check that before committing.
Wim's public examples at
<https://github.com/WimPouw/TowardsMultimodalOpenScience/tree/main/Example_combined>
are one candidate source, but they are full-length and unmasked: trim and mask them
before use.
