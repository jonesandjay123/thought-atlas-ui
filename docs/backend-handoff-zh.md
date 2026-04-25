# Thought Atlas UI：後端交接說明

最後更新：2026-04-25

這份文件是給下一個專注前端開發的 session / agent 的後端知識交接。目標是讓前端開發者不需要重新翻整個 `thought-atlas` backend repo，就能理解 Firestore 上有什麼資料、應該怎麼讀、什麼事情不該在 UI 做。

## 一句話現況

`thought-atlas` 後端 v0 已可先停：local ingest pipeline、graph state、Firestore writer 都已完成，並已把完整 seed dataset sync 到 Firebase project `thought-atlas`。

`thought-atlas-ui` 下一步就是：

```text
做一個 read-only Firestore viewer，把 Thought Atlas 的 sources / nodes / edges / reports 呈現出來。
```

## Repo 分工

```text
~/Downloads/code/thought-atlas
= local-first backend core
= source ingest / digest / graph patch / local graph / report / Firestore sync

~/Downloads/code/thought-atlas-ui
= hosted frontend shell
= read-only Firestore viewer / graph explorer / report browser

~/Downloads/code/jarvis-firebase-ops/projects/thought-atlas
= Firebase ops 對口與 cross-project handoff pointer
```

重要邊界：

- 不要把 backend ingest / extraction / graph patch logic 搬進 UI。
- UI 不應該直接判斷哪些 source 要進 graph。
- UI 第一階段不要寫 Firestore。
- Firestore 目前是 backend local files 的 downstream mirror，不是 source of truth。

## Firebase 專案

```text
Firebase project ID: thought-atlas
Firestore mode: Production
Firestore location: nam7
Hosting: enabled
Owner: jonesandjay123@gmail.com
Operator accounts: raijax.ai@gmail.com, jarvis.mac.ai@gmail.com
```

目前 backend 已用 Admin SDK service account 完成 full sync。

## Firestore 現有資料量

目前 Firestore mirror 共有 96 documents：

```text
thoughtAtlasMeta: 1
thoughtSources: 3
thoughtDigests: 3
thoughtNodes: 38
thoughtEdges: 37
thoughtReports: 3
thoughtRegistryRuns: 11
```

這就是前端 v0 可以讀的 seed dataset。

## Collection layout

```text
thoughtAtlasMeta/current
thoughtSources/{sourceId}
thoughtDigests/{digestId}
thoughtNodes/{nodeId}
thoughtEdges/{edgeId}
thoughtReports/{sourceId}
thoughtRegistryRuns/{runId}
```

前端 v0 最需要的是：

```text
thoughtSources
thoughtNodes
thoughtEdges
thoughtReports
thoughtAtlasMeta/current
```

`thoughtDigests` 可以做 source detail / digest inspector。  
`thoughtRegistryRuns` 可以之後做 backend run log / ingest history，不是第一屏必要。

## Seed sources

目前三篇 source：

### `original-conversation-2026-04-11`

Conversation / reflection source。

主題：

- labor devotion
- happiness / comparison
- embodied agency
- AI as forge, not vessel
- Trigger → Expand → Package → Compound
- Thinking → Building → Compounding

### `ikigai-2026-04-25`

Conversation / product strategy source。

主題：

- Ikigai
- externalization
- natural-overflow productization
- Playable Life System

### `codex-app-validation-checklist-2026-04-18`

Checklist / report source。

主題：

- Codex validation
- Slack-first gate
- Codex as likely inner worker

## Firestore document shapes

完整後端 schema 見 `~/Downloads/code/thought-atlas/docs/firestore-schema.md`。以下是 UI 開發最需要的簡版。

### `thoughtAtlasMeta/current`

用途：首頁 / data status / debug badge。

重要 fields：

```ts
type ThoughtAtlasMeta = {
  schema_version: string;
  project_id: string;
  exported_at: string;
  source_count: number;
  digest_count: number;
  node_count: number;
  edge_count: number;
  report_count: number;
  registry_run_count: number;
  local_graph_updated_at: string | null;
};
```

### `thoughtSources/{sourceId}`

用途：source list / source filter / source detail。

重要 fields：

```ts
type ThoughtSourceDoc = {
  source_id: string;
  title: string;
  source_type: string;
  status: string;
  path: string;
  manifest_path: string;
  content_hash: string;
  tags: string[];
  origin: Record<string, unknown> | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};
```

注意：`path` 是 backend local repo path，不是前端可以 fetch 的 URL。

### `thoughtNodes/{nodeId}`

用途：node explorer / graph node / inspector。

重要 fields：

```ts
type ThoughtNodeDoc = {
  id: string;
  kind: string;
  title: string;
  body: string;
  source_refs: SourceRef[];
  confidence: number;
  tags: string[];
  source_ids: string[];
  updated_at: string | null;
};
```

UI 建議優先顯示：

- title
- kind
- body
- tags
- confidence
- source_ids
- source_refs

### `thoughtEdges/{edgeId}`

用途：graph links / edge explorer / node relation list。

重要 fields：

