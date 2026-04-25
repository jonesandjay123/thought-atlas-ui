import { collection, doc, getDoc, getDocs, type DocumentData } from "firebase/firestore";
import { getThoughtAtlasFirestore } from "./firebaseApp";
import type {
  ThoughtAtlasMetaDoc,
  ThoughtEdgeDoc,
  ThoughtNodeDoc,
  ThoughtReportDoc,
  ThoughtSourceDoc,
} from "../firestoreTypes";
import { createThoughtAtlasViewModel, type ThoughtAtlasViewModel } from "../viewModels/thoughtAtlasViewModel";

export async function loadThoughtAtlasFromFirestore(): Promise<ThoughtAtlasViewModel> {
  const db = getThoughtAtlasFirestore();
  const [metaSnapshot, sourcesSnapshot, nodesSnapshot, edgesSnapshot, reportsSnapshot] = await Promise.all([
    getDoc(doc(db, "thoughtAtlasMeta", "current")),
    getDocs(collection(db, "thoughtSources")),
    getDocs(collection(db, "thoughtNodes")),
    getDocs(collection(db, "thoughtEdges")),
    getDocs(collection(db, "thoughtReports")),
  ]);

  if (!metaSnapshot.exists()) throw new Error("thoughtAtlasMeta/current does not exist in Firestore.");

  return createThoughtAtlasViewModel({
    meta: normalizeMeta(metaSnapshot.data()),
    sources: sourcesSnapshot.docs.map((snapshot) => normalizeSource({ source_id: snapshot.id, ...snapshot.data() })),
    nodes: nodesSnapshot.docs.map((snapshot) => normalizeNode({ id: snapshot.id, ...snapshot.data() })),
    edges: edgesSnapshot.docs.map((snapshot) => normalizeEdge({ id: snapshot.id, ...snapshot.data() })),
    reports: reportsSnapshot.docs.map((snapshot) => normalizeReport({ source_id: snapshot.id, ...snapshot.data() })),
  });
}

function normalizeMeta(data: DocumentData): ThoughtAtlasMetaDoc {
  return {
    schema_version: asString(data.schema_version),
    project_id: asString(data.project_id),
    exported_at: asDateString(data.exported_at),
    source_count: asNumber(data.source_count),
    digest_count: asNumber(data.digest_count),
    node_count: asNumber(data.node_count),
    edge_count: asNumber(data.edge_count),
    report_count: asNumber(data.report_count),
    registry_run_count: asNumber(data.registry_run_count),
    local_graph_updated_at: asNullableDateString(data.local_graph_updated_at),
  };
}

function normalizeSource(data: DocumentData): ThoughtSourceDoc {
  return {
    source_id: asString(data.source_id),
    title: asString(data.title || data.source_id),
    source_type: asString(data.source_type),
    status: asString(data.status),
    path: asString(data.path),
    manifest_path: asString(data.manifest_path),
    content_hash: asString(data.content_hash),
    tags: asStringArray(data.tags),
    origin: data.origin && typeof data.origin === "object" ? data.origin : null,
    first_seen_at: asNullableDateString(data.first_seen_at),
    last_seen_at: asNullableDateString(data.last_seen_at),
    created_at: asNullableDateString(data.created_at),
    updated_at: asNullableDateString(data.updated_at),
  };
}

function normalizeNode(data: DocumentData): ThoughtNodeDoc {
  return {
    id: asString(data.id),
    kind: asString(data.kind || "unknown"),
    title: asString(data.title || data.id),
    body: asString(data.body),
    source_refs: Array.isArray(data.source_refs) ? data.source_refs : [],
    confidence: asNumber(data.confidence),
    tags: asStringArray(data.tags),
    source_ids: asStringArray(data.source_ids),
    updated_at: asNullableDateString(data.updated_at),
  };
}

function normalizeEdge(data: DocumentData): ThoughtEdgeDoc {
  return {
    id: asString(data.id),
    from: asString(data.from),
    to: asString(data.to),
    relation: asString(data.relation || "related"),
    weight: data.weight === null || data.weight === undefined ? null : asNumber(data.weight),
    confidence: asNumber(data.confidence),
    source_refs: Array.isArray(data.source_refs) ? data.source_refs : [],
    source_ids: asStringArray(data.source_ids),
    rationale: asString(data.rationale),
    updated_at: asNullableDateString(data.updated_at),
  };
}

function normalizeReport(data: DocumentData): ThoughtReportDoc {
  return {
    source_id: asString(data.source_id),
    path: asString(data.path),
    markdown: asString(data.markdown),
    digest_id: data.digest_id ? String(data.digest_id) : null,
    patch_id: data.patch_id ? String(data.patch_id) : null,
    digest_items: asNumber(data.digest_items),
    patch_operations: asNumber(data.patch_operations),
    graph_nodes: asNumber(data.graph_nodes),
    graph_edges: asNumber(data.graph_edges),
    updated_at: asNullableDateString(data.updated_at),
  };
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asNullableDateString(value: unknown): string | null {
  if (value == null || value === "") return null;
  return asDateString(value);
}

function asDateString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value && "toDate" in value && typeof (value as { toDate?: unknown }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return value == null ? "" : String(value);
}
