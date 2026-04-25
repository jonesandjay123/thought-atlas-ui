# Thought Atlas UI Current Handoff

_Last updated: 2026-04-25_

## Live URL

- https://thought-atlas.web.app

## Current version

- Current UI marker: `v1.5-i18n · zh-default`
- Milestone immediately before i18n: `v1.4-public-polish · featured-trails`

## Product state

Thought Atlas UI is now a public-readable AI-assisted thought portfolio: a showcase layer for long conversations, reports, and project notes that have been digested by the Thought Atlas core pipeline and synced to Firestore.

The current goal is no longer feature expansion. The next step is to use the product for a few days and observe which entry points, trails, nodes, and evidence views actually matter.

## Data source

- Firebase project: `thought-atlas`
- Firestore mode: public read / owner-write-ready
- Hosting: Firebase Hosting at `https://thought-atlas.web.app`
- Source repo for core ingest/sync: `jonesandjay123/thought-atlas`
- UI repo: `jonesandjay123/thought-atlas-ui`

## Current features

- Public dashboard / overview
- Source explorer and source filter
- Node explorer with search, kind, tag, and source filters
- Node inspector with related incoming/outgoing edges and source refs
- Reports viewer
- Theme detail views as public entry points
- Local neighborhood graph for selected node context
- Featured Thought Trails curated in frontend config
- Suggested Thought Trails generated from graph structure
- How-to-read section for first-time visitors
- Optional Google login status display
- Dark/light mode toggle
- Chinese/English interface toggle, defaulting to Traditional Chinese

## Current boundaries

- No CRUD
- No write UI
- No Cloud Functions
- No graph library
- No owner curation tools yet
- No visibility controls yet
- Public read is allowed; owner-only writing remains a backend/rules boundary, not a UI feature
- Thought data/content is not translated by the UI; only interface chrome is localized

## Why stop here

This version completes the MVP/V1 chain:

```text
Jarvis Slack ingest
→ Thought Atlas core digests source material
→ Firestore sync
→ public-readable UI
→ themes / nodes / reports / local graph / trails
→ public presentation polish
→ zh/en interface toggle
```

That makes it usable and shareable enough for real observation. The next round should start from actual use, not from a desire to add a fancy graph visualization.

## Suggested next action

Do not add major features immediately. Use it naturally for a few days. Record friction and genuine desires in `docs/next-observation-notes.md`.

Potential next implementation areas after observation:

- Better public/private visibility controls
- Better showcase landing / story line
- Owner curation tools for featured trails
- Graph library only if the current local graph proves insufficient for real use
- Export/share views for selected trails or reports
