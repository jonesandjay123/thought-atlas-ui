# Thought Atlas Graph Explorer Strategy

Status: V1 planning note. Do not add a graph library in V0.2.

## Current V0/V0.2 stance

Thought Atlas UI is now a public-readable showcase backed by Firestore:

- Anyone can read the published Thought Atlas data.
- Client write UI does not exist yet.
- Owner-only writes may exist later behind Google Auth, but V0.2 remains read-oriented.
- The current graph view is intentionally a lightweight preview, not the final product experience.

## Product goal for V1

V1 graph explorer should help visitors answer:

1. What ideas has Jones been exploring?
2. Which ideas repeat across sources?
3. How do concepts support, extend, contrast, or depend on one another?
4. Which source produced a thought, and what was the original context?

The goal is not a decorative starfield. The goal is legible exploration.

## Recommended V1 interaction model

Start with local neighborhood exploration:

- A selected node is centered.
- Incoming and outgoing neighbors are arranged around it.
- Edge labels show relation type.
- Clicking a neighbor jumps focus to that node.
- Source filters and tag filters constrain the neighborhood.
- Inspector and source refs remain visible.

This is likely more useful than rendering the full 38-node graph at once. As data grows, global graphs become visually noisy unless heavily clustered.

## Library decision criteria

Evaluate graph libraries only after V0.2 usability is stable.

Criteria:

- React compatibility and maintenance health
- Good label support
- Directed edge support
- Custom node cards / HTML overlays
- Smooth mobile interaction
- Accessibility fallback
- Ability to render small local neighborhoods without heavy setup
- Bundle size impact

## Candidate options

### React Flow

Best fit if graph explorer becomes an interactive product surface with node cards, panels, and controlled layout.

Pros:
- React-native mental model
- Good custom nodes
- Strong interaction primitives
- Good for local neighborhood explorer

Cons:
- More canvas/product-builder feel than organic graph feel
- Layout is still our responsibility unless paired with Dagre/ELK

### Cytoscape.js

Best fit if graph analysis and graph-native layouts become important.

Pros:
- Mature graph library
- Many layouts
- Handles graph semantics well

Cons:
- React integration less native
- Styling/inspector integration can feel separate from app shell

### D3 custom SVG

Best fit if we need bespoke visual language and are comfortable owning behavior.

Pros:
- Maximum control
- Good for polished bespoke public showcase

Cons:
- More custom code
- Harder to maintain interactions, accessibility, and mobile behavior

### react-force-graph

Best fit for quick force-directed visual wow.

Pros:
- Fast to get dynamic graph visuals
- Good visual demo value

Cons:
- Can become decorative/noisy
- Labeling and precise reading are weaker
- Not ideal as the first serious explorer

## Recommendation

For V1, prototype React Flow first for local neighborhood exploration.

Keep the current SVG graph preview until we decide. Do not introduce Cytoscape/D3/react-force-graph in V0.2.

## Future public/private model

If Thought Atlas later contains mixed public/private data, introduce explicit document visibility before any richer public graph:

```ts
visibility: "public" | "private" | "unlisted"
```

V0.2 intentionally assumes the current Firestore mirror is acceptable as public-readable showcase data.
