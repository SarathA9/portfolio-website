# Sarath Adukkadukkam — Portfolio

A personal portfolio built around one idea: a “Search my work” box under the hero
that ranks research, projects, roles and skills against what a visitor types, the way a
RAG retriever ranks documents.

**Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Three.js, Rajdhani (Fontsource) with Geist for the name

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
  HeroDesk.tsx      # hero 3D scene: a developer coding at his desk (Three.js, loaded lazily)
  SceneBackground.tsx # faint 3D network behind the sections that morphs shape as you scroll
  ScrollFX.tsx      # smooth scrolling (Lenis) + eased scroll effects: hero sink-back, cards tilting in
  ProjectStrip.tsx  # horizontal scrapbook strip of projects: sideways scroll, drag, endless drift
  Preloader.tsx     # loading sequence (once per session): logo assembles, name rises, real progress, curtain lifts
  Spotlight.tsx     # soft light under the pointer on cards
  ProjectArt.tsx    # line illustrations on the project cards
  AskPortfolio.tsx  # the search box (client component)
  Sections.tsx      # Research, Projects, Experience, About, Skills & Education, Contact
lib/data.ts        # all editable content
lib/search.ts      # the little retriever behind "Ask this portfolio" (synonyms live here)
public/            # photos, résumé, report PDFs
_old_site_backup/  # your previous vanilla HTML/CSS/JS site
```

## "Ask my AI" chat (RAG)

A retrieval-augmented chat about Sarath, in `components/ChatWidget.tsx` and `app/api/chat/route.ts`.

1. **Corpus:** the report PDFs and CV in `public/` are turned into ~140-word passages by
   `python3 scripts/build_rag_corpus.py` (needs `pdftotext`; re-run after adding or changing a PDF).
   Site content from `lib/data.ts` is added automatically.
2. **Retrieval:** Okapi BM25 with stemming, English/German stop words and query expansion (`lib/rag/retrieve.ts`).
3. **RFC guard:** the Rank-Faithfulness Consistency check from the RFC report runs on the retrieved
   document passages; a strong outlier is shown as flagged and kept out of the prompt.
4. **Generation:** streamed from any OpenAI-compatible API, with numbered citations.

### Setup (free)

1. Create a free API key at https://console.groq.com/keys
2. In Vercel: Project → Settings → Environment Variables → add `GROQ_API_KEY`, then redeploy.

Optional: `LLM_MODEL` (default `openai/gpt-oss-120b`; if a model is retired the chat picks the best one Groq still lists) and `LLM_BASE_URL` for another OpenAI-compatible provider.
Without a key the chat still works and answers with the most relevant quoted passages.
