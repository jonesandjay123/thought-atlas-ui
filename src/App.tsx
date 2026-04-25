import { useEffect, useMemo, useState } from "react";
import { loadThoughtAtlasFromFirestore } from "./clients/firestoreThoughtAtlasClient";
import { hasFirebaseConfig } from "./clients/firebaseApp";
import type {
  FirestoreSourceRef,
  ThoughtDigestDoc,
  ThoughtEdgeDoc,
  ThoughtNodeDoc,
  ThoughtReportDoc,
  ThoughtSourceDoc,
} from "./firestoreTypes";
import {
  createMockThoughtAtlasViewModel,
  type ThoughtAtlasViewModel,
} from "./viewModels/thoughtAtlasViewModel";

type TabId = "overview" | "sources" | "nodes" | "reports" | "graph";
type LoadState = "loading" | "ready" | "mock" | "error";
type ThemeMode = "dark" | "light";

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
  const [nodeQuery, setNodeQuery] = useState("");
  const [sourceQuery, setSourceQuery] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("thought-atlas-theme") === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("thought-atlas-theme", theme);
  }, [theme]);

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

  const filteredSources = useMemo(() => {
    const normalizedQuery = sourceQuery.trim().toLowerCase();
    return atlas.sources.filter((source) => {
      if (!normalizedQuery) return true;
      return [source.title, source.source_id, source.source_type, ...source.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [atlas.sources, sourceQuery]);

  const filteredNodes = useMemo(() => {
    const normalizedQuery = nodeQuery.trim().toLowerCase();
    return atlas.nodes.filter((node) => {
      const matchesQuery =
        !normalizedQuery ||
        [node.title, node.body, node.kind, ...node.tags].join(" ").toLowerCase().includes(normalizedQuery);
      const matchesKind = kindFilter === "all" || node.kind === kindFilter;
      const matchesTag = tagFilter === "all" || node.tags.includes(tagFilter);
      const matchesSource = selectedSourceId === "all" || node.source_ids.includes(selectedSourceId);
      return matchesQuery && matchesKind && matchesTag && matchesSource;
    });
  }, [atlas.nodes, kindFilter, nodeQuery, selectedSourceId, tagFilter]);

  const selectedSource = selectedSourceId === "all" ? undefined : atlas.sourceById.get(selectedSourceId);
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

  const sourceEdges = useMemo(
    () => atlas.edges.filter((edge) => selectedSourceId === "all" || edge.source_ids.includes(selectedSourceId)),
    [atlas.edges, selectedSourceId],
  );

  const selectedReport =
    atlas.reportBySourceId.get(selectedReportId ?? "") ??
    (selectedSourceId !== "all" ? atlas.reportBySourceId.get(selectedSourceId) : undefined) ??
    atlas.reports[0];

  const expectedCounts =
    atlas.meta.source_count === 3 &&
    atlas.meta.node_count === 38 &&
    atlas.meta.edge_count === 37 &&
    atlas.meta.report_count === 3;

  const selectSource = (sourceId: string, targetTab: TabId = activeTab) => {
    setSelectedSourceId(sourceId);
    if (sourceId !== "all") setSelectedReportId(sourceId);
    setActiveTab(targetTab);
  };

  const selectNode = (nodeId: string, targetTab: TabId = activeTab) => {
    setSelectedNodeId(nodeId);
    setActiveTab(targetTab);
  };

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
        <div className="topbar-actions">
          <button className="theme-toggle" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")} aria-label="Toggle dark mode">
            <span>{theme === "dark" ? "Dark" : "Light"}</span>
            <strong>{theme === "dark" ? "☾" : "☀"}</strong>
          </button>
          <div className="metrics" aria-label="Atlas metrics">
          <Metric value={atlas.meta.source_count || atlas.sources.length} label="sources" />
          <Metric value={atlas.meta.node_count || atlas.nodes.length} label="nodes" />
          <Metric value={atlas.meta.edge_count || atlas.edges.length} label="edges" />
            <Metric value={atlas.meta.report_count || atlas.reports.length} label="reports" />
          </div>
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
            sources={filteredSources}
            sourceQuery={sourceQuery}
            selectedSourceId={selectedSourceId}
            onSearch={setSourceQuery}
            onSelectSource={(sourceId) => selectSource(sourceId, "sources")}
          />
        </aside>

        <section className="atlas-panel" aria-label="Thought Atlas content">
          {activeTab === "overview" && (
            <OverviewPanel atlas={atlas} expectedCounts={expectedCounts} onOpenNodes={() => setActiveTab("nodes")} />
          )}
          {activeTab === "sources" && (
            <SourcesPanel
              atlas={atlas}
              sources={selectedSource ? [selectedSource] : filteredSources}
              selectedSourceId={selectedSourceId}
              onSelectNode={(nodeId) => selectNode(nodeId, "nodes")}
              onOpenReport={(sourceId) => {
                setSelectedReportId(sourceId);
                setActiveTab("reports");
              }}
            />
          )}
          {activeTab === "nodes" && (
            <NodesPanel
              atlas={atlas}
              filteredNodes={filteredNodes}
              selectedNode={selectedNode}
              query={nodeQuery}
              kindFilter={kindFilter}
              tagFilter={tagFilter}
              selectedSourceId={selectedSourceId}
              onQuery={setNodeQuery}
              onKindFilter={setKindFilter}
              onTagFilter={setTagFilter}
              onSourceFilter={(sourceId) => setSelectedSourceId(sourceId)}
              onSelectNode={(nodeId) => selectNode(nodeId)}
            />
          )}
          {activeTab === "reports" && (
            <ReportsPanel
              atlas={atlas}
              selectedReport={selectedReport}
              selectedReportId={selectedReport?.source_id ?? null}
              onSelectReport={setSelectedReportId}
              onSelectSource={(sourceId) => selectSource(sourceId, "sources")}
            />
          )}
          {activeTab === "graph" && (
            <GraphPanel
              nodes={filteredNodes.length ? filteredNodes : atlas.nodes}
              edges={sourceEdges}
              selectedNode={selectedNode}
              onSelectNode={(nodeId) => selectNode(nodeId)}
            />
          )}
        </section>

        <aside className="inspector-panel" aria-label="Node inspector and relations">
          {selectedNode ? (
            <Inspector node={selectedNode} relatedEdges={relatedEdges} atlas={atlas} onSelectSource={(sourceId) => selectSource(sourceId, "sources")} />
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
  sourceQuery,
  selectedSourceId,
  onSearch,
  onSelectSource,
}: {
  sources: ThoughtSourceDoc[];
  sourceQuery: string;
  selectedSourceId: string;
  onSearch: (value: string) => void;
  onSelectSource: (sourceId: string) => void;
}) {
  return (
    <div className="source-list">
      <input className="source-search" value={sourceQuery} onChange={(event) => onSearch(event.target.value)} placeholder="Search sources by title or id…" />
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
      {sources.length === 0 ? <p className="empty-state">No sources match this search.</p> : null}
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

function SourcesPanel({
  atlas,
  sources,
  selectedSourceId,
  onSelectNode,
  onOpenReport,
}: {
  atlas: ThoughtAtlasViewModel;
  sources: ThoughtSourceDoc[];
  selectedSourceId: string;
  onSelectNode: (nodeId: string) => void;
  onOpenReport: (sourceId: string) => void;
}) {
  return (
    <div className="source-detail-stack">
      {sources.map((source) => {
        const sourceNodes = atlas.nodes.filter((node) => node.source_ids.includes(source.source_id));
        const sourceEdges = atlas.edges.filter((edge) => edge.source_ids.includes(source.source_id));
        const report = atlas.reportBySourceId.get(source.source_id);
        const digest = atlas.digestBySourceId.get(source.source_id);
        return (
          <article className={selectedSourceId === source.source_id ? "collection-card selected" : "collection-card"} key={source.source_id}>
            <div className="item-row"><strong>{source.title}</strong><span>{source.status}</span></div>
            <p className="mono-id">{source.source_id}</p>
            <p className="summary">{source.source_type} · updated {formatDate(source.updated_at ?? source.last_seen_at)}</p>
            <div className="tag-row">{source.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <dl className="property-grid compact">
              <div><dt>Nodes</dt><dd>{sourceNodes.length}</dd></div>
              <div><dt>Edges</dt><dd>{sourceEdges.length}</dd></div>
              <div><dt>Report</dt><dd>{report ? "yes" : "no"}</dd></div>
            </dl>
            <DigestPreview digest={digest} />
            <div className="source-sections">
              <section>
                <div className="section-title-row"><h3>Generated nodes</h3><small>{sourceNodes.length}</small></div>
                <div className="compact-list">
                  {sourceNodes.map((node) => (
                    <button key={node.id} onClick={() => onSelectNode(node.id)}>
                      <strong>{node.title}</strong>
                      <span>{node.kind} · {Math.round(node.confidence * 100)}%</span>
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <div className="section-title-row"><h3>Related edges</h3><small>{sourceEdges.length}</small></div>
                <div className="compact-list">
                  {sourceEdges.map((edge) => (
                    <div className="edge-chip" key={edge.id}>
                      <strong>{atlas.nodeById.get(edge.from)?.title ?? edge.from}</strong>
                      <span>{edge.relation}</span>
                      <strong>{atlas.nodeById.get(edge.to)?.title ?? edge.to}</strong>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            {report ? <button className="secondary-action" onClick={() => onOpenReport(source.source_id)}>Open report</button> : null}
          </article>
        );
      })}
      {sources.length === 0 ? <p className="empty-state">No source selected or no source matches the current search.</p> : null}
    </div>
  );
}

function DigestPreview({ digest }: { digest?: ThoughtDigestDoc }) {
  if (!digest) return <p className="empty-state">No digest exported for this source.</p>;
  return (
    <section className="digest-preview">
      <h3>Digest</h3>
      <p className="summary">{digest.summary}</p>
      <small>{digest.item_count} digest items · {formatDate(digest.created_at)}</small>
    </section>
  );
}

function NodesPanel({
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
  return (
    <div className="stack">
      <div className="filter-row four-controls">
        <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search nodes by title, body, tags…" />
        <select value={kindFilter} onChange={(event) => onKindFilter(event.target.value)}><option value="all">All kinds</option>{atlas.kinds.map((kind) => <option key={kind}>{kind}</option>)}</select>
        <select value={tagFilter} onChange={(event) => onTagFilter(event.target.value)}><option value="all">All tags</option>{atlas.tags.map((tag) => <option key={tag}>{tag}</option>)}</select>
        <select value={selectedSourceId} onChange={(event) => onSourceFilter(event.target.value)}><option value="all">All sources</option>{atlas.sources.map((source) => <option key={source.source_id} value={source.source_id}>{source.title}</option>)}</select>
      </div>
      <p className="result-count">{filteredNodes.length} matching nodes</p>
      <div className="node-list">
        {filteredNodes.map((node) => (
          <button key={node.id} className={selectedNode?.id === node.id ? "node-row active" : "node-row"} onClick={() => onSelectNode(node.id)}>
            <span className="node-main"><strong>{node.title}</strong><small>{node.kind} · {Math.round(node.confidence * 100)}%</small></span>
            <span className="summary">{truncate(node.body, 180)}</span>
            <span className="tag-row inline-tags">{node.tags.slice(0, 5).map((tag) => <em key={tag}>{tag}</em>)}</span>
          </button>
        ))}
        {filteredNodes.length === 0 ? <p className="empty-state">No nodes match the current search and filters.</p> : null}
      </div>
    </div>
  );
}

function ReportsPanel({
  atlas,
  selectedReport,
  selectedReportId,
  onSelectReport,
  onSelectSource,
}: {
  atlas: ThoughtAtlasViewModel;
  selectedReport?: ThoughtReportDoc;
  selectedReportId: string | null;
  onSelectReport: (sourceId: string) => void;
  onSelectSource: (sourceId: string) => void;
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
        {selectedReport ? <button className="secondary-action" onClick={() => onSelectSource(selectedReport.source_id)}>Open source detail</button> : null}
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

function Inspector({
  node,
  relatedEdges,
  atlas,
  onSelectSource,
}: {
  node: ThoughtNodeDoc;
  relatedEdges: ThoughtEdgeDoc[];
  atlas: ThoughtAtlasViewModel;
  onSelectSource: (sourceId: string) => void;
}) {
  const incomingEdges = relatedEdges.filter((edge) => edge.to === node.id);
  const outgoingEdges = relatedEdges.filter((edge) => edge.from === node.id);
  const sourceTitles = node.source_ids.map((sourceId) => atlas.sourceById.get(sourceId)).filter(Boolean) as ThoughtSourceDoc[];

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
      <div className="relations"><h3>Related sources</h3>{sourceTitles.map((source) => <button className="source-ref-button" key={source.source_id} onClick={() => onSelectSource(source.source_id)}>{source.title}<span>{source.source_id}</span></button>)}</div>
      <div className="relations"><h3>Outgoing edges</h3>{outgoingEdges.length ? outgoingEdges.map((edge) => <RelationRow key={edge.id} edge={edge} currentNodeId={node.id} atlas={atlas} direction="outgoing" />) : <p className="empty-state">No outgoing edges.</p>}</div>
      <div className="relations"><h3>Incoming edges</h3>{incomingEdges.length ? incomingEdges.map((edge) => <RelationRow key={edge.id} edge={edge} currentNodeId={node.id} atlas={atlas} direction="incoming" />) : <p className="empty-state">No incoming edges.</p>}</div>
      <div className="relations"><h3>Source refs</h3>{node.source_refs.length ? node.source_refs.map((ref, index) => <SourceRefView refData={ref} atlas={atlas} key={index} />) : <p className="summary">No source refs exported for this node.</p>}</div>
    </section>
  );
}

function RelationRow({ edge, currentNodeId, atlas, direction }: { edge: ThoughtEdgeDoc; currentNodeId: string; atlas: ThoughtAtlasViewModel; direction: "incoming" | "outgoing" }) {
  const otherId = direction === "outgoing" ? edge.to : edge.from;
  const other = atlas.nodeById.get(otherId);
  return <div className="relation-row"><span>{edge.relation}</span><strong>{other?.title ?? otherId}</strong><small>{edge.rationale}</small></div>;
}

function SourceRefView({ refData, atlas }: { refData: FirestoreSourceRef; atlas: ThoughtAtlasViewModel }) {
  const sourceId = String(refData.source_id ?? refData.sourceId ?? "");
  const sourceTitle = atlas.sourceById.get(sourceId)?.title ?? (sourceId || "Unknown source");
  const locator = String(refData.locator ?? "");
  const excerpt = String(refData.excerpt ?? refData.quote ?? "");
  return (
    <article className="source-ref">
      <strong>{sourceTitle}</strong>
      {locator ? <span>{locator}</span> : null}
      {excerpt ? <p>{excerpt}</p> : null}
    </article>
  );
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
