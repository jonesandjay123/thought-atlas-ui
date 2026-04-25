import { clusters, edges as mockEdges, nodes as mockNodes } from "../data/mockThoughtAtlas";
import type {
  ThoughtAtlasMetaDoc,
  ThoughtDigestDoc,
  ThoughtEdgeDoc,
  ThoughtNodeDoc,
  ThoughtReportDoc,
  ThoughtSourceDoc,
} from "../firestoreTypes";

export type DataMode = "firestore" | "mock";

export type ThoughtAtlasViewModel = {
  mode: DataMode;
  meta: ThoughtAtlasMetaDoc;
  sources: ThoughtSourceDoc[];
  digests: ThoughtDigestDoc[];
  nodes: ThoughtNodeDoc[];
  edges: ThoughtEdgeDoc[];
  reports: ThoughtReportDoc[];
  nodeById: Map<string, ThoughtNodeDoc>;
  sourceById: Map<string, ThoughtSourceDoc>;
  digestBySourceId: Map<string, ThoughtDigestDoc>;
  reportBySourceId: Map<string, ThoughtReportDoc>;
  kinds: string[];
  tags: string[];
};

export type ThoughtAtlasPayload = {
  meta: ThoughtAtlasMetaDoc;
  sources: ThoughtSourceDoc[];
  digests: ThoughtDigestDoc[];
  nodes: ThoughtNodeDoc[];
  edges: ThoughtEdgeDoc[];
  reports: ThoughtReportDoc[];
};

export function createThoughtAtlasViewModel(payload: ThoughtAtlasPayload, mode: DataMode = "firestore"): ThoughtAtlasViewModel {
  const sources = [...payload.sources].sort((a, b) => a.title.localeCompare(b.title));
  const digests = [...payload.digests].sort((a, b) => a.source_id.localeCompare(b.source_id));
  const nodes = [...payload.nodes].sort((a, b) => a.title.localeCompare(b.title));
  const edges = [...payload.edges].sort((a, b) => a.relation.localeCompare(b.relation));
  const reports = [...payload.reports].sort((a, b) => a.source_id.localeCompare(b.source_id));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const sourceById = new Map(sources.map((source) => [source.source_id, source]));
  const digestBySourceId = new Map(digests.map((digest) => [digest.source_id, digest]));
  const reportBySourceId = new Map(reports.map((report) => [report.source_id, report]));

  return {
    mode,
    meta: payload.meta,
    sources,
    digests,
    nodes,
    edges,
    reports,
    nodeById,
    sourceById,
    digestBySourceId,
    reportBySourceId,
    kinds: unique(nodes.map((node) => node.kind)),
    tags: unique(nodes.flatMap((node) => node.tags)),
  };
}

export function createMockThoughtAtlasViewModel(): ThoughtAtlasViewModel {
  const sources: ThoughtSourceDoc[] = clusters.map((cluster) => ({
    source_id: cluster.id,
    title: cluster.name,
    source_type: "mock_cluster",
    status: "preview",
    path: "src/data/mockThoughtAtlas.ts",
    manifest_path: "",
    content_hash: "mock",
    tags: ["mock", "ui-preview"],
    origin: null,
    first_seen_at: null,
    last_seen_at: null,
    created_at: null,
    updated_at: null,
  }));

  const nodes: ThoughtNodeDoc[] = mockNodes.map((node) => ({
    id: node.id,
    kind: node.cluster,
    title: node.title,
    body: node.summary,
    source_refs: [],
    confidence: node.confidence,
    tags: node.tags,
    source_ids: [node.cluster],
    updated_at: null,
  }));

  const edges: ThoughtEdgeDoc[] = mockEdges.map((edge, index) => ({
    id: `mock-edge-${index + 1}`,
    from: edge.source,
    to: edge.target,
    relation: edge.relation,
    weight: edge.weight,
    confidence: edge.weight,
    source_refs: [],
    source_ids: [],
    rationale: "Mock relation used for UI layout preview.",
    updated_at: null,
  }));

  const digests: ThoughtDigestDoc[] = clusters.map((cluster) => ({
    digest_id: `${cluster.id}-digest`,
    source_id: cluster.id,
    created_at: null,
    summary: cluster.thesis,
    item_count: cluster.nodeIds.length,
    items: cluster.nodeIds.map((nodeId) => ({ node_id: nodeId })),
    path: "src/data/mockThoughtAtlas.ts",
  }));

  const reports: ThoughtReportDoc[] = clusters.map((cluster) => ({
    source_id: cluster.id,
    path: "src/data/mockThoughtAtlas.ts",
    markdown: `# ${cluster.name}\n\n${cluster.thesis}\n\n## Open questions\n${cluster.openQuestions.map((question) => `- ${question}`).join("\n")}`,
    digest_id: null,
    patch_id: null,
    digest_items: cluster.nodeIds.length,
    patch_operations: 0,
    graph_nodes: cluster.nodeIds.length,
    graph_edges: 0,
    updated_at: null,
  }));

  return createThoughtAtlasViewModel({
    meta: {
      schema_version: "mock",
      project_id: "mock",
      exported_at: new Date().toISOString(),
      source_count: sources.length,
      digest_count: reports.length,
      node_count: nodes.length,
      edge_count: edges.length,
      report_count: reports.length,
      registry_run_count: 0,
      local_graph_updated_at: null,
    },
    sources,
    digests,
    nodes,
    edges,
    reports,
  }, "mock");
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}
