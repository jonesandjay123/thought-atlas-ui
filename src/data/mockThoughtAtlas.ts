import type { ClusterReport, IdeaInboxItem, ThoughtEdge, ThoughtNode } from "../types";

export const clusters: ClusterReport[] = [
  {
    id: "jarvis-native",
    name: "Jarvis-native memory",
    thesis:
      "Jarvis needs a local-first memory layer that keeps execution context close to files, repos, conversations, and decisions.",
    nodeIds: ["local-first", "agent-operating-loop", "memory-bridges"],
    openQuestions: [
      "Which memories deserve durable graph nodes versus lightweight daily notes?",
      "How should repo-local STATE.md snapshots sync into the atlas without noise?",
    ],
    nextMoves: ["Prototype markdown importer", "Define confidence scoring", "Add graph diff view"],
    color: "#345995",
  },
  {
    id: "thinking-surface",
    name: "Thinking surfaces",
    thesis:
      "The atlas should connect dense note taking, canvas-style spatial thinking, and generated reports without forcing one UI metaphor.",
    nodeIds: ["graphify-gap", "thinking-canvas", "dense-reporting"],
    openQuestions: [
      "When should a relationship become a spatial edge?",
      "Can a report panel stay traceable back to raw conversation snippets?",
    ],
    nextMoves: ["Sketch cluster report schema", "Add source quote anchors"],
    color: "#7b6d3a",
  },
  {
    id: "research-intake",
    name: "Research intake",
    thesis:
      "Long AI conversations and research reports should enter through an inbox, then be promoted into durable claims, questions, and projects.",
    nodeIds: ["idea-inbox", "source-traceability", "claim-promotion"],
    openQuestions: [
      "How much auto-tagging should happen before human review?",
      "What is the smallest useful import format?",
    ],
    nextMoves: ["Create ingest manifest", "Add markdown frontmatter conventions"],
    color: "#2c7a5b",
  },
];

export const nodes: ThoughtNode[] = [
  {
    id: "local-first",
    title: "Local-first thought graph",
    summary:
      "Keep raw notes, extracted claims, graph state, and generated reports on disk first. Sync is optional, inspectable, and reversible.",
    cluster: "jarvis-native",
    sourceType: "markdown",
    confidence: 0.92,
    freshness: "active",
    tags: ["storage", "privacy", "sync"],
    x: 47,
    y: 35,
    radius: 34,
  },
  {
    id: "agent-operating-loop",
    title: "Agent operating loop",
    summary:
      "Jarvis should ingest, triage, connect, summarize, and propose next actions as a standing workflow instead of a passive note archive.",
    cluster: "jarvis-native",
    sourceType: "conversation",
    confidence: 0.88,
    freshness: "new",
    tags: ["jarvis", "workflow", "automation"],
    x: 61,
    y: 48,
    radius: 30,
  },
  {
    id: "memory-bridges",
    title: "Memory bridge files",
    summary:
      "Bridge documents can preserve cross-session decisions and should become first-class graph sources with provenance and review state.",
    cluster: "jarvis-native",
    sourceType: "markdown",
    confidence: 0.78,
    freshness: "settled",
    tags: ["codex", "memory", "provenance"],
    x: 38,
    y: 57,
    radius: 24,
  },
  {
    id: "graphify-gap",
    title: "Graphify gap",
    summary:
      "Graphify-style extraction is useful, but Thought Atlas should prioritize personal meaning, durable claims, and evolving reports.",
    cluster: "thinking-surface",
    sourceType: "report",
    confidence: 0.74,
    freshness: "active",
    tags: ["graphify", "extraction", "positioning"],
    x: 71,
    y: 27,
    radius: 28,
  },
  {
    id: "thinking-canvas",
    title: "Thinking canvas",
    summary:
      "Canvas tools help spatial reasoning, but the atlas should make relationships queryable and reportable, not only visually arranged.",
    cluster: "thinking-surface",
    sourceType: "conversation",
    confidence: 0.81,
    freshness: "active",
    tags: ["canvas", "spatial", "ux"],
    x: 78,
    y: 58,
    radius: 31,
  },
  {
    id: "dense-reporting",
    title: "Dense evolving reports",
    summary:
      "Reports should be generated from clusters, show unresolved questions, and become living artifacts rather than one-off summaries.",
    cluster: "thinking-surface",
    sourceType: "report",
    confidence: 0.86,
    freshness: "new",
    tags: ["reports", "synthesis", "knowledge-work"],
    x: 55,
    y: 72,
    radius: 29,
  },
  {
    id: "idea-inbox",
    title: "Idea inbox",
    summary:
      "Every long conversation, markdown note, and research file should first land in an inbox where Jarvis can suggest graph promotions.",
    cluster: "research-intake",
    sourceType: "conversation",
    confidence: 0.9,
    freshness: "new",
    tags: ["inbox", "triage", "capture"],
    x: 24,
    y: 32,
    radius: 30,
  },
  {
    id: "source-traceability",
    title: "Source traceability",
    summary:
      "Every node and report statement should retain links to the originating file, conversation chunk, or imported research note.",
    cluster: "research-intake",
    sourceType: "web",
    confidence: 0.84,
    freshness: "active",
    tags: ["sources", "audit", "trust"],
    x: 20,
    y: 64,
    radius: 27,
  },
  {
    id: "claim-promotion",
    title: "Claim promotion",
    summary:
      "Raw excerpts become durable knowledge only after being promoted into claims, questions, references, or project decisions.",
    cluster: "research-intake",
    sourceType: "markdown",
    confidence: 0.79,
    freshness: "active",
    tags: ["claims", "review", "taxonomy"],
    x: 35,
    y: 77,
    radius: 25,
  },
];

