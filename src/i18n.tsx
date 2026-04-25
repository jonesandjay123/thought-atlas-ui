import { createContext, useContext, type ReactNode } from "react";

export type Locale = "zh" | "en";

const copy = {
  zh: {
    tabs: { overview: "總覽", themes: "主題", sources: "來源", nodes: "想法", reports: "報告", graph: "關係圖" },
    topEyebrow: "公開的 AI 輔助思想作品集",
    topSubtitle: "一張透過長期 AI 對話發展出的思想地圖——整理成主題、路徑、相連想法與來源證據。",
    publicNote: "公開作品集 · 可自由瀏覽 · 由對話、報告與專案筆記生成 · 訪客唯讀",
    themeMode: { dark: "深色", light: "淺色" },
    metrics: { sources: "來源", nodes: "想法", edges: "關係", reports: "報告" },
    sourcesPanel: { eyebrow: "來源", title: "種子資料", search: "搜尋來源標題或 ID…", allTitle: "全部來源", allDesc: "顯示完整思想圖譜", none: "沒有符合搜尋的來源。" },
    auth: { owner: "Owner 模式", signedIn: "訪客已登入", publicVisitor: "公開訪客", noLogin: "不需登入即可閱讀", login: "Google 登入", logout: "登出" },
    status: { ready: "Live 資料", loading: "載入資料中…", mock: "Mock 預覽", error: "資料讀取錯誤", live: "唯讀資料", preview: "本地預覽資料" },
    overview: {
      start: "從這裡開始", heroTitle: "想法、路徑與證據", heroBody: "Thought Atlas 把長對話、報告與專案筆記整理成一個公開思想作品集：主題、相連想法、敘事路徑與可追溯證據。", explore: "開始探索", liveCorpus: "live corpus loaded", corpus: "corpus loaded", exported: "匯出於",
      how: "如何閱讀這張地圖", mapTitle: "這是一張思想地圖，不是資料庫傾倒", sources: "來源", sourcesDesc: "長對話、報告與專案筆記。", nodes: "想法", nodesDesc: "從來源中萃取出的耐久想法。", edges: "關係", edgesDesc: "想法如何支持、延伸、對比或連結。", themes: "主題", themesDesc: "進入常見議題的公開入口。", trails: "路徑", trailsDesc: "穿過相連想法的敘事路線。",
      readingPath: "公開閱讀路線", readingTitle: "先選主題，再沿路徑走，最後查看證據", readingBody: "第一次來可以先看 Featured Trails。每一步都能打開局部關係圖與來源證據。", previewGraph: "預覽關係圖",
      featuredTrails: "Featured 思想路徑", curated: "策展", featuredEmpty: "Featured trails 正在整理中。", suggestedTrails: "Suggested 思想路徑", auto: "自動生成", suggestedEmpty: "目前沒有 suggested trails。",
      latestSources: "最新來源", viewAll: "查看全部", topTags: "熱門主題 / 標籤", filterNodes: "篩選想法", recentNodes: "最近更新的想法", quickLinks: "快速入口", browseSources: "瀏覽來源", searchNodes: "搜尋想法", readReports: "閱讀報告", sourcesMini: "來源", nodeKinds: "想法類型", topTagsMini: "熱門標籤", featured: "featured", evidence: "證據"
    },
    theme: { entry: "主題入口", intro: "主題是進入這張思想地圖的公開入口：先從一個議題開始，再追想法、來源證據、報告與局部關係。", browse: "瀏覽主題", tags: "標籤", nodesByKind: "依類型分組的相關想法", noNodes: "這個標籤目前沒有相關想法。", relatedSources: "相關來源", noSources: "沒有相關來源。", relatedReports: "相關報告", noReports: "沒有相關報告。", relatedEdges: "相關關係", noEdges: "這個主題目前沒有相關關係。", openGraph: "開啟關係圖 / inspector", digestItems: "digest items", ops: "ops" },
    graph: { selectNode: "選一個想法來看局部關係圖。", tip: "提示：點左右兩側的相鄰想法，可以沿著 thought trail 探索；按 Back 可回上一個焦點。", back: "← 返回", incoming: "進來的關係", outgoing: "出去的關係", selected: "目前想法", noneIncoming: "沒有 incoming neighbors。", noneOutgoing: "沒有 outgoing neighbors。", expand: "展開", collapse: "收合", hover: "把滑鼠移到 edge / neighbor 上，可查看 relation rationale。", rationale: "關係說明" },
    common: { kind: "類型", confidence: "信心", sources: "來源", nodes: "想法", edges: "關係", report: "報告", yes: "是", no: "否", updated: "更新", noSelectedNode: "尚未選擇想法。" },
    nodesPanel: { search: "搜尋想法標題、內文、標籤…", allKinds: "全部類型", allTags: "全部標籤", allSources: "全部來源", matching: "筆符合的想法", none: "沒有符合目前搜尋與篩選的想法。" },
    sourceDetail: { generatedNodes: "生成的想法", relatedEdges: "相關關係", openReport: "開啟報告", noSource: "沒有選擇來源，或沒有符合搜尋的來源。", noDigest: "這個來源沒有匯出的 digest。", digest: "Digest", digestItems: "digest items" },
    inspector: { title: "想法 Inspector", relatedSources: "相關來源", outgoing: "出去的關係", incoming: "進來的關係", sourceRefs: "來源引用", noOutgoing: "沒有 outgoing edges。", noIncoming: "沒有 incoming edges。", noRefs: "這個想法沒有匯出的 source refs。" },
    reports: { title: "Ingest report", noReport: "沒有報告", openSource: "開啟來源細節", none: "沒有選擇報告。" }
  },
  en: {
    tabs: { overview: "Overview", themes: "Themes", sources: "Sources", nodes: "Nodes", reports: "Reports", graph: "Graph" },
    topEyebrow: "Public AI-assisted thought portfolio", topSubtitle: "A public map of ideas I’m developing through long conversations with AI — organized into themes, trails, connected thoughts, and source evidence.", publicNote: "Public portfolio · open to browse · generated from conversations, reports, and project notes · read-only for visitors.", themeMode: { dark: "Dark", light: "Light" }, metrics: { sources: "sources", nodes: "nodes", edges: "edges", reports: "reports" },
    sourcesPanel: { eyebrow: "Sources", title: "Seed corpus", search: "Search sources by title or id…", allTitle: "All sources", allDesc: "Show complete graph mirror", none: "No sources match this search." },
    auth: { owner: "Owner mode", signedIn: "Visitor signed in", publicVisitor: "Public visitor", noLogin: "No login needed to read", login: "Login with Google", logout: "Logout" },
    status: { ready: "Live Firestore", loading: "Loading Firestore…", mock: "Mock fallback", error: "Firestore error", live: "getDoc / getDocs · read-only", preview: "local preview data" },
    overview: { start: "Start here", heroTitle: "Ideas, trails, and evidence", heroBody: "Thought Atlas turns long-form conversations, reports, and project notes into a public portfolio of themes, connected ideas, narrative trails, and source-backed evidence.", explore: "Explore the atlas", liveCorpus: "live corpus loaded", corpus: "corpus loaded", exported: "exported", how: "How to read this atlas", mapTitle: "A map of thinking, not a database dump", sources: "Sources", sourcesDesc: "Long conversations, reports, and project notes.", nodes: "Nodes", nodesDesc: "Durable ideas extracted from those sources.", edges: "Edges", edgesDesc: "How ideas support, extend, contrast, or connect.", themes: "Themes", themesDesc: "Public entry points into recurring topics.", trails: "Trails", trailsDesc: "Narrative paths through connected thoughts.", readingPath: "Public reading path", readingTitle: "Start with a theme, follow a trail, inspect the evidence", readingBody: "If you are new here, try a featured trail first. Each step can open the local graph and source-backed inspector.", previewGraph: "Preview graph", featuredTrails: "Featured Thought Trails", curated: "curated", featuredEmpty: "Featured trails are being curated.", suggestedTrails: "Suggested Thought Trails", auto: "auto-generated", suggestedEmpty: "No suggested trails yet.", latestSources: "Latest sources", viewAll: "View all", topTags: "Top tags / themes", filterNodes: "Filter nodes", recentNodes: "Recently active nodes", quickLinks: "Quick links", browseSources: "Browse source details", searchNodes: "Search nodes", readReports: "Read reports", sourcesMini: "Sources", nodeKinds: "Node kinds", topTagsMini: "Top tags", featured: "featured", evidence: "evidence" },
    theme: { entry: "Theme entry point", intro: "Themes are public-facing doors into the atlas: start with a topic, then follow nodes, source evidence, reports, and local graph relationships.", browse: "Browse themes", tags: "tags", nodesByKind: "Related nodes by kind", noNodes: "No nodes have this tag yet.", relatedSources: "Related sources", noSources: "No related sources.", relatedReports: "Related reports", noReports: "No related reports.", relatedEdges: "Related edges", noEdges: "No edges touch this theme yet.", openGraph: "open in graph / inspector", digestItems: "digest items", ops: "ops" },
    graph: { selectNode: "Select a node to see its local neighborhood.", tip: "Tip: click a left or right neighbor to follow the thought trail; use Back to return to the previous focus.", back: "← Back", incoming: "Incoming", outgoing: "Outgoing", selected: "Selected node", noneIncoming: "No incoming neighbors.", noneOutgoing: "No outgoing neighbors.", expand: "Expand", collapse: "Collapse", hover: "Hover or focus an edge / neighbor to inspect its relation rationale.", rationale: "Edge rationale" },
    common: { kind: "Kind", confidence: "Confidence", sources: "Sources", nodes: "Nodes", edges: "Edges", report: "Report", yes: "yes", no: "no", updated: "updated", noSelectedNode: "No node selected." },
    nodesPanel: { search: "Search nodes by title, body, tags…", allKinds: "All kinds", allTags: "All tags", allSources: "All sources", matching: "matching nodes", none: "No nodes match the current search and filters." },
    sourceDetail: { generatedNodes: "Generated nodes", relatedEdges: "Related edges", openReport: "Open report", noSource: "No source selected or no source matches the current search.", noDigest: "No digest exported for this source.", digest: "Digest", digestItems: "digest items" },
    inspector: { title: "Node inspector", relatedSources: "Related sources", outgoing: "Outgoing edges", incoming: "Incoming edges", sourceRefs: "Source refs", noOutgoing: "No outgoing edges.", noIncoming: "No incoming edges.", noRefs: "No source refs exported for this node." },
    reports: { title: "Ingest report", noReport: "No report", openSource: "Open source detail", none: "No report selected." }
  }
};

type Copy = typeof copy.en;
const I18nContext = createContext<Copy>(copy.zh);
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) { return <I18nContext.Provider value={copy[locale]}>{children}</I18nContext.Provider>; }
export function useUiText() { return useContext(I18nContext); }
export function getUiText(locale: Locale) { return copy[locale]; }
