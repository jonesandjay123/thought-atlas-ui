import { useEffect, useMemo, useState } from "react";
import { loadThoughtAtlasFromFirestore } from "./clients/firestoreThoughtAtlasClient";
import { hasFirebaseConfig } from "./clients/firebaseApp";
import type { ThoughtEdgeDoc, ThoughtNodeDoc, ThoughtReportDoc, ThoughtSourceDoc } from "./firestoreTypes";
import {
  createMockThoughtAtlasViewModel,
  type ThoughtAtlasViewModel,
} from "./viewModels/thoughtAtlasViewModel";

type TabId = "overview" | "sources" | "nodes" | "reports" | "graph";
type LoadState = "loading" | "ready" | "mock" | "error";

const tabs: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "sources", label: "Sources" },
  { id: "nodes", label: "Nodes" },
  { id: "reports", label: "Reports" },
  { id: "graph", label: "Graph" },
];

function App() {
  const [atlas, setAtlas] = useState<ThoughtAtlasViewModel>(() => createMockThoughtAtlasViewModel());
  const [loadState, setLoadState] = useState<LoadState>(() => (hasFirebaseConfig() ? "loading" : "mock"));
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [selectedSourceId, setSelectedSourceId] = useState<string>("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  useEffect(() => {
    if (!hasFirebaseConfig()) return;

    let cancelled = false;
    setLoadState("loading");
    loadThoughtAtlasFromFirestore()
      .then((loadedAtlas) => {
        if (cancelled) return;
        setAtlas(loadedAtlas);
        setError(null);
        setLoadState("ready");
        setSelectedNodeId((current) => current ?? loadedAtlas.nodes[0]?.id ?? null);
        setSelectedReportId((current) => current ?? loadedAtlas.reports[0]?.source_id ?? null);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : String(loadError));
        setLoadState("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedNodeId && atlas.nodes.length > 0) setSelectedNodeId(atlas.nodes[0].id);
    if (!selectedReportId && atlas.reports.length > 0) setSelectedReportId(atlas.reports[0].source_id);
  }, [atlas.nodes, atlas.reports, selectedNodeId, selectedReportId]);

  const filteredNodes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return atlas.nodes.filter((node) => {
      const matchesQuery =
        !normalizedQuery ||
        [node.title, node.body, node.kind, ...node.tags].join(" ").toLowerCase().includes(normalizedQuery);
      const matchesKind = kindFilter === "all" || node.kind === kindFilter;
      const matchesTag = tagFilter === "all" || node.tags.includes(tagFilter);
      const matchesSource = selectedSourceId === "all" || node.source_ids.includes(selectedSourceId);
      return matchesQuery && matchesKind && matchesTag && matchesSource;
    });
  }, [atlas.nodes, kindFilter, query, selectedSourceId, tagFilter]);

  const selectedNode = useMemo(
    () => atlas.nodeById.get(selectedNodeId ?? "") ?? filteredNodes[0] ?? atlas.nodes[0],
    [atlas.nodeById, atlas.nodes, filteredNodes, selectedNodeId],
  );

  const relatedEdges = useMemo(
    () =>
      selectedNode
        ? atlas.edges.filter((edge) => edge.from === selectedNode.id || edge.to === selectedNode.id)
        : [],
    [atlas.edges, selectedNode],
  );

  const filteredEdges = useMemo(
    () =>
      atlas.edges.filter((edge) => {
        const matchesSource = selectedSourceId === "all" || edge.source_ids.includes(selectedSourceId);
        const matchesNode = !selectedNode || edge.from === selectedNode.id || edge.to === selectedNode.id;
        return matchesSource && (activeTab === "graph" ? true : matchesNode);
      }),
    [activeTab, atlas.edges, selectedNode, selectedSourceId],
  );

  const selectedReport =
    atlas.reportBySourceId.get(selectedReportId ?? "") ??
    (selectedSourceId !== "all" ? atlas.reportBySourceId.get(selectedSourceId) : undefined) ??
    atlas.reports[0];

  const expectedCounts = atlas.meta.source_count === 3 && atlas.meta.node_count === 38 && atlas.meta.edge_count === 37 && atlas.meta.report_count === 3;

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Thought Atlas overview">
        <div>
          <p className="eyebrow">Firestore read-only explorer</p>
          <h1>Thought Atlas</h1>
          <p className="topbar-subtitle">
            Browse sources, nodes, relations, and ingest reports mirrored from the local Thought Atlas backend. UI is read-only: no writes, no ingest, no sync.
          </p>
          <StatusPill loadState={loadState} error={error} mode={atlas.mode} />
        </div>
        <div className="metrics" aria-label="Atlas metrics">
          <Metric value={atlas.meta.source_count || atlas.sources.length} label="sources" />
          <Metric value={atlas.meta.node_count || atlas.nodes.length} label="nodes" />
          <Metric value={atlas.meta.edge_count || atlas.edges.length} label="edges" />
          <Metric value={atlas.meta.report_count || atlas.reports.length} label="reports" />
        </div>
      </section>

      <nav className="tabbar" aria-label="Thought Atlas sections">
        {tabs.map((tab) => (
          <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="workspace live-workspace">
        <aside className="inbox-panel source-panel" aria-label="Sources and filters">
          <div className="panel-heading">
            <p className="eyebrow">Sources</p>
            <h2>Seed corpus</h2>
          </div>
          <SourcePicker
            sources={atlas.sources}
            selectedSourceId={selectedSourceId}
            onSelectSource={(sourceId) => {
              setSelectedSourceId(sourceId);
              if (sourceId !== "all") setSelectedReportId(sourceId);
            }}
          />
        </aside>

        <section className="atlas-panel" aria-label="Thought Atlas content">
          {activeTab === "overview" && (
            <OverviewPanel atlas={atlas} expectedCounts={expectedCounts} onOpenNodes={() => setActiveTab("nodes")} />
          )}
          {activeTab === "sources" && <SourcesPanel atlas={atlas} selectedSourceId={selectedSourceId} />}
          {activeTab === "nodes" && (
            <NodesPanel
              atlas={atlas}
              filteredNodes={filteredNodes}
              selectedNode={selectedNode}
              query={query}
              kindFilter={kindFilter}
              tagFilter={tagFilter}
              onQuery={setQuery}
              onKindFilter={setKindFilter}
              onTagFilter={setTagFilter}
              onSelectNode={setSelectedNodeId}
            />
          )}
          {activeTab === "reports" && (
            <ReportsPanel
              atlas={atlas}
              selectedReport={selectedReport}
              selectedReportId={selectedReport?.source_id ?? null}
              onSelectReport={setSelectedReportId}
            />
          )}
          {activeTab === "graph" && (
            <GraphPanel
              nodes={filteredNodes.length ? filteredNodes : atlas.nodes}
              edges={filteredEdges}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNodeId}
            />
          )}
        </section>

        <aside className="inspector-panel" aria-label="Node inspector and relations">
          {selectedNode ? (
            <Inspector node={selectedNode} relatedEdges={relatedEdges} atlas={atlas} />
          ) : (
            <section className="detail-card"><p>No node selected.</p></section>
          )}
        </aside>
      </section>
    </main>
  );
}

