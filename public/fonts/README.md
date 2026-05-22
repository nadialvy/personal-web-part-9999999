# Fonts

This folder holds the self-hosted webfonts. Until the files are present, the
site falls back to the system stack (Inter / EB Garamond / system mono).

## What to download

From Pangram Pangram (free for personal use, verify the license before any
commercial use):

- **PP Neue Montreal** — https://pangrampangram.com/products/neue-montreal
  - PPNeueMontreal-Regular.woff2  (weight 400)
  - PPNeueMontreal-Medium.woff2   (weight 500)
  - PPNeueMontreal-Bold.woff2     (weight 600)

- **PP Editorial New** — https://pangrampangram.com/products/editorial-new
  - PPEditorialNew-Italic.woff2   (weight 400, style italic)

Drop the four `.woff2` files into this folder. No code change needed; the
`@font-face` declarations in `src/index.css` already point to these paths.

## Verifying

After dropping the files in, hard-reload the dev server. The hero display
should snap to PP Neue Montreal (very tight, geometric, distinct lowercase
`a`), and the italic emphasis on the hero should switch to PP Editorial New
Italic (true italic forms with swash terminals).
