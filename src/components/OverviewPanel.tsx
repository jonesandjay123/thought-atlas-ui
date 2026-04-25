import type { ThoughtAtlasViewModel } from "../viewModels/thoughtAtlasViewModel";
import { formatDate } from "../utils/format";
import { getFeaturedThoughtTrails, getSuggestedThoughtTrails, getTopThemes, type SuggestedTrail } from "../selectors/atlasSelectors";
import { useUiText } from "../i18n";

export function OverviewPanel({
  atlas,
  expectedCounts,
  onOpenNodes,
  onOpenSources,
  onOpenReports,
  onOpenGraph,
  onOpenTheme,
  onSelectTrailNode,
}: {
  atlas: ThoughtAtlasViewModel;
  expectedCounts: boolean;
  onOpenNodes: () => void;
  onOpenSources: () => void;
  onOpenReports: () => void;
  onOpenGraph: () => void;
  onOpenTheme: (theme: string) => void;
  onSelectTrailNode: (nodeId: string) => void;
}) {
  const ui = useUiText();
  const latestSources = [...atlas.sources].sort((a, b) => String(b.updated_at ?? b.last_seen_at ?? "").localeCompare(String(a.updated_at ?? a.last_seen_at ?? ""))).slice(0, 3);
  const topThemes = getTopThemes(atlas, 14);
  const featuredThemes = topThemes.slice(0, 6);
  const recentNodes = [...atlas.nodes].sort((a, b) => String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? ""))).slice(0, 6);
  const featuredTrails = getFeaturedThoughtTrails(atlas);
  const suggestedTrails = getSuggestedThoughtTrails(atlas, 5);

  return (
    <div className="stack">
      <section className="overview-card hero-card">
        <p className="eyebrow">{ui.overview.start}</p>
        <h2>{ui.overview.heroTitle}</h2>
        <p className="summary">
          {ui.overview.heroBody}
        </p>
        <button className="primary-action" onClick={onOpenNodes}>{ui.overview.explore}</button>
        <p className="technical-status">
          {atlas.meta.project_id || "thought-atlas"} · {expectedCounts ? ui.overview.liveCorpus : ui.overview.corpus} · {ui.overview.exported} {formatDate(atlas.meta.exported_at)}
        </p>
      </section>
      <section className="showcase-intro-grid">
        <article className="overview-card what-is-card">
          <p className="eyebrow">{ui.overview.how}</p>
          <h2>{ui.overview.mapTitle}</h2>
          <div className="read-guide-grid">
            <div><strong>{ui.overview.sources}</strong><span>{ui.overview.sourcesDesc}</span></div>
            <div><strong>{ui.overview.nodes}</strong><span>{ui.overview.nodesDesc}</span></div>
            <div><strong>{ui.overview.edges}</strong><span>{ui.overview.edgesDesc}</span></div>
            <div><strong>{ui.overview.themes}</strong><span>{ui.overview.themesDesc}</span></div>
            <div><strong>{ui.overview.trails}</strong><span>{ui.overview.trailsDesc}</span></div>
          </div>
        </article>
        <article className="overview-card trails-card">
          <p className="eyebrow">{ui.overview.readingPath}</p>
          <h2>{ui.overview.readingTitle}</h2>
          <p className="summary">
            {ui.overview.readingBody}
          </p>
          <button className="secondary-action" onClick={onOpenGraph}>{ui.overview.previewGraph}</button>
        </article>
      </section>
      <section className="featured-theme-grid">
        {featuredThemes.map((theme) => (
          <button className="overview-card featured-theme-card theme-entry-card" key={theme.tag} onClick={() => onOpenTheme(theme.tag)}>
            <div className="section-title-row"><h3>{theme.tag}</h3><small>{theme.count} {ui.overview.nodes.toLowerCase()}</small></div>
            <div className="compact-list">
              {theme.nodes.map((node) => <div className="edge-chip" key={node.id}><strong>{node.title}</strong><span>{node.kind} · {Math.round(node.confidence * 100)}%</span></div>)}
            </div>
          </button>
        ))}
      </section>
      <section className="overview-card suggested-trails-card featured-trails-card">
        <div className="section-title-row"><h3>{ui.overview.featuredTrails}</h3><small>{featuredTrails.length} {ui.overview.curated}</small></div>
        <div className="trail-card-grid">
          {featuredTrails.map((trail) => <SuggestedTrailCard key={trail.id} trail={trail} onSelectNode={onSelectTrailNode} />)}
          {featuredTrails.length === 0 ? <p className="empty-state">{ui.overview.featuredEmpty}</p> : null}
        </div>
      </section>
      <section className="overview-card suggested-trails-card">
        <div className="section-title-row"><h3>{ui.overview.suggestedTrails}</h3><small>{suggestedTrails.length} {ui.overview.auto}</small></div>
        <div className="trail-card-grid">
          {suggestedTrails.map((trail) => <SuggestedTrailCard key={trail.id} trail={trail} onSelectNode={onSelectTrailNode} />)}
          {suggestedTrails.length === 0 ? <p className="empty-state">{ui.overview.suggestedEmpty}</p> : null}
        </div>
      </section>
      <section className="dashboard-grid">
        <article className="overview-card dashboard-card">
          <div className="section-title-row"><h3>{ui.overview.latestSources}</h3><button onClick={onOpenSources}>{ui.overview.viewAll}</button></div>
          <div className="compact-list">
            {latestSources.map((source) => <div className="edge-chip" key={source.source_id}><strong>{source.title}</strong><span>{formatDate(source.updated_at ?? source.last_seen_at)}</span></div>)}
          </div>
        </article>
        <article className="overview-card dashboard-card">
          <div className="section-title-row"><h3>{ui.overview.topTags}</h3><button onClick={onOpenNodes}>{ui.overview.filterNodes}</button></div>
          <div className="theme-cloud">
            {topThemes.map((theme) => <button key={theme.tag} onClick={() => onOpenTheme(theme.tag)}>{theme.tag}<em>{theme.count}</em></button>)}
          </div>
        </article>
        <article className="overview-card dashboard-card">
          <div className="section-title-row"><h3>{ui.overview.recentNodes}</h3><button onClick={onOpenNodes}>{ui.overview.explore}</button></div>
          <div className="compact-list">
            {recentNodes.map((node) => <div className="edge-chip" key={node.id}><strong>{node.title}</strong><span>{node.kind} · {Math.round(node.confidence * 100)}%</span></div>)}
          </div>
        </article>
        <article className="overview-card dashboard-card quick-links">
          <h3>{ui.overview.quickLinks}</h3>
          <button onClick={onOpenSources}>{ui.overview.browseSources}</button>
          <button onClick={onOpenNodes}>{ui.overview.searchNodes}</button>
          <button onClick={onOpenReports}>{ui.overview.readReports}</button>
          <button onClick={onOpenGraph}>{ui.overview.previewGraph}</button>
        </article>
      </section>
      <section className="overview-grid">
        <MiniCollection title={ui.overview.sourcesMini} items={atlas.sources.map((source) => source.title)} />
        <MiniCollection title={ui.overview.nodeKinds} items={atlas.kinds} />
        <MiniCollection title={ui.overview.topTagsMini} items={atlas.tags.slice(0, 18)} />
      </section>
    </div>
  );
}


function SuggestedTrailCard({ trail, onSelectNode }: { trail: SuggestedTrail; onSelectNode: (nodeId: string) => void }) {
  const ui = useUiText();
  return (
    <article className="trail-card">
      <div className="section-title-row"><h4>{trail.title}</h4><small>{trail.curated ? ui.overview.featured : `${trail.sourceCount} ${ui.overview.sources.toLowerCase()} · ${trail.evidenceCount} ${ui.overview.evidence}`}</small></div>
      {trail.description ? <p className="summary">{trail.description}</p> : null}
      <ol>
        {trail.nodes.map((node, index) => (
          <li key={node.id}>
            {index > 0 ? <span className="relation-badge">{trail.edges[index - 1]?.relation ?? "relates"}</span> : null}
            <button onClick={() => onSelectNode(node.id)}>{node.title}</button>
          </li>
        ))}
      </ol>
    </article>
  );
}

function MiniCollection({ title, items }: { title: string; items: string[] }) {
  return <article className="overview-card"><h3>{title}</h3><div className="mini-node-list">{items.map((item) => <span key={item}>{item}</span>)}</div></article>;
}
