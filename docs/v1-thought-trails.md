# V1.3 Thought Trails

## What is a Thought Trail?

A Thought Trail is the public narrative layer of Thought Atlas: a short sequence of nodes connected by explicit relations, source evidence, and rationale.

Themes answer: “Where should I start?”

Graph answers: “What is connected to this node?”

Trails answer: “How does this line of thinking unfold?”

## Relationship to Theme and Graph

- **Theme = entry point.** A visitor chooses a familiar topic such as `ai`, `ikigai`, `codex`, or `compounding`.
- **Graph = local relation exploration.** A visitor focuses one node and follows incoming / outgoing relationships.
- **Trail = narrative sequence.** A visitor follows a curated or suggested path through several connected ideas.

V1.3 deliberately does not introduce a graph library. The goal is not a global graph visualization; it is a readable story-like path through existing nodes and edges.

## First slice: client-side auto-suggested trails

The first implementation is automatic and local-only:

- No LLM.
- No backend.
- No Functions.
- No graph library.
- No client writes.

The selector starts from high-confidence nodes and follows outgoing edges for 2–4 steps while avoiding cycles. It prefers nodes with confidence >= 0.85 and returns a small set of suggested trails.

Each trail card shows:

- A generated title.
- A node sequence.
- Relation labels between steps.
- Source count.
- Evidence count.
- Clickable trail steps that focus the selected node in the existing Graph / Inspector flow.

## When to add curated trails

Auto-suggested trails are useful for proving the interaction and surfacing structure from existing data.

Curated trails should come later, when Jones wants to explicitly present narrative arcs such as:

```text
AI as leverage
→ Jarvis as operator
→ Thought Atlas as memory
→ Observer J as public output
```

Curated trails may eventually require a small data shape, but V1.3 avoids that until the public reading experience is clearer.

## Boundary

V1.3 keeps the existing read-only boundary:

- No CRUD.
- No write UI.
- No Functions.
- No graph library.
- No Firestore schema change.
