export type FirestoreSourceRef = {
  source_id?: string;
  sourceId?: string;
  locator?: string;
  excerpt?: string;
  quote?: string;
  [key: string]: unknown;
};

export type ThoughtAtlasMetaDoc = {
  schema_version: string;
  project_id: string;
  exported_at: string;
  source_count: number;
  digest_count: number;
  node_count: number;
  edge_count: number;
  report_count: number;
  registry_run_count: number;
  local_graph_updated_at: string | null;
};

export type ThoughtSourceDoc = {
  source_id: string;
  title: string;
  source_type: string;
  status: string;
  path: string;
  manifest_path: string;
  content_hash: string;
  tags: string[];
  origin: Record<string, unknown> | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};


export type ThoughtDigestDoc = {
  digest_id: string;
  source_id: string;
  created_at: string | null;
  summary: string;
  item_count: number;
  items: Record<string, unknown>[];
  path: string;
};

export type ThoughtNodeDoc = {
  id: string;
  kind: string;
  title: string;
  body: string;
  source_refs: FirestoreSourceRef[];
  confidence: number;
  tags: string[];
  source_ids: string[];
  updated_at: string | null;
};

export type ThoughtEdgeDoc = {
  id: string;
  from: string;
  to: string;
  relation: string;
  weight: number | null;
  confidence: number;
  source_refs: FirestoreSourceRef[];
  source_ids: string[];
  rationale: string;
  updated_at: string | null;
};

export type ThoughtReportDoc = {
  source_id: string;
  path: string;
  markdown: string;
  digest_id: string | null;
  patch_id: string | null;
  digest_items: number;
  patch_operations: number;
  graph_nodes: number;
  graph_edges: number;
  updated_at: string | null;
};
