# Salah Sounds — website

Redesigned homepage for [Salah Sounds](https://salahsounds.co.uk), mosque sound systems, event AV and live streaming.

## What's here

- `index.html` — the page shell (fonts, meta tags)
- `js/app.js` — the page and its interactive parts (before/after player, price tool, FAQ, reviews, contact form chips)
- `js/vendor/` — Preact and htm, bundled locally (no build step, no CDN)
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

## Still to do before launch

- Connect the contact form to email or WhatsApp (the "Send my enquiry" button doesn't submit yet)
- Link the "Read all on Google" and "Leave a review" buttons to the Google Business profile
