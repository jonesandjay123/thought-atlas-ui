import type { ThoughtAtlasViewModel } from "../viewModels/thoughtAtlasViewModel";
import { getThemeDetail, getTopThemes } from "../selectors/atlasSelectors";

export function ThemeDetailPanel({
  atlas,
  selectedTheme,
  onSelectTheme,
  onSelectNode,
  onSelectSource,
  onOpenReport,
}: {
  atlas: ThoughtAtlasViewModel;
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
  onSelectNode: (nodeId: string) => void;
  onSelectSource: (sourceId: string) => void;
  onOpenReport: (sourceId: string) => void;
}) {
  const { theme, relatedNodes, relatedSources, relatedEdges, relatedReports, nodesByKind } = getThemeDetail(atlas, selectedTheme);
  const themeCounts = getTopThemes(atlas, 24);

  return (
    <div className="theme-detail stack">
      <section className="overview-card theme-hero-card">
        <p className="eyebrow">Theme entry point</p>
        <h2>{theme}</h2>
        <p className="summary">Themes are public-facing doors into the atlas: start with a topic, then follow nodes, source evidence, reports, and local graph relationships.</p>
        <dl className="property-grid theme-metrics">
          <div><dt>Nodes</dt><dd>{relatedNodes.length}</dd></div>
          <div><dt>Sources</dt><dd>{relatedSources.length}</dd></div>
          <div><dt>Edges</dt><dd>{relatedEdges.length}</dd></div>
          <div><dt>Reports</dt><dd>{relatedReports.length}</dd></div>
        </dl>
      </section>

      <section className="overview-card theme-picker-card">
        <div className="section-title-row"><h3>Browse themes</h3><small>{atlas.tags.length} tags</small></div>
        <div className="theme-cloud clickable">
          {themeCounts.map((summary) => <button key={summary.tag} className={summary.tag === theme ? "active" : ""} onClick={() => onSelectTheme(summary.tag)}>{summary.tag}<em>{summary.count}</em></button>)}
        </div>
      </section>

      <section className="theme-grid-layout">
        <article className="overview-card theme-wide-card">
          <div className="section-title-row"><h3>Related nodes by kind</h3><small>{relatedNodes.length}</small></div>
          <div className="kind-group-stack">
            {nodesByKind.map((group) => (
              <section key={group.kind} className="kind-group">
                <h4>{group.kind}</h4>
                <div className="compact-list">
                  {group.nodes.map((node) => (
                    <button key={node.id} onClick={() => onSelectNode(node.id)}>
                      <strong>{node.title}</strong>
                      <span>{Math.round(node.confidence * 100)}% · open in graph / inspector</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
            {nodesByKind.length === 0 ? <p className="empty-state">No nodes have this tag yet.</p> : null}
          </div>
        </article>

        <aside className="theme-side-stack">
          <article className="overview-card">
            <div className="section-title-row"><h3>Related sources</h3><small>{relatedSources.length}</small></div>
            <div className="compact-list">
              {relatedSources.map((source) => <button key={source.source_id} onClick={() => onSelectSource(source.source_id)}><strong>{source.title}</strong><span>{source.source_id}</span></button>)}
              {relatedSources.length === 0 ? <p className="empty-state">No related sources.</p> : null}
            </div>
          </article>
          <article className="overview-card">
            <div className="section-title-row"><h3>Related reports</h3><small>{relatedReports.length}</small></div>
            <div className="compact-list">
              {relatedReports.map((report) => <button key={report.source_id} onClick={() => onOpenReport(report.source_id)}><strong>{atlas.sourceById.get(report.source_id)?.title ?? report.source_id}</strong><span>{report.digest_items} digest items · {report.patch_operations} ops</span></button>)}
              {relatedReports.length === 0 ? <p className="empty-state">No related reports.</p> : null}
            </div>
          </article>
        </aside>
      </section>

      <section className="overview-card">
        <div className="section-title-row"><h3>Related edges</h3><small>{relatedEdges.length}</small></div>
        <div className="theme-edge-list">
          {relatedEdges.map((edge) => (
            <button key={edge.id} onClick={() => onSelectNode(edge.from)}>
              <span>{edge.relation}</span>
              <strong>{atlas.nodeById.get(edge.from)?.title ?? edge.from}</strong>
              <em>→</em>
              <strong>{atlas.nodeById.get(edge.to)?.title ?? edge.to}</strong>
              <small>{edge.rationale}</small>
            </button>
          ))}
          {relatedEdges.length === 0 ? <p className="empty-state">No edges touch this theme yet.</p> : null}
        </div>
      </section>
      <small className="quiet-version-mark">v1.4-public-polish · featured-trails</small>
    </div>
  );
}
