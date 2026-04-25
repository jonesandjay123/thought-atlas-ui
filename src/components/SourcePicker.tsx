import type { ThoughtSourceDoc } from "../firestoreTypes";

export function SourcePicker({
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