export const edges: ThoughtEdge[] = [
  { source: "idea-inbox", target: "claim-promotion", relation: "supports", weight: 0.92 },
  { source: "claim-promotion", target: "source-traceability", relation: "depends-on", weight: 0.82 },
  { source: "source-traceability", target: "local-first", relation: "supports", weight: 0.76 },
  { source: "local-first", target: "memory-bridges", relation: "extends", weight: 0.7 },
  { source: "memory-bridges", target: "agent-operating-loop", relation: "supports", weight: 0.68 },
  { source: "agent-operating-loop", target: "dense-reporting", relation: "extends", weight: 0.74 },
  { source: "graphify-gap", target: "thinking-canvas", relation: "contrasts", weight: 0.66 },
  { source: "thinking-canvas", target: "dense-reporting", relation: "supports", weight: 0.71 },
  { source: "graphify-gap", target: "claim-promotion", relation: "extends", weight: 0.58 },
  { source: "dense-reporting", target: "source-traceability", relation: "depends-on", weight: 0.73 },
];

export const inboxItems: IdeaInboxItem[] = [
  {
    id: "inbox-001",
    title: "Import a 40k-token ChatGPT strategy thread",
    source: "chatgpt-export/agent-memory-roadmap.md",
    capturedAt: "2026-04-25 09:30",
    excerpt:
      "The useful artifact is not the transcript itself, but the durable decisions, tensions, and open loops that can survive the session.",
    suggestedTags: ["conversation", "strategy", "memory"],
    status: "queued",
  },
  {
    id: "inbox-002",
    title: "Compare Graphify with Jarvis-native atlas",
    source: "research/graph-tools-survey.md",
    capturedAt: "2026-04-25 10:15",
    excerpt:
      "Graph extraction finds entities and links. Thought Atlas should explain why a connection matters to Jones and where it changes action.",
    suggestedTags: ["graphify", "positioning", "product"],
    status: "triaged",
  },
  {
    id: "inbox-003",
    title: "Repo-local STATE.md as knowledge signal",
    source: "notes/repo-initialization-protocol.md",
    capturedAt: "2026-04-25 11:05",
    excerpt:
      "STATE.md is small enough to stay fresh, but structured enough to become an indexable project pulse.",
    suggestedTags: ["repos", "state", "jarvis"],
    status: "linked",
  },
];
