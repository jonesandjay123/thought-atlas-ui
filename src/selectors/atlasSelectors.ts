import type { ThoughtEdgeDoc, ThoughtNodeDoc, ThoughtReportDoc, ThoughtSourceDoc } from "../firestoreTypes";
import type { ThoughtAtlasViewModel } from "../viewModels/thoughtAtlasViewModel";

export type ThemeSummary = { tag: string; count: number; nodes: ThoughtNodeDoc[] };
export type ThemeDetail = { theme: string; relatedNodes: ThoughtNodeDoc[]; relatedSources: ThoughtSourceDoc[]; relatedEdges: ThoughtEdgeDoc[]; relatedReports: ThoughtReportDoc[]; nodesByKind: { kind: string; nodes: ThoughtNodeDoc[] }[] };
export type NodeNeighborhood = { incomingEdges: ThoughtEdgeDoc[]; outgoingEdges: ThoughtEdgeDoc[] };
export type SourceBundle = { source?: ThoughtSourceDoc; nodes: ThoughtNodeDoc[]; edges: ThoughtEdgeDoc[]; report?: ThoughtReportDoc };
export type SuggestedTrail = { id: string; title: string; nodes: ThoughtNodeDoc[]; edges: ThoughtEdgeDoc[]; sourceCount: number; evidenceCount: number };

export function getTopThemes(atlas: ThoughtAtlasViewModel, limit = 14): ThemeSummary[] {
  const tagCounts = atlas.nodes.flatMap((node) => node.tags).reduce<Map<string, number>>((counts, tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1), new Map());
  return [...tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([tag, count]) => ({ tag, count, nodes: atlas.nodes.filter((node) => node.tags.includes(tag)).slice(0, 3) }));
}

export function getThemeDetail(atlas: ThoughtAtlasViewModel, selectedTheme: string): ThemeDetail {
  const theme = selectedTheme || atlas.tags[0] || "untagged";
  const relatedNodes = atlas.nodes.filter((node) => node.tags.includes(theme));
  const relatedNodeIds = new Set(relatedNodes.map((node) => node.id));
  const relatedSourceIds = new Set<string>();
  relatedNodes.forEach((node) => node.source_ids.forEach((sourceId) => relatedSourceIds.add(sourceId)));
  atlas.sources.filter((source) => source.tags.includes(theme)).forEach((source) => relatedSourceIds.add(source.source_id));
  const relatedSources = atlas.sources.filter((source) => relatedSourceIds.has(source.source_id));
  const relatedEdges = atlas.edges.filter((edge) => relatedNodeIds.has(edge.from) || relatedNodeIds.has(edge.to));
  const relatedReports = atlas.reports.filter((report) => relatedSourceIds.has(report.source_id));
  const nodesByKind = atlas.kinds.map((kind) => ({ kind, nodes: relatedNodes.filter((node) => node.kind === kind) })).filter((group) => group.nodes.length > 0);
  return { theme, relatedNodes, relatedSources, relatedEdges, relatedReports, nodesByKind };
}

export function getNodeNeighborhood(atlas: ThoughtAtlasViewModel, nodeId: string, edges = atlas.edges): NodeNeighborhood {
  return { incomingEdges: edges.filter((edge) => edge.to === nodeId), outgoingEdges: edges.filter((edge) => edge.from === nodeId) };
}

export function getSourceBundle(atlas: ThoughtAtlasViewModel, sourceId: string): SourceBundle {
  return { source: atlas.sourceById.get(sourceId), nodes: atlas.nodes.filter((node) => node.source_ids.includes(sourceId)), edges: atlas.edges.filter((edge) => edge.source_ids.includes(sourceId)), report: atlas.reportBySourceId.get(sourceId) };
}

export function getSuggestedThoughtTrails(atlas: ThoughtAtlasViewModel, limit = 5): SuggestedTrail[] {
  const outgoingByNode = new Map<string, ThoughtEdgeDoc[]>();
  for (const edge of atlas.edges) {
    const fromNode = atlas.nodeById.get(edge.from);
    const toNode = atlas.nodeById.get(edge.to);
    if (!fromNode || !toNode || fromNode.confidence < 0.85 || toNode.confidence < 0.85) continue;
    outgoingByNode.set(edge.from, [...(outgoingByNode.get(edge.from) ?? []), edge]);
  }
  const starts = [...atlas.nodes].filter((node) => node.confidence >= 0.9 && (outgoingByNode.get(node.id)?.length ?? 0) > 0).sort((a, b) => b.confidence - a.confidence || b.source_ids.length - a.source_ids.length);
  const trails: SuggestedTrail[] = [];
  const seenSignatures = new Set<string>();
  for (const start of starts) {
    const nodes = [start];
    const edges: ThoughtEdgeDoc[] = [];
    const visited = new Set([start.id]);
    let current = start;
    for (let depth = 0; depth < 4; depth += 1) {
      const nextEdge = (outgoingByNode.get(current.id) ?? []).filter((edge) => !visited.has(edge.to)).sort((a, b) => (atlas.nodeById.get(b.to)?.confidence ?? 0) - (atlas.nodeById.get(a.to)?.confidence ?? 0))[0];
      if (!nextEdge) break;
      const nextNode = atlas.nodeById.get(nextEdge.to);
      if (!nextNode) break;
      edges.push(nextEdge);
      nodes.push(nextNode);
      visited.add(nextNode.id);
      current = nextNode;
    }
    if (nodes.length < 2) continue;
    const signature = nodes.map((node) => node.id).join("→");
    if (seenSignatures.has(signature)) continue;
    seenSignatures.add(signature);
    const sourceIds = new Set<string>();
    nodes.forEach((node) => node.source_ids.forEach((sourceId) => sourceIds.add(sourceId)));
    edges.forEach((edge) => edge.source_ids.forEach((sourceId) => sourceIds.add(sourceId)));
    trails.push({ id: signature, title: makeTrailTitle(nodes), nodes, edges, sourceCount: sourceIds.size, evidenceCount: nodes.reduce((total, node) => total + node.source_refs.length, 0) + edges.length });
    if (trails.length >= limit) break;
  }
  return trails;
}

function makeTrailTitle(nodes: ThoughtNodeDoc[]) {
  const tags = nodes.flatMap((node) => node.tags).filter(Boolean);
  const commonTag = tags.find((tag, index) => tags.indexOf(tag) !== index);
  return commonTag ? `${commonTag}: ${nodes[0].title}` : nodes[0].title;
}
