import type { ThoughtDigestDoc, ThoughtSourceDoc } from "../firestoreTypes";
import type { ThoughtAtlasViewModel } from "../viewModels/thoughtAtlasViewModel";
import { formatDate } from "../utils/format";
import { getSourceBundle } from "../selectors/atlasSelectors";

export function SourcesPanel({
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
        const { nodes: sourceNodes, edges: sourceEdges, report } = getSourceBundle(atlas, source.source_id);
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
