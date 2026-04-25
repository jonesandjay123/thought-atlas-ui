# Thought Atlas 資料模型

這份文件描述 Thought Atlas 後續應穩定下來的資料模型。UI shell 目前把展示資料放在 `src/data/mockThoughtAtlas.ts`；正式 graph schema、import/export pipeline 和 durable storage 應由 `jonesandjay123/thought-atlas` core repo 定義。

## ThoughtNode

一個 node 代表 durable thought。它可以是 claim、question、decision、pattern、project insight 或 research finding。

建議欄位：

- `id`：穩定 slug
- `title`：短標題
- `summary`：一段可讀摘要
- `kind`：claim / question / decision / pattern / reference
- `cluster`：所屬 cluster id
- `sourceRefs`：來源 anchor 清單
- `confidence`：0 到 1
- `freshness`：new / active / settled / stale
- `tags`：可搜尋 tags
- `createdAt` / `updatedAt`

## ThoughtEdge

一條 edge 代表兩個 node 的語意關係。

建議 relation：

- `supports`：A 支撐 B
- `contrasts`：A 和 B 有張力或相反觀點
- `extends`：A 延伸 B
- `depends-on`：A 依賴 B
- `duplicates`：A 可能是 B 的重複版本
- `blocks`：A 阻擋 B 的推進

Edge 應該有 `weight` 和可選 `rationale`，避免只留下看不懂的線。

## IdeaInboxItem

Inbox item 是尚未升級成 durable node 的素材。它可以由 importer、Jarvis、或人工新增。

建議欄位：

- `id`
- `title`
- `source`
- `capturedAt`
- `excerpt`
- `suggestedTags`
- `suggestedNodeKind`
- `status`：queued / triaged / promoted / ignored
- `promotionCandidateIds`

## ClusterReport

Cluster report 是一群 nodes 的 living synthesis，不是靜態 summary。

建議欄位：

- `id`
- `name`
- `thesis`
- `nodeIds`
- `openQuestions`
- `nextMoves`
- `reportPath`
- `lastGeneratedAt`
- `humanEditedAt`

## SourceRef

Provenance 應該獨立成可重用結構。

```ts
type SourceRef = {
  sourceId: string;
  path: string;
  quote?: string;
  startLine?: number;
  endLine?: number;
  chunkId?: string;
};
```

長期來看，Thought Atlas 的可信度來自 source traceability。沒有來源的 node 可以存在，但應該被標記為低信心或 personal hypothesis。
