# Thought Atlas UI

Thought Atlas UI 是 Thought Atlas 的 hosted public-readable showcase。這個 repo 只負責前端介面、互動骨架、Firebase Hosting 設定，以及把 Firestore 上的 Thought Atlas 資料以 read-only / owner-ready explorer 呈現出來。

核心 engine、資料抽取、graph schema、import/export pipeline 不在這裡；它們屬於 `jonesandjay123/thought-atlas`。

> 新前端 session 接手請先讀：`docs/backend-handoff-zh.md` 和 `docs/firestore-ui-plan-zh.md`。

## Repo 定位

- UI only：Vite + React + TypeScript 的私有前端 repo
- UI first：Vite + React + TypeScript 的 private hosted frontend
- Live data：若 `.env.local` / Hosting env 有 Firebase web config，畫面會讀 Firestore 上的 `thought-atlas` seed data
- Mock fallback：缺 Firebase config 時才回到 `src/data/mockThoughtAtlas.ts`
- Public-readable showcase：所有訪客可讀 Firestore showcase data
- Owner-ready boundary：可選 Google login 只顯示 owner 狀態；目前沒有 write UI、不 sync、不 ingest
- Core separated：不要把 engine、CLI、ingest pipeline 或 durable graph storage 搬進這個 repo

## 目前畫面

目前 V0.2 public-readable showcase 已接上 Firestore live data，主要互動包含：

- Overview data status
- Source list / source filter
- Node explorer with search/kind/tag/source filters
- Node inspector with related incoming/outgoing edges
- Report viewer
- Simple graph preview
- Optional Google login status，owner email 顯示 Owner mode，但不阻止 public read
- Dashboard polish：latest sources、top tags/themes、recently active nodes、quick links
- V1 first slice：public-facing hero copy、What is this、Featured Themes、Thought Trails placeholder

`mockThoughtAtlas.ts` 現在只作為缺 Firebase config 時的 local fallback。

## 開發

```bash
npm install
npm run dev
npm run build
```

`npm run build` 會先跑 TypeScript build，再用 Vite 產生 `dist/`。

## V0/V0.2：Public-readable showcase

後端目前已完成 v0 full sync 到 Firebase project `thought-atlas`：

```text
thoughtSources: 3
thoughtDigests: 3
thoughtNodes: 38
thoughtEdges: 37
thoughtReports: 3
thoughtRegistryRuns: 11
```

前端第一階段目標已完成：

1. 讀 `thoughtAtlasMeta/current` 顯示資料狀態。
2. 讀 `thoughtSources` 顯示 source list。
3. 讀 `thoughtNodes` 顯示 node explorer。
4. 讀 `thoughtEdges` 顯示 relations / graph preview。
5. 讀 `thoughtReports` 顯示 ingest reports。
6. 保持目前 client read-oriented；V0.2 不做 CRUD、不做 Functions、不做 write UI。

## 文件

- `docs/backend-handoff-zh.md`：後端狀態、Firestore schema、資料語意、repo 分工交接
- `docs/firestore-ui-plan-zh.md`：下一階段 Firestore read-only viewer 開發計畫
- `docs/ui-architecture-zh.md`：UI repo 分層、資料邊界、未來 client 接法
- `docs/graph-explorer-strategy.md`：V1 graph explorer / library strategy（V0.2 不導入 graph library）
- `docs/v1-showcase-strategy.md`：V1 public showcase / AI-assisted thought portfolio 產品方向
- `docs/v1-theme-views.md`：V1.2 Theme / Tag Detail Views，讓 tags 變成 public entry points
- `docs/firebase-hosting-zh.md`：未來 Firebase Hosting 設定與部署前檢查
- `docs/architecture-zh.md`：早期 prototype 的整體架構背景
- `docs/data-model-zh.md`：早期資料模型草案

## Firebase 狀態

Firebase project 已確認：

```text
project_id: thought-atlas
firestore: Production, nam7
hosting: enabled
```

目前這個 repo 已有 Firebase SDK read-only client 與 live data adapter；若 `.env.local` 有 Firebase web config，UI 會用 `getDoc/getDocs` 讀 Firestore，否則回到 mock fallback。

V0/V0.2 live 驗證狀態：

- `npm run build` 通過。
- Firebase Web App `thought-atlas-ui` 已建立並可取得 SDK config。
- Firestore rules 由 Jones 決定採 public read + owner-only write：`allow read: if true; allow write: if request.auth.token.email == "jonesandjay123@gmail.com";`。
- UI 不擋 public read；Google login 只顯示 owner/visitor 狀態，目前沒有任何 write controls。
- Hosting 已部署：`https://thought-atlas.web.app`。
- Browser snapshot 已確認 hosted site 顯示 Live Firestore，且 counts 為 3 sources / 38 nodes / 37 edges / 3 reports。

下一步可再討論真正的 owner write tools 或 V1 graph explorer/library strategy；目前 V0.2 不做 CRUD、不做 Functions、不導入 graph library。
