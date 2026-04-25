import type { ThoughtAtlasViewModel } from "../viewModels/thoughtAtlasViewModel";
import { formatDate } from "../utils/format";
import { getFeaturedThoughtTrails, getSuggestedThoughtTrails, getTopThemes, type SuggestedTrail } from "../selectors/atlasSelectors";

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
  const latestSources = [...atlas.sources].sort((a, b) => String(b.updated_at ?? b.last_seen_at ?? "").localeCompare(String(a.updated_at ?? a.last_seen_at ?? ""))).slice(0, 3);
  const topThemes = getTopThemes(atlas, 14);
  const featuredThemes = topThemes.slice(0, 6);
  const recentNodes = [...atlas.nodes].sort((a, b) => String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? ""))).slice(0, 6);
  const featuredTrails = getFeaturedThoughtTrails(atlas);
  const suggestedTrails = getSuggestedThoughtTrails(atlas, 5);

  return (
    <div className="stack">
      <section className="overview-card hero-card">
        <p className="eyebrow">Start here</p>
        <h2>Ideas, trails, and evidence</h2>
        <p className="summary">
          Thought Atlas turns long-form conversations, reports, and project notes into a public portfolio of themes, connected ideas, narrative trails, and source-backed evidence.
        </p>
        <button className="primary-action" onClick={onOpenNodes}>Explore the atlas</button>
        <p className="technical-status">
          {atlas.meta.project_id || "thought-atlas"} · {expectedCounts ? "live corpus loaded" : "corpus loaded"} · exported {formatDate(atlas.meta.exported_at)}
        </p>
      </section>
      <section className="showcase-intro-grid">
        <article className="overview-card what-is-card">
          <p className="eyebrow">How to read this atlas</p>
          <h2>A map of thinking, not a database dump</h2>
          <div className="read-guide-grid">
            <div><strong>Sources</strong><span>Long conversations, reports, and project notes.</span></div>
            <div><strong>Nodes</strong><span>Durable ideas extracted from those sources.</span></div>
            <div><strong>Edges</strong><span>How ideas support, extend, contrast, or connect.</span></div>
            <div><strong>Themes</strong><span>Public entry points into recurring topics.</span></div>
            <div><strong>Trails</strong><span>Narrative paths through connected thoughts.</span></div>
          </div>
        </article>
        <article className="overview-card trails-card">
          <p className="eyebrow">Public reading path</p>
          <h2>Start with a theme, follow a trail, inspect the evidence</h2>
          <p className="summary">
            If you are new here, try a featured trail first. Each step can open the local graph and source-backed inspector.
          </p>
          <button className="secondary-action" onClick={onOpenGraph}>Preview graph</button>
        </article>
      </section>
      <section className="featured-theme-grid">
        {featuredThemes.map((theme) => (
          <button className="overview-card featured-theme-card theme-entry-card" key={theme.tag} onClick={() => onOpenTheme(theme.tag)}>
            <div className="section-title-row"><h3>{theme.tag}</h3><small>{theme.count} nodes</small></div>
            <div className="compact-list">
              {theme.nodes.map((node) => <div className="edge-chip" key={node.id}><strong>{node.title}</strong><span>{node.kind} · {Math.round(node.confidence * 100)}%</span></div>)}
            </div>
          </button>
        ))}
      </section>
      <section className="overview-card suggested-trails-card featured-trails-card">
        <div className="section-title-row"><h3>Featured Thought Trails</h3><small>{featuredTrails.length} curated</small></div>
        <div className="trail-card-grid">
          {featuredTrails.map((trail) => <SuggestedTrailCard key={trail.id} trail={trail} onSelectNode={onSelectTrailNode} />)}
          {featuredTrails.length === 0 ? <p className="empty-state">Featured trails are being curated.</p> : null}
        </div>
      </section>
      <section className="overview-card suggested-trails-card">
        <div className="section-title-row"><h3>Suggested Thought Trails</h3><small>{suggestedTrails.length} auto-generated</small></div>
        <div className="trail-card-grid">
          {suggestedTrails.map((trail) => <SuggestedTrailCard key={trail.id} trail={trail} onSelectNode={onSelectTrailNode} />)}
          {suggestedTrails.length === 0 ? <p className="empty-state">No suggested trails yet.</p> : null}
        </div>
      </section>
      <section className="dashboard-grid">
        <article className="overview-card dashboard-card">
          <div className="section-title-row"><h3>Latest sources</h3><button onClick={onOpenSources}>View all</button></div>
          <div className="compact-list">
            {latestSources.map((source) => <div className="edge-chip" key={source.source_id}><strong>{source.title}</strong><span>{formatDate(source.updated_at ?? source.last_seen_at)}</span></div>)}
          </div>
        </article>
        <article className="overview-card dashboard-card">
          <div className="section-title-row"><h3>Top tags / themes</h3><button onClick={onOpenNodes}>Filter nodes</button></div>
          <div className="theme-cloud">
            {topThemes.map((theme) => <button key={theme.tag} onClick={() => onOpenTheme(theme.tag)}>{theme.tag}<em>{theme.count}</em></button>)}
          </div>
        </article>
        <article className="overview-card dashboard-card">
          <div className="section-title-row"><h3>Recently active nodes</h3><button onClick={onOpenNodes}>Explore</button></div>
          <div className="compact-list">
            {recentNodes.map((node) => <div className="edge-chip" key={node.id}><strong>{node.title}</strong><span>{node.kind} · {Math.round(node.confidence * 100)}%</span></div>)}
          </div>
        </article>
        <article className="overview-card dashboard-card quick-links">
          <h3>Quick links</h3>
          <button onClick={onOpenSources}>Browse source details</button>
          <button onClick={onOpenNodes}>Search nodes</button>
          <button onClick={onOpenReports}>Read reports</button>
          <button onClick={onOpenGraph}>Preview graph</button>
        </article>
      </section>
      <section className="overview-grid">
        <MiniCollection title="Sources" items={atlas.sources.map((source) => source.title)} />
        <MiniCollection title="Node kinds" items={atlas.kinds} />
        <MiniCollection title="Top tags" items={atlas.tags.slice(0, 18)} />
      </section>
    </div>
  );
}


function SuggestedTrailCard({ trail, onSelectNode }: { trail: SuggestedTrail; onSelectNode: (nodeId: string) => void }) {
  return (
    <article className="trail-card">
      <div className="section-title-row"><h4>{trail.title}</h4><small>{trail.curated ? "featured" : `${trail.sourceCount} sources · ${trail.evidenceCount} evidence`}</small></div>
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
