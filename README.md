# Sarath Adukkadukkam — Portfolio

A personal portfolio built around one idea: a “Search my work” box under the hero
that ranks research, projects, roles and skills against what a visitor types, the way a
RAG retriever ranks documents.

**Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Three.js, Geist (self-hosted via the geist package)

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


## Editing content

All text lives in **`lib/data.ts`** — profile, experience, research, projects,
skills, education and contact details. Edit that one file to update the site.

## Documents

The following live in `public/` and are linked from the site:

- `Sarath_Adukkadukkam_Resume.pdf` — résumé (Resume button)
- `ECG_Anaesthesia_Monitoring_Report.pdf` — research report
- `ALIA_Delivery_MQTT_Report.pdf` — research report

## Project structure

```
app/
  layout.tsx      # font, metadata, JSON-LD
  page.tsx        # section order
  globals.css     # design tokens (colours, type) and all styles
  icon.png        # favicon
components/
  Navbar.tsx
  Hero.tsx
  SceneBackground.tsx # fixed 3D network that morphs shape as you scroll (Three.js, loaded lazily)
  ScrollFX.tsx      # scroll-driven 3D: hero sink-back, cards tilting in, projects carousel
  Spotlight.tsx     # soft light under the pointer on cards
  AskPortfolio.tsx  # the search box (client component)
  Sections.tsx      # Research, Projects, Experience, About, Skills & Education, Contact
lib/data.ts        # all editable content
lib/search.ts      # the little retriever behind "Ask this portfolio" (synonyms live here)
public/            # photos, résumé, report PDFs
_old_site_backup/  # your previous vanilla HTML/CSS/JS site
```
