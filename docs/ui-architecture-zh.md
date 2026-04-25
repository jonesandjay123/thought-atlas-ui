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

目前不要加入 Firebase SDK。加入前至少要先決定：

- Auth 是否需要
- Firestore document path 與 security rules
- UI 是否讀 live graph，還是讀 core repo export 後的 published graph
- local dev 使用 emulator、mock file、還是 staging project

在這些問題未定前，這個 repo 只保留 Hosting placeholder。
