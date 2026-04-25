import type { ThoughtReportDoc } from "../firestoreTypes";
import type { ThoughtAtlasViewModel } from "../viewModels/thoughtAtlasViewModel";

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
  return (
    <div className="reports-layout">
      <div className="report-list">
        {atlas.reports.map((report) => (
          <button key={report.source_id} className={selectedReportId === report.source_id ? "source-card active" : "source-card"} onClick={() => onSelectReport(report.source_id)}>
            <strong>{atlas.sourceById.get(report.source_id)?.title ?? report.source_id}</strong>
            <span>{report.digest_items} digest items · {report.patch_operations} ops</span>
          </button>
        ))}
      </div>
      <article className="report-view">
        <p className="eyebrow">Ingest report</p>
        <h2>{selectedReport ? atlas.sourceById.get(selectedReport.source_id)?.title ?? selectedReport.source_id : "No report"}</h2>
        {selectedReport ? <button className="secondary-action" onClick={() => onSelectSource(selectedReport.source_id)}>Open source detail</button> : null}
        <pre>{selectedReport?.markdown ?? "No report selected."}</pre>
      </article>
    </div>
  );
}
