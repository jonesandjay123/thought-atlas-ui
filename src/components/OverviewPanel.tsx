import type { ThoughtAtlasViewModel } from "../viewModels/thoughtAtlasViewModel";
import { formatDate } from "../utils/format";
import { getSuggestedThoughtTrails, getTopThemes, type SuggestedTrail } from "../selectors/atlasSelectors";

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
  const suggestedTrails = getSuggestedThoughtTrails(atlas, 5);

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
        <button className="primary-action" onClick={onOpenNodes}>Explore the atlas</button>
      </section>
      <section className="showcase-intro-grid">
        <article className="overview-card what-is-card">
          <p className="eyebrow">What is this?</p>
          <h2>An AI-assisted thinking portfolio</h2>
          <p className="summary">
            Thought Atlas turns conversations, notes, checklists, and reflections into a browsable public map: sources become digests, digests become nodes, and nodes connect through explicit relationships.
          </p>
          <div className="principle-list">
            <span>Not a notes app</span>
            <span>Not a private admin console</span>
            <span>A public showcase of evolving thought</span>
          </div>
        </article>
        <article className="overview-card trails-card">
          <p className="eyebrow">Thought Trails</p>
          <h2>Narrative paths are coming next</h2>
          <p className="summary">
            Suggested trails now turn graph relations into short narrative paths visitors can follow through the atlas.
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
      <div className="section-title-row"><h4>{trail.title}</h4><small>{trail.sourceCount} sources · {trail.evidenceCount} evidence</small></div>
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
