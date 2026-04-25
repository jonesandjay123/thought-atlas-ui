# Thought Atlas V1 Showcase Strategy

Status: V1 planning + first-slice direction. This document defines the public showcase direction before adding heavier graph code.

## Product positioning

Thought Atlas is a public-readable AI-assisted thought portfolio.

It is not just a Firestore explorer, not a generic notes database, and not yet a Graphify clone. The UI should help a visitor understand how Jones's conversations with AI become durable ideas, questions, decisions, themes, and project directions.

Public-facing framing:

> A public map of ideas, questions, and projects emerging from long-running conversations with AI.

Chinese mental model:

> 這不是筆記 app，而是 Jones 與 AI 長期互動後沉澱出的思想履歷。

## Two audience modes

### A. Explorer for Jones

Tooling-oriented:

- Search nodes.
- Inspect source → digest → nodes → edges.
- Follow source refs.
- Check where a concept came from.
- Explore local node neighborhoods.

V0.2 already covers the first version of this.

### B. Showcase for public visitors

Narrative/product-oriented:

- Understand what Thought Atlas is within seconds.
- See featured themes instead of raw collections first.
- Browse recent thinking sources.
- Follow curated thought trails.
- Inspect evidence when curious.

V1 should make the site feel like a public thought portfolio, not an internal admin dashboard.

## V1 user experience

A public visitor should be able to:

1. Read a clear public-facing hero.
2. Understand the system through a "What is this?" panel.
3. Browse featured themes / recurring motifs.
4. Open recent sources and reports.
5. Follow thought trails that connect concepts into a narrative path.
6. Explore local node neighborhoods from any interesting node.

## Graph strategy

V1 starts with a local neighborhood graph.

Do not add an external graph library in the first V1 slice. The first graph experience should be:

- selected node in the center
- incoming nodes on one side
- outgoing nodes on the other
- relation labels
- edge rationale visible nearby
- click neighbor to jump focus
- source evidence visible in the inspector

A global starfield may look impressive but is not necessarily understandable. Local neighborhoods are more useful for following an idea.

## Graph library comparison for later

Defer library decision until after the local-neighborhood prototype.

- `react-force-graph`: strongest visual starfield effect, weaker for legible labels and narrative reading.
- `Cytoscape.js`: strong graph layouts and exploration semantics, heavier integration surface.
- `D3`: maximum custom visual control, highest maintenance cost.
- `React Flow`: useful for node-card style explorations, but less ideal for dense graph visualization.

V1 should prove the interaction model before adding library weight.

## V1 implementation slices

### V1.0 — Showcase polish

- Public-facing hero copy.
- "What is this?" section.
- Featured Themes section.
- Recent Thought Sources.
- Thought Trails placeholder.
- Keep public read + owner-ready model.

### V1.1 — Local neighborhood graph

- Center selected node.
- Show incoming/outgoing neighbors.
- Show relation labels and rationale.
- Click neighbor to jump.
- Keep inspector/source refs beside it.

### V1.2 — Theme/tag detail views

Potential routes or in-app views:

- `/theme/ai`
- `/theme/codex`
- `/theme/ikigai`

Each theme page should show related nodes, sources, reports, and edges.

### V1.3 — Graph library decision

Only after V1.1/V1.2 reveal real interaction needs.

## First slice implemented after this doc

Implement only the first showcase polish slice:

- Improve hero/public copy.
- Add What is this panel.
- Add Featured Themes.
- Keep read-only.
- No CRUD.
- No Functions.
- No graph library yet.
