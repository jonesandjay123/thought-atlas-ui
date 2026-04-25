import type { ThoughtSourceDoc } from "../firestoreTypes";
import { useUiText } from "../i18n";

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
  const ui = useUiText();
  return (
    <div className="source-list">
      <input className="source-search" value={sourceQuery} onChange={(event) => onSearch(event.target.value)} placeholder={ui.sourcesPanel.search} />
      <button className={selectedSourceId === "all" ? "source-card active" : "source-card"} onClick={() => onSelectSource("all")}>
        <strong>{ui.sourcesPanel.allTitle}</strong>
        <span>{ui.sourcesPanel.allDesc}</span>
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
      {sources.length === 0 ? <p className="empty-state">{ui.sourcesPanel.none}</p> : null}
    </div>
  );
}
