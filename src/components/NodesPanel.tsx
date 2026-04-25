import type { ThoughtNodeDoc } from "../firestoreTypes";
import type { ThoughtAtlasViewModel } from "../viewModels/thoughtAtlasViewModel";
import { truncate } from "../utils/format";
import { useUiText } from "../i18n";

export function NodesPanel({
  atlas,
  filteredNodes,
  selectedNode,
  query,
  kindFilter,
  tagFilter,
  selectedSourceId,
  onQuery,
  onKindFilter,
  onTagFilter,
  onSourceFilter,
  onSelectNode,
}: {
  atlas: ThoughtAtlasViewModel;
  filteredNodes: ThoughtNodeDoc[];
  selectedNode?: ThoughtNodeDoc;
  query: string;
  kindFilter: string;
  tagFilter: string;
  selectedSourceId: string;
  onQuery: (value: string) => void;
  onKindFilter: (value: string) => void;
  onTagFilter: (value: string) => void;
  onSourceFilter: (value: string) => void;
  onSelectNode: (nodeId: string) => void;
}) {
  const ui = useUiText();
  const latestSources = [...atlas.sources].sort((a, b) => String(b.updated_at ?? b.last_seen_at ?? "").localeCompare(String(a.updated_at ?? a.last_seen_at ?? ""))).slice(0, 3);
  const tagCounts = atlas.nodes.flatMap((node) => node.tags).reduce<Map<string, number>>((counts, tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1), new Map());
  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14);
  const featuredThemes = topTags.slice(0, 6).map(([tag, count]) => ({
    tag,
    count,
    nodes: atlas.nodes.filter((node) => node.tags.includes(tag)).slice(0, 3),
  }));
  const recentNodes = [...atlas.nodes].sort((a, b) => String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? ""))).slice(0, 6);

  return (
    <div className="stack">
      <div className="filter-row four-controls">
        <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder={ui.nodesPanel.search} />
        <select value={kindFilter} onChange={(event) => onKindFilter(event.target.value)}><option value="all">{ui.nodesPanel.allKinds}</option>{atlas.kinds.map((kind) => <option key={kind}>{kind}</option>)}</select>
        <select value={tagFilter} onChange={(event) => onTagFilter(event.target.value)}><option value="all">{ui.nodesPanel.allTags}</option>{atlas.tags.map((tag) => <option key={tag}>{tag}</option>)}</select>
        <select value={selectedSourceId} onChange={(event) => onSourceFilter(event.target.value)}><option value="all">{ui.nodesPanel.allSources}</option>{atlas.sources.map((source) => <option key={source.source_id} value={source.source_id}>{source.title}</option>)}</select>
      </div>
      <p className="result-count">{filteredNodes.length} {ui.nodesPanel.matching}</p>
      <div className="node-list">
        {filteredNodes.map((node) => (
          <button key={node.id} className={selectedNode?.id === node.id ? "node-row active" : "node-row"} onClick={() => onSelectNode(node.id)}>
            <span className="node-main"><strong>{node.title}</strong><small>{node.kind} · {Math.round(node.confidence * 100)}%</small></span>
            <span className="summary">{truncate(node.body, 180)}</span>
            <span className="tag-row inline-tags">{node.tags.slice(0, 5).map((tag) => <em key={tag}>{tag}</em>)}</span>
          </button>
        ))}
        {filteredNodes.length === 0 ? <p className="empty-state">{ui.nodesPanel.none}</p> : null}
      </div>
    </div>
  );
}
