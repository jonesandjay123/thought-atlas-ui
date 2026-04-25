# V1.2 Theme / Tag Detail Views

## Why themes are public entry points

The V1.1 local neighborhood graph proves that a visitor can start from one selected node and inspect its incoming relations, outgoing relations, rationale, back navigation, and source evidence.

That is useful for depth, but it still assumes the visitor already knows where to begin.

Theme / Tag Detail Views provide the missing public-facing entry layer. A visitor can start from a familiar theme such as `ai`, `codex`, `ikigai`, `jones`, `compounding`, or `productization`, then drill into the underlying nodes, sources, reports, and graph relations.

In other words:

- Graph = follow one node deeply.
- Theme = choose where to start.
- Thought Trails = later curated narrative paths.

## How tags map to atlas data

V1.2 uses existing read-only Firestore data and derives theme views entirely on the client:

- `tag → nodes`: nodes whose `tags` include the selected theme.
- `tag → sources`: sources referenced by those nodes, plus sources whose own tags include the selected theme.
- `tag → edges`: edges where either endpoint node has the selected theme.
- `tag → reports`: reports attached to related sources.

No new backend shape is required for this slice.

## Behavior

Featured Themes and Top Tags are clickable. Clicking a theme switches the main panel to a generated theme detail view with:

- Theme name.
- Related node, source, edge, and report counts.
- Related nodes grouped by kind.
- Related sources with titles.
- Related reports, when available.
- Related edges where either endpoint belongs to the theme.
- Node clicks open the selected node in the existing Graph / Inspector flow.
- Source clicks open the existing Source detail flow.

## Read-only boundary

V1.2 remains a public-readable showcase layer:

- No CRUD.
- No write UI.
- No Functions.
- No graph library.
- No client-side writes.

## Relationship to future Thought Trails

Theme views are automatically generated from existing tags and are therefore a low-friction V1.2 slice.

Thought Trails should come later because they imply curation: someone needs to decide which sequence of ideas is worth presenting as a story. Once Theme views exist, future trails can use themes as discovery surfaces and then offer curated sequences such as:

```text
AI as leverage
→ Jarvis as operator
→ Thought Atlas as memory
→ Observer J as public output
```

Theme views make the atlas easier to enter. Thought Trails will make it easier to follow as a narrative.
