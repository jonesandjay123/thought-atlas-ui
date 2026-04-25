import { useEffect, useMemo, useState } from "react";
import { loginWithGoogle, logout, subscribeToAuthState, type AuthSnapshot } from "./clients/authClient";
import { loadThoughtAtlasFromFirestore } from "./clients/firestoreThoughtAtlasClient";
import { hasFirebaseConfig } from "./clients/firebaseApp";
import { I18nProvider, getUiText, useUiText, type Locale } from "./i18n";
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

const tabIds: TabId[] = ["overview", "themes", "sources", "nodes", "reports", "graph"];

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
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "zh";
    return window.localStorage.getItem("thought-atlas-locale") === "en" ? "en" : "zh";
  });

  useEffect(() => subscribeToAuthState(setAuth), []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("thought-atlas-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hant" : "en";
    window.localStorage.setItem("thought-atlas-locale", locale);
  }, [locale]);

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

  const ui = getUiText(locale);

  return (
    <I18nProvider locale={locale}>
    <main className="app-shell">
      <section className="topbar" aria-label="Thought Atlas overview">
        <div>
          <p className="eyebrow">{ui.topEyebrow}</p>
          <h1>Thought Atlas</h1>
          <p className="topbar-subtitle">
            {ui.topSubtitle}
          </p>
          <StatusPill loadState={loadState} error={error} mode={atlas.mode} />
          <PublicModelNote />
        </div>
        <div className="topbar-actions">
          <AuthStatus auth={auth} ui={ui} />
          <button className="theme-toggle" onClick={() => setLocale((current) => current === "zh" ? "en" : "zh")} aria-label="Toggle language">
            <span>{locale === "zh" ? "中文" : "EN"}</span>
            <strong>文</strong>
          </button>
          <button className="theme-toggle" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")} aria-label="Toggle dark mode">
            <span>{theme === "dark" ? ui.themeMode.dark : ui.themeMode.light}</span>
            <strong>{theme === "dark" ? "☾" : "☀"}</strong>
          </button>
          <div className="metrics" aria-label="Atlas metrics">
          <Metric value={atlas.meta.source_count || atlas.sources.length} label={ui.metrics.sources} />
          <Metric value={atlas.meta.node_count || atlas.nodes.length} label={ui.metrics.nodes} />
          <Metric value={atlas.meta.edge_count || atlas.edges.length} label={ui.metrics.edges} />
            <Metric value={atlas.meta.report_count || atlas.reports.length} label={ui.metrics.reports} />
          </div>
        </div>
      </section>

      <nav className="tabbar" aria-label="Thought Atlas sections">
        {tabIds.map((tabId) => (
          <button key={tabId} className={activeTab === tabId ? "active" : ""} onClick={() => setActiveTab(tabId)}>
            {ui.tabs[tabId]}
          </button>
        ))}
      </nav>

      <section className="workspace live-workspace">
        <aside className="inbox-panel source-panel" aria-label="Sources and filters">
          <div className="panel-heading">
            <p className="eyebrow">{ui.sourcesPanel.eyebrow}</p>
            <h2>{ui.sourcesPanel.title}</h2>
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
            <section className="detail-card"><p>{ui.common.noSelectedNode}</p></section>
          )}
        </aside>
      </section>
    </main>
    </I18nProvider>
  );
}

function StatusPill({ loadState, error, mode }: { loadState: LoadState; error: string | null; mode: string }) {
  const ui = useUiText();
  const label = loadState === "ready" ? ui.status.ready : loadState === "loading" ? ui.status.loading : loadState === "mock" ? ui.status.mock : ui.status.error;
  return (
    <div className={`status-pill ${loadState}`}>
      <strong>{label}</strong>
      <span>{mode === "firestore" ? ui.status.live : ui.status.preview}</span>
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
  const ui = useUiText();
  return <p className="public-model-note">{ui.publicNote}</p>;
}

function AuthStatus({ auth, ui }: { auth: AuthSnapshot; ui: ReturnType<typeof getUiText> }) {
  return (
    <section className={auth.isOwner ? "auth-card owner" : "auth-card"} aria-label="Optional Google login status">
      <div>
        <strong>{auth.isOwner ? ui.auth.owner : auth.email ? ui.auth.signedIn : ui.auth.publicVisitor}</strong>
        <span>{auth.email ?? ui.auth.noLogin}</span>
      </div>
      {auth.email ? (
        <button onClick={() => void logout()}>{ui.auth.logout}</button>
      ) : (
        <button onClick={() => void loginWithGoogle()}>{ui.auth.login}</button>
      )}
    </section>
  );
}


export default App;
