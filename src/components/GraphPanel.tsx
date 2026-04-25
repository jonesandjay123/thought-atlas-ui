import { useEffect, useState } from "react";
import type { ThoughtEdgeDoc, ThoughtNodeDoc } from "../firestoreTypes";
import type { ThoughtAtlasViewModel } from "../viewModels/thoughtAtlasViewModel";
import { truncate } from "../utils/format";
import { getNodeNeighborhood } from "../selectors/atlasSelectors";
import { useUiText } from "../i18n";

export function GraphPanel({
  atlas,
  edges,
  selectedNode,
  onSelectNode,
}: {
  atlas: ThoughtAtlasViewModel;
  edges: ThoughtEdgeDoc[];
  selectedNode?: ThoughtNodeDoc;
  onSelectNode: (nodeId: string) => void;
}) {
  const ui = useUiText();
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [focusHistory, setFocusHistory] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const { incomingEdges, outgoingEdges } = selectedNode ? getNodeNeighborhood(atlas, selectedNode.id, edges) : { incomingEdges: [], outgoingEdges: [] };
  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId) ?? null;
  const bodyIsLong = Boolean(selectedNode && selectedNode.body.length > 190);
  const displayBody = selectedNode ? (expanded ? selectedNode.body : truncate(selectedNode.body, 190)) : "";

  useEffect(() => {
    setSelectedEdgeId(null);
    setExpanded(false);
  }, [selectedNode?.id]);

  if (!selectedNode) {
    return <p className="empty-state">{ui.graph.selectNode}</p>;
  }

  const selectNeighbor = (nodeId: string) => {
    if (nodeId === selectedNode.id) return;
    setFocusHistory((history) => [...history.slice(-8), selectedNode.id]);
    onSelectNode(nodeId);
  };
  const goBack = () => {
    const previous = focusHistory.at(-1);
    if (!previous) return;
    setFocusHistory((history) => history.slice(0, -1));
    onSelectNode(previous);
  };

  return (
    <div className="neighborhood-layout">
      <div className="graph-polish-bar">
        <p>{ui.graph.tip}</p>
        <button className="secondary-action compact-action" disabled={!focusHistory.length} onClick={goBack}>{ui.graph.back}</button>
      </div>
      <section className="neighborhood-stage" aria-label="Local neighborhood graph">
        <div className="neighborhood-column incoming-column">
          <p className="eyebrow">{ui.graph.incoming}</p>
          {incomingEdges.length ? incomingEdges.map((edge) => (
            <NeighborNodeCard key={edge.id} edge={edge} node={atlas.nodeById.get(edge.from)} direction="incoming" selected={selectedEdge?.id === edge.id} onSelectEdge={setSelectedEdgeId} onSelectNode={selectNeighbor} />
          )) : <p className="empty-state">{ui.graph.noneIncoming}</p>}
        </div>
        <div className={expanded ? "center-node-card expanded" : "center-node-card"}>
          <p className="eyebrow">{ui.graph.selected}</p>
          <strong>{selectedNode.title}</strong>
          <span>{selectedNode.kind} · {Math.round(selectedNode.confidence * 100)}%</span>
          <p className="center-node-summary">{displayBody}</p>
          {bodyIsLong ? <button className="text-action" onClick={() => setExpanded((value) => !value)}>{expanded ? ui.graph.collapse : ui.graph.expand}</button> : null}
        </div>
        <div className="neighborhood-column outgoing-column">
          <p className="eyebrow">{ui.graph.outgoing}</p>
          {outgoingEdges.length ? outgoingEdges.map((edge) => (
            <NeighborNodeCard key={edge.id} edge={edge} node={atlas.nodeById.get(edge.to)} direction="outgoing" selected={selectedEdge?.id === edge.id} onSelectEdge={setSelectedEdgeId} onSelectNode={selectNeighbor} />
          )) : <p className="empty-state">{ui.graph.noneOutgoing}</p>}
        </div>
        <svg className="neighborhood-svg" viewBox="0 0 1000 520" aria-hidden="true">
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="currentColor" />
            </marker>
          </defs>
          {incomingEdges.map((edge, index) => {
            const y = laneY(index, incomingEdges.length);
            return <NeighborhoodEdgeLine key={edge.id} x1={250} y1={y} x2={455} y2={260} edge={edge} selected={selectedEdge?.id === edge.id} onSelectEdge={setSelectedEdgeId} />;
          })}
          {outgoingEdges.map((edge, index) => {
            const y = laneY(index, outgoingEdges.length);
            return <NeighborhoodEdgeLine key={edge.id} x1={545} y1={260} x2={750} y2={y} edge={edge} selected={selectedEdge?.id === edge.id} onSelectEdge={setSelectedEdgeId} />;
          })}
        </svg>
      </section>
      <EdgeRationalePanel edge={selectedEdge} atlas={atlas} />
      <small className="quiet-version-mark">v1.5-i18n · zh-default</small>
    </div>
  );
}


