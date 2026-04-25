# Thought Atlas UI 架構

這個 repo 是 Thought Atlas 的 hosted UI shell，不是 core engine。前端要保持可部署、可替換資料來源、可逐步接上 Firebase，但不要在 UI 層重新實作 graph ingest 或 reasoning pipeline。

## 邊界

`thought-atlas-ui` 負責：

- React app shell
- atlas graph preview
- inspector、inbox、cluster report 等互動介面
- 前端 route、layout、loading/error state
- future Firebase Hosting config
- future client-side data access adapter

`jonesandjay123/thought-atlas` 負責：

- source ingest
- thought extraction
- graph schema 與 durable storage 格式
- graph diff、promotion workflow、report generation
- export format 或 Firestore 寫入策略

UI repo 不應該直接長出 engine logic。若某段程式需要理解 source、產生 node、判斷 edge 或更新 report，它應該在 core repo。

## 目前資料流

```text
src/data/mockThoughtAtlas.ts
  -> React components
  -> static atlas preview
```

Mock data 是 temporary contract。它的目的是讓 layout、interaction、visual density 先穩定，不代表正式資料格式已確定。

## 未來資料流

未來應該透過一個 thin client adapter 替換 mock data：

```text
Firestore 或 exported graph payload
  -> graph client adapter
  -> normalized UI view model
  -> React components
```

建議新增的分層：

- `src/clients/`：Firestore client 或 exported graph client
- `src/viewModels/`：把 core graph payload 轉成 UI 需要的 shape
- `src/data/mockThoughtAtlas.ts`：保留給 local preview、storybook-like demo、測試 fixtures
- `src/types.ts`：只放 UI view model type；core schema 應從 core repo 或 generated artifact 取得

## Component 原則

- App shell 先保持單頁，等 route 需求明確再加 router
- Components 只讀 normalized UI shape，不直接讀 Firestore document shape
- Loading、empty、error state 要在接真實 client 前先設計
- Inspector 和 report panel 應該顯示 provenance，但 provenance resolution 不在 UI 層做
- Graph layout 可以先沿用固定座標；是否引入 layout engine 要等資料量和互動需求穩定

## Firebase SDK 原則

2026-04-25 更新：backend v0 已把完整 seed dataset sync 到 Firebase project `thought-atlas`，所以下一階段可以加入 Firebase web SDK，但範圍必須保持 read-only。

第一階段允許：

- 初始化 Firebase web app
- 讀 `thoughtAtlasMeta/current`
- 讀 `thoughtSources`
- 讀 `thoughtNodes`
- 讀 `thoughtEdges`
- 讀 `thoughtReports`
- 將 Firestore docs normalize 成 UI view model

第一階段不允許：

- Firestore writes
- UI 觸發 backend sync
- UI 執行 ingest / graph patch / report generation
- 放入 Admin SDK credential 或 service account

更多交接與實作計畫見：

- `docs/backend-handoff-zh.md`
- `docs/firestore-ui-plan-zh.md`