```ts
type ThoughtEdgeDoc = {
  id: string;
  from: string;
  to: string;
  relation: string;
  weight: number | null;
  confidence: number;
  source_refs: SourceRef[];
  source_ids: string[];
  rationale: string;
  updated_at: string | null;
};
```

`from` / `to` 對應 `thoughtNodes/{nodeId}`。

前端應 client-side join：

```text
edge.from -> node.id
edge.to -> node.id
```

### `thoughtReports/{sourceId}`

用途：report view / source detail。

重要 fields：

```ts
type ThoughtReportDoc = {
  source_id: string;
  path: string;
  markdown: string;
  digest_id: string | null;
  patch_id: string | null;
  digest_items: number;
  patch_operations: number;
  graph_nodes: number;
  graph_edges: number;
  updated_at: string | null;
};
```

`markdown` 是可直接 render 的 ingest report。第一版可以先用 plain text / pre-wrap，不急著接 markdown renderer。

### `SourceRef`

```ts
type SourceRef = {
  source_id?: string;
  sourceId?: string;
  path?: string;
  quote?: string;
  start_line?: number;
  end_line?: number;
  startLine?: number;
  endLine?: number;
  chunk_id?: string;
  chunkId?: string;
};
```

後端目前命名以 snake_case 為主；UI adapter 可以 normalize 成 camelCase view model。

## 建議 UI view model

不要讓 React components 直接依賴 Firestore doc shape。建議新增 adapter：

```text
Firestore docs
  -> src/clients/firestoreThoughtAtlasClient.ts
  -> src/viewModels/thoughtAtlasViewModel.ts
  -> React components
```

建議 view model：

```ts
type AtlasViewModel = {
  meta: ThoughtAtlasMeta | null;
  sources: SourceView[];
  nodes: NodeView[];
  edges: EdgeView[];
  reports: ReportView[];
};
```

NodeView 可包含：

```ts
type NodeView = {
  id: string;
  title: string;
  body: string;
  kind: string;
  tags: string[];
  sourceIds: string[];
  confidence: number;
  relatedEdges: EdgeView[];
};
```

EdgeView 可包含 resolved titles：

```ts
type EdgeView = {
  id: string;
  fromId: string;
  toId: string;
  fromTitle: string;
  toTitle: string;
  relation: string;
  rationale: string;
  confidence: number;
};
```

## 前端 v0 開發順序建議

### Phase 1：Firestore read-only client

- 安裝 Firebase web SDK。
- 新增 Firebase config，優先用 `.env.local` / Vite env。
- 建 `src/clients/firestoreThoughtAtlasClient.ts`。
- 讀取：
  - `thoughtAtlasMeta/current`
  - `thoughtSources`
  - `thoughtNodes`
  - `thoughtEdges`
  - `thoughtReports`
- 先用 one-shot `getDocs/getDoc`，不用 realtime listener。
- 加 loading / error / empty state。

### Phase 2：把 mock data 換成 Firestore view model

- 保留 `src/data/mockThoughtAtlas.ts` 作為 fallback / demo fixture。
- App 支援 Firestore load 成功時用 live data，失敗時顯示 error，不要 silently fallback 混淆。
- 建立 normalized map：`nodeById`, `sourceById`, `reportBySourceId`。

### Phase 3：Explorer UI

優先做：

1. Source list
2. Node explorer
3. Edge explorer
4. Report view
5. Basic graph preview

先不要追求複雜 layout。38 nodes / 37 edges 的資料量，可以先用簡單 deterministic layout 或現有 mock graph frame 改造。

### Phase 4：Graph view

可以先做低風險版本：

- node cards / bubbles
- selected node highlights related edges
- edge list around selected node
- source/tag/kind filters

不要急著加 heavy graph library，除非 UI 真的卡住。

## 不要做的事

第一版 frontend 不要做：

- Firestore writes
- source ingest
- graph patch apply
- report generation
- credential / Admin SDK
- Firebase Functions
- user-generated editing
- delete / reset / sync buttons

這些都屬於 `thought-atlas` backend core 或未來 controlled admin surface。

## 後端操作入口

如果前端需要更新資料，不是在 UI 改，應回到 backend repo：

```bash
cd ~/Downloads/code/thought-atlas
npm run build
node scripts/sync-firestore.mjs --project-id thought-atlas --dry-run
node scripts/sync-firestore.mjs --project-id thought-atlas --write
```

Service account key 位於：

```text
~/Downloads/code/thought-atlas/.secrets/service-account.json
```

不要把 service account 放進 UI repo。

## 新 session 快速讀取順序

1. `thought-atlas-ui/README.md`
2. `thought-atlas-ui/docs/backend-handoff-zh.md`
3. `thought-atlas-ui/docs/firestore-ui-plan-zh.md`
4. `thought-atlas-ui/docs/ui-architecture-zh.md`
5. `thought-atlas/docs/handoff.md`（需要更深 backend 細節時）
6. `jarvis-firebase-ops/projects/thought-atlas/README.md`（需要 Firebase ops 對口時）