function NeighborNodeCard({
  edge,
  node,
  direction,
  selected,
  onSelectEdge,
  onSelectNode,
}: {
  edge: ThoughtEdgeDoc;
  node?: ThoughtNodeDoc;
  direction: "incoming" | "outgoing";
  selected: boolean;
  onSelectEdge: (edgeId: string) => void;
  onSelectNode: (nodeId: string) => void;
}) {
  if (!node) return null;
  return (
    <button
      className={selected ? "neighbor-card active" : "neighbor-card"}
      onMouseEnter={() => onSelectEdge(edge.id)}
      onFocus={() => onSelectEdge(edge.id)}
      onClick={() => onSelectNode(node.id)}
      title={edge.rationale}
    >
      <span className="relation-badge">{direction === "incoming" ? "→" : "←"} {edge.relation}</span>
      <strong>{node.title}</strong>
      <small>{node.kind} · {Math.round(node.confidence * 100)}%</small>
    </button>
  );
}


function NeighborhoodEdgeLine({
  x1,
  y1,
  x2,
  y2,
  edge,
  selected,
  onSelectEdge,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  edge: ThoughtEdgeDoc;
  selected: boolean;
  onSelectEdge: (edgeId: string) => void;
}) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return (
    <g className={selected ? "neighborhood-edge active" : "neighborhood-edge"} onMouseEnter={() => onSelectEdge(edge.id)} onFocus={() => onSelectEdge(edge.id)} onClick={() => onSelectEdge(edge.id)}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} markerEnd="url(#arrow)" />
      <rect className="edge-label-bg" x={midX - 54} y={midY - 31} width="108" height="24" rx="12" />
      <text x={midX} y={midY - 14}>{edge.relation}</text>
    </g>
  );
}


function EdgeRationalePanel({ edge, atlas }: { edge: ThoughtEdgeDoc | null; atlas: ThoughtAtlasViewModel }) {
  const ui = useUiText();
  if (!edge) return <aside className="edge-rationale-panel"><p className="empty-state">{ui.graph.hover}</p></aside>;
  return (
    <aside className="edge-rationale-panel">
      <p className="eyebrow">{ui.graph.rationale}</p>
      <h3>{edge.relation}</h3>
      <p className="summary"><strong>{atlas.nodeById.get(edge.from)?.title ?? edge.from}</strong> → <strong>{atlas.nodeById.get(edge.to)?.title ?? edge.to}</strong></p>
      <p>{edge.rationale}</p>
      <div className="tag-row inline-tags">{edge.source_ids.map((sourceId) => <em key={sourceId}>{atlas.sourceById.get(sourceId)?.title ?? sourceId}</em>)}</div>
    </aside>
  );
}


function laneY(index: number, total: number) {
  if (total <= 1) return 260;
  const top = 110;
  const bottom = 410;
  return top + (index / (total - 1)) * (bottom - top);
}
