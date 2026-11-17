# Sharplight website

Source of the Sharplight website (Jekyll), published with GitHub Pages.

## Go-live checklist (sharplight.dev)

Do this only when the site is completely finished.

1. In `_config.yml` set `url: https://sharplight.dev` and `baseurl: ""` (currently `https://infernitytech.github.io` and `/sharplight-website`).
2. Add a `CNAME` file containing `sharplight.dev` at the repository root (and set the custom domain in the repository's Pages settings).
3. Configure DNS (apex A/AAAA records to GitHub Pages, or ALIAS) and enable "Enforce HTTPS".
