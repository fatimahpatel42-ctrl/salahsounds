# Salah Sounds — website

Redesigned homepage for [Salah Sounds](https://salahsounds.co.uk), mosque sound systems, event AV and live streaming.

## What's here

- `index.html` — the homepage shell (fonts, meta tags)
- `services/` — service pages: mosque sound systems, event AV & live streaming, training & support (plain HTML, styled by `css/site.css`, behaviour in `js/page.js`)
- `js/app.js` — the page and its interactive parts (before/after player, price tool, FAQ, reviews, contact form chips)
- `js/vendor/` — Preact and htm, bundled locally (no build step, no CDN)
- `academy/` — case studies (Edmonton Islamic Centre)
- `img/og-image.jpg` — the preview image shown when a link is shared on WhatsApp, Facebook, etc.
- `img/` — logo, client logos and masjid photos
- `audio/` — York Mosque before/after recordings

## Run it locally

Any static server works, for example:

```
python3 -m http.server
```

then open http://localhost:8000.

## Publish with GitHub Pages

Settings → Pages → Source: **Deploy from a branch** → Branch: `main` / root.

## How enquiries work

The price tool and every enquiry form open WhatsApp (or email, if the visitor picks it) with their answers already written into the message, so nothing has to be retyped.

## Still to do before launch

- Swap the Google review links (currently a Google search for "Salah Sounds East Ham reviews") for the exact Google Business profile link
