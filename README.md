# Sarath Adukkadukkam — Portfolio

A clean, minimal personal portfolio built with the current modern web stack.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Build for production

```bash
npm run build
npm run start
```

## Deploy to Vercel

This project deploys to [Vercel](https://vercel.com) with zero configuration:

1. Push this folder to a GitHub repository.
2. In Vercel, **Add New → Project**, import the repo, and click **Deploy**.
   Vercel auto-detects Next.js — no settings needed.

## Editing content

All text lives in **`lib/data.ts`** — profile, experience, research, projects,
skills, education and contact details. Edit that one file to update the site.

## Your profile photo

Replace **`public/profile.jpg`** with your own photo (square, ~640×640px works
well). The current file is a placeholder monogram. If the image is ever missing,
the site automatically falls back to an "SA" monogram.

## Documents

The following live in `public/` and are linked from the site:

- `Sarath_Adukkadukkam_Resume.pdf` — résumé (Resume button)
- `ECG_Anaesthesia_Monitoring_Report.pdf` — research report
- `ALIA_Delivery_MQTT_Report.pdf` — research report

## Project structure

```
app/
  layout.tsx      # fonts, metadata
  page.tsx        # section order
  globals.css     # theme tokens & base styles
  icon.png        # favicon
components/        # Navbar, Hero, About, Experience, Research, Projects, Skills, Education, Contact, Footer
lib/data.ts        # all editable content
public/            # photo, résumé, report PDFs
_old_site_backup/  # your previous vanilla HTML/CSS/JS site
```
