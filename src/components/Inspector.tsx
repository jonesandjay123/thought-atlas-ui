import type { FirestoreSourceRef, ThoughtEdgeDoc, ThoughtNodeDoc, ThoughtSourceDoc } from "../firestoreTypes";
import type { ThoughtAtlasViewModel } from "../viewModels/thoughtAtlasViewModel";
import { useUiText } from "../i18n";

export function Inspector({
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
  const ui = useUiText();
  const incomingEdges = relatedEdges.filter((edge) => edge.to === node.id);
  const outgoingEdges = relatedEdges.filter((edge) => edge.from === node.id);
  const sourceTitles = node.source_ids.map((sourceId) => atlas.sourceById.get(sourceId)).filter(Boolean) as ThoughtSourceDoc[];

  return (
    <section className="detail-card inspector-card">
      <div className="panel-heading"><p className="eyebrow">{ui.inspector.title}</p><h2>{node.title}</h2></div>
      <p className="summary">{node.body}</p>
      <dl className="property-grid">
        <div><dt>{ui.common.kind}</dt><dd>{node.kind}</dd></div>
        <div><dt>{ui.common.confidence}</dt><dd>{Math.round(node.confidence * 100)}%</dd></div>
        <div><dt>{ui.common.sources}</dt><dd>{node.source_ids.length}</dd></div>
      </dl>
      <div className="tag-row">{node.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      <div className="relations"><h3>{ui.inspector.relatedSources}</h3>{sourceTitles.map((source) => <button className="source-ref-button" key={source.source_id} onClick={() => onSelectSource(source.source_id)}>{source.title}<span>{source.source_id}</span></button>)}</div>
      <div className="relations"><h3>{ui.inspector.outgoing}</h3>{outgoingEdges.length ? outgoingEdges.map((edge) => <RelationRow key={edge.id} edge={edge} currentNodeId={node.id} atlas={atlas} direction="outgoing" />) : <p className="empty-state">{ui.inspector.noOutgoing}</p>}</div>
      <div className="relations"><h3>{ui.inspector.incoming}</h3>{incomingEdges.length ? incomingEdges.map((edge) => <RelationRow key={edge.id} edge={edge} currentNodeId={node.id} atlas={atlas} direction="incoming" />) : <p className="empty-state">{ui.inspector.noIncoming}</p>}</div>
      <div className="relations"><h3>{ui.inspector.sourceRefs}</h3>{node.source_refs.length ? node.source_refs.map((ref, index) => <SourceRefView refData={ref} atlas={atlas} key={index} />) : <p className="summary">{ui.inspector.noRefs}</p>}</div>
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
