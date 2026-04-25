import { useEffect, useMemo, useState } from "react";
import { loginWithGoogle, logout, subscribeToAuthState, type AuthSnapshot } from "./clients/authClient";
import { loadThoughtAtlasFromFirestore } from "./clients/firestoreThoughtAtlasClient";
import { hasFirebaseConfig } from "./clients/firebaseApp";
import { GraphPanel } from "./components/GraphPanel";
import { Inspector } from "./components/Inspector";
import { NodesPanel } from "./components/NodesPanel";
import { OverviewPanel } from "./components/OverviewPanel";
import { ReportsPanel } from "./components/ReportsPanel";
import { SourcePicker } from "./components/SourcePicker";
import { SourcesPanel } from "./components/SourcesPanel";
import { ThemeDetailPanel } from "./components/ThemeDetailPanel";
import {
  createMockThoughtAtlasViewModel,
  type ThoughtAtlasViewModel,
} from "./viewModels/thoughtAtlasViewModel";

type TabId = "overview" | "themes" | "sources" | "nodes" | "reports" | "graph";
type LoadState = "loading" | "ready" | "mock" | "error";
type ThemeMode = "dark" | "light";

const tabs: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "themes", label: "Themes" },
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
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [nodeQuery, setNodeQuery] = useState("");
  const [sourceQuery, setSourceQuery] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [auth, setAuth] = useState<AuthSnapshot>({ user: null, email: null, isOwner: false, ready: false });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("thought-atlas-theme") === "light" ? "light" : "dark";
  });

  useEffect(() => subscribeToAuthState(setAuth), []);

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

  const selectTheme = (theme: string, targetTab: TabId = "themes") => {
    setSelectedTheme(theme);
    setTagFilter(theme);
    setActiveTab(targetTab);
  };

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Thought Atlas overview">
        <div>
          <p className="eyebrow">Public AI-assisted thought portfolio</p>
          <h1>Thought Atlas</h1>
          <p className="topbar-subtitle">
            A public map of ideas, questions, and projects emerging from long-running conversations with AI.
          </p>
          <StatusPill loadState={loadState} error={error} mode={atlas.mode} />
          <PublicModelNote />
        </div>
        <div className="topbar-actions">
          <AuthStatus auth={auth} />
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
            <OverviewPanel atlas={atlas} expectedCounts={expectedCounts} onOpenNodes={() => setActiveTab("nodes")} onOpenSources={() => setActiveTab("sources")} onOpenReports={() => setActiveTab("reports")} onOpenGraph={() => setActiveTab("graph")} onOpenTheme={selectTheme} onSelectTrailNode={(nodeId) => selectNode(nodeId, "graph")} />
          )}
          {activeTab === "themes" && (
            <ThemeDetailPanel
              atlas={atlas}
              selectedTheme={selectedTheme ?? atlas.tags[0] ?? ""}
              onSelectTheme={selectTheme}
              onSelectNode={(nodeId) => selectNode(nodeId, "graph")}
              onSelectSource={(sourceId) => selectSource(sourceId, "sources")}
              onOpenReport={(sourceId) => {
                setSelectedReportId(sourceId);
                setActiveTab("reports");
              }}
            />
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
              atlas={atlas}
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

function PublicModelNote() {
  return (
    <p className="public-model-note">
      Public-readable showcase · ideas, sources, reports, and relationships are open to browse · owner-only writing is reserved for future tools.
    </p>
  );
}

function AuthStatus({ auth }: { auth: AuthSnapshot }) {
  return (
    <section className={auth.isOwner ? "auth-card owner" : "auth-card"} aria-label="Optional Google login status">
      <div>
        <strong>{auth.isOwner ? "Owner mode" : auth.email ? "Visitor signed in" : "Public visitor"}</strong>
        <span>{auth.email ?? "No login needed to read"}</span>
      </div>
      {auth.email ? (
        <button onClick={() => void logout()}>Logout</button>
      ) : (
        <button onClick={() => void loginWithGoogle()}>Login with Google</button>
      )}
    </section>
  );
}


export default App;
