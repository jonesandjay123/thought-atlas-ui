import type { ThoughtReportDoc } from "../firestoreTypes";
import type { ThoughtAtlasViewModel } from "../viewModels/thoughtAtlasViewModel";
import { useUiText } from "../i18n";

export function ReportsPanel({
  atlas,
  selectedReport,
  selectedReportId,
  onSelectReport,
  onSelectSource,
}: {
  atlas: ThoughtAtlasViewModel;
  selectedReport?: ThoughtReportDoc;
  selectedReportId: string | null;
  onSelectReport: (sourceId: string) => void;
  onSelectSource: (sourceId: string) => void;
}) {
  const ui = useUiText();
  return (
    <div className="reports-layout">
      <div className="report-list">
        {atlas.reports.map((report) => (
          <button key={report.source_id} className={selectedReportId === report.source_id ? "source-card active" : "source-card"} onClick={() => onSelectReport(report.source_id)}>
            <strong>{atlas.sourceById.get(report.source_id)?.title ?? report.source_id}</strong>
            <span>{report.digest_items} {ui.theme.digestItems} · {report.patch_operations} {ui.theme.ops}</span>
          </button>
        ))}
      </div>
      <article className="report-view">
        <p className="eyebrow">{ui.reports.title}</p>
        <h2>{selectedReport ? atlas.sourceById.get(selectedReport.source_id)?.title ?? selectedReport.source_id : ui.reports.noReport}</h2>
        {selectedReport ? <button className="secondary-action" onClick={() => onSelectSource(selectedReport.source_id)}>{ui.reports.openSource}</button> : null}
        <pre>{selectedReport?.markdown ?? ui.reports.none}</pre>
      </article>
    </div>
  );
}