function StatusPill({ loadState, error, mode }: { loadState: LoadState; error: string | null; mode: string }) {
  const label = loadState === "ready" ? "Live Firestore" : loadState === "loading" ? "Loading Firestore…" : loadState === "mock" ? "Mock fallback" : "Firestore error";
  return (
    <div className={`status-pill ${loadState}`}>
      <strong>{label}</strong>
      <span>{mode === "firestore" ? "getDoc / getDocs · read-only" : "local preview data"}</span>
      {error ? <small>{error}</small> : null}
    </div>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SourcePicker({
  sources,
  selectedSourceId,
  onSelectSource,
}: {
  sources: ThoughtSourceDoc[];
  selectedSourceId: string;
  onSelectSource: (sourceId: string) => void;
}) {
  return (
    <div className="source-list">
      <button className={selectedSourceId === "all" ? "source-card active" : "source-card"} onClick={() => onSelectSource("all")}>
        <strong>All sources</strong>
        <span>Show complete graph mirror</span>
      </button>
      {sources.map((source) => (
        <button
          key={source.source_id}
          className={selectedSourceId === source.source_id ? "source-card active" : "source-card"}
          onClick={() => onSelectSource(source.source_id)}
        >
          <strong>{source.title}</strong>
          <span>{source.source_id}</span>
        </button>
      ))}
    </div>
  );
}

function OverviewPanel({ atlas, expectedCounts, onOpenNodes }: { atlas: ThoughtAtlasViewModel; expectedCounts: boolean; onOpenNodes: () => void }) {
  return (
    <div className="stack">
      <section className="overview-card hero-card">
        <p className="eyebrow">Data status</p>
        <h2>{atlas.meta.project_id || "thought-atlas"}</h2>
        <p className="summary">
          Last exported at {formatDate(atlas.meta.exported_at)}. Local graph updated at {formatDate(atlas.meta.local_graph_updated_at)}.
        </p>
        <div className={expectedCounts ? "success-banner" : "warning-banner"}>
          {expectedCounts ? "Expected seed counts detected: 3 sources / 38 nodes / 37 edges / 3 reports." : "Counts loaded, but they do not match the expected seed snapshot."}
        </div>
        <button className="primary-action" onClick={onOpenNodes}>Explore nodes</button>
      </section>
      <section className="overview-grid">
        <MiniCollection title="Sources" items={atlas.sources.map((source) => source.title)} />
        <MiniCollection title="Node kinds" items={atlas.kinds} />
        <MiniCollection title="Top tags" items={atlas.tags.slice(0, 18)} />
      </section>
    </div>
  );
}

function SourcesPanel({ atlas, selectedSourceId }: { atlas: ThoughtAtlasViewModel; selectedSourceId: string }) {
  const selectedSources = selectedSourceId === "all" ? atlas.sources : atlas.sources.filter((source) => source.source_id === selectedSourceId);
  return (
    <div className="card-grid">
      {selectedSources.map((source) => (
        <article className="collection-card" key={source.source_id}>
          <div className="item-row"><strong>{source.title}</strong><span>{source.status}</span></div>
          <p className="mono-id">{source.source_id}</p>
          <p className="summary">{source.source_type} · updated {formatDate(source.updated_at ?? source.last_seen_at)}</p>
          <div className="tag-row">{source.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <dl className="property-grid compact">
            <div><dt>Nodes</dt><dd>{atlas.nodes.filter((node) => node.source_ids.includes(source.source_id)).length}</dd></div>
            <div><dt>Edges</dt><dd>{atlas.edges.filter((edge) => edge.source_ids.includes(source.source_id)).length}</dd></div>
            <div><dt>Report</dt><dd>{atlas.reportBySourceId.has(source.source_id) ? "yes" : "no"}</dd></div>
          </dl>
        </article>
      ))}
    </div>
  );
}

function NodesPanel({
  atlas,
  filteredNodes,
  selectedNode,
  query,
  kindFilter,
  tagFilter,
  onQuery,
  onKindFilter,
  onTagFilter,
  onSelectNode,
}: {
  atlas: ThoughtAtlasViewModel;
  filteredNodes: ThoughtNodeDoc[];
  selectedNode?: ThoughtNodeDoc;
  query: string;
  kindFilter: string;
  tagFilter: string;
  onQuery: (value: string) => void;
  onKindFilter: (value: string) => void;
  onTagFilter: (value: string) => void;
  onSelectNode: (nodeId: string) => void;
}) {
  return (
    <div className="stack">
      <div className="filter-row">
        <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search title, body, kind, tags…" />
        <select value={kindFilter} onChange={(event) => onKindFilter(event.target.value)}><option value="all">All kinds</option>{atlas.kinds.map((kind) => <option key={kind}>{kind}</option>)}</select>
        <select value={tagFilter} onChange={(event) => onTagFilter(event.target.value)}><option value="all">All tags</option>{atlas.tags.map((tag) => <option key={tag}>{tag}</option>)}</select>
      </div>
      <div className="node-list">
        {filteredNodes.map((node) => (
          <button key={node.id} className={selectedNode?.id === node.id ? "node-row active" : "node-row"} onClick={() => onSelectNode(node.id)}>
            <span className="node-main"><strong>{node.title}</strong><small>{node.kind} · {Math.round(node.confidence * 100)}%</small></span>
            <span className="summary">{truncate(node.body, 180)}</span>
            <span className="tag-row inline-tags">{node.tags.slice(0, 5).map((tag) => <em key={tag}>{tag}</em>)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ReportsPanel({
  atlas,
  selectedReport,
  selectedReportId,
  onSelectReport,
}: {
  atlas: ThoughtAtlasViewModel;
  selectedReport?: ThoughtReportDoc;
  selectedReportId: string | null;
  onSelectReport: (sourceId: string) => void;
}) {
  return (
    <div className="reports-layout">
      <div className="report-list">
        {atlas.reports.map((report) => (
          <button key={report.source_id} className={selectedReportId === report.source_id ? "source-card active" : "source-card"} onClick={() => onSelectReport(report.source_id)}>
            <strong>{atlas.sourceById.get(report.source_id)?.title ?? report.source_id}</strong>
            <span>{report.digest_items} digest items · {report.patch_operations} ops</span>
          </button>
        ))}
      </div>
      <article className="report-view">
        <p className="eyebrow">Ingest report</p>
        <h2>{selectedReport ? atlas.sourceById.get(selectedReport.source_id)?.title ?? selectedReport.source_id : "No report"}</h2>
        <pre>{selectedReport?.markdown ?? "No report selected."}</pre>
      </article>
    </div>
  );
}

function GraphPanel({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
}: {
  nodes: ThoughtNodeDoc[];
  edges: ThoughtEdgeDoc[];
  selectedNode?: ThoughtNodeDoc;
  onSelectNode: (nodeId: string) => void;
}) {
  const positions = useMemo(() => layoutNodes(nodes), [nodes]);
  return (
    <div className="graph-frame live-graph">
      <svg viewBox="0 0 1000 720" role="img" aria-label="Thought graph neighborhood preview">
        <rect width="1000" height="720" rx="28" fill="#f8f1e6" />
        <g>
          {edges.map((edge) => {
            const from = positions.get(edge.from);
            const to = positions.get(edge.to);
            if (!from || !to) return null;
            const selected = selectedNode && (edge.from === selectedNode.id || edge.to === selectedNode.id);
            return <line key={edge.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={selected ? "#111827" : "#9a927f"} strokeWidth={selected ? 3.5 : 1.4} opacity={selected ? 0.76 : 0.32} />;
          })}
        </g>
        <g>
          {nodes.map((node) => {
            const point = positions.get(node.id);
            if (!point) return null;
            const selected = selectedNode?.id === node.id;
            return (
              <g key={node.id} className="graph-node" role="button" tabIndex={0} onClick={() => onSelectNode(node.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelectNode(node.id); }}>
                <circle cx={point.x} cy={point.y} r={selected ? 25 : 18} fill={colorForKind(node.kind)} stroke={selected ? "#111827" : "#fffaf0"} strokeWidth={selected ? 5 : 3} />
                <text x={point.x} y={point.y + 39} className="node-label">{node.title}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function Inspector({ node, relatedEdges, atlas }: { node: ThoughtNodeDoc; relatedEdges: ThoughtEdgeDoc[]; atlas: ThoughtAtlasViewModel }) {
  return (
    <section className="detail-card inspector-card">
      <div className="panel-heading"><p className="eyebrow">Node inspector</p><h2>{node.title}</h2></div>
      <p className="summary">{node.body}</p>
      <dl className="property-grid">
        <div><dt>Kind</dt><dd>{node.kind}</dd></div>
        <div><dt>Confidence</dt><dd>{Math.round(node.confidence * 100)}%</dd></div>
        <div><dt>Sources</dt><dd>{node.source_ids.length}</dd></div>
      </dl>
      <div className="tag-row">{node.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      <div className="relations"><h3>Relations</h3>{relatedEdges.map((edge) => <RelationRow key={edge.id} edge={edge} currentNodeId={node.id} atlas={atlas} />)}</div>
      <div className="relations"><h3>Source refs</h3>{node.source_refs.length ? node.source_refs.map((ref, index) => <p className="source-ref" key={index}>{String(ref.source_id ?? ref.sourceId ?? "source")} · {String(ref.locator ?? ref.excerpt ?? ref.quote ?? "reference")}</p>) : <p className="summary">No source refs exported for this node.</p>}</div>
    </section>
  );
}

function RelationRow({ edge, currentNodeId, atlas }: { edge: ThoughtEdgeDoc; currentNodeId: string; atlas: ThoughtAtlasViewModel }) {
  const otherId = edge.from === currentNodeId ? edge.to : edge.from;
  const other = atlas.nodeById.get(otherId);
  return <div className="relation-row"><span>{edge.relation}</span><strong>{other?.title ?? otherId}</strong><small>{edge.rationale}</small></div>;
}

function MiniCollection({ title, items }: { title: string; items: string[] }) {
  return <article className="overview-card"><h3>{title}</h3><div className="mini-node-list">{items.map((item) => <span key={item}>{item}</span>)}</div></article>;
}

function layoutNodes(nodes: ThoughtNodeDoc[]) {
  const centerX = 500;
  const centerY = 360;
  const radius = nodes.length > 18 ? 275 : 230;
  return new Map(nodes.map((node, index) => {
    const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const ring = index % 5 === 0 ? radius * 0.52 : radius;
    return [node.id, { x: centerX + Math.cos(angle) * ring, y: centerY + Math.sin(angle) * ring }];
  }));
}

function colorForKind(kind: string) {
  const palette = ["#345995", "#2c7a5b", "#7b6d3a", "#8d4f3f", "#4b5563", "#6d5bd0"];
  let hash = 0;
  for (const char of kind) hash = (hash + char.charCodeAt(0)) % palette.length;
  return palette[hash];
}

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length).trim()}…` : value;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default App;
