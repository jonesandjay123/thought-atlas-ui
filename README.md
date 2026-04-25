# Thought Atlas UI

Thought Atlas UI 是 Thought Atlas 的 hosted web app shell。這個 repo 只負責前端介面、互動骨架、Firebase Hosting 設定，以及把 Firestore 上的 Thought Atlas 資料以 read-only explorer 呈現出來。

核心 engine、資料抽取、graph schema、import/export pipeline 不在這裡；它們屬於 `jonesandjay123/thought-atlas`。

> 新前端 session 接手請先讀：`docs/backend-handoff-zh.md` 和 `docs/firestore-ui-plan-zh.md`。

## Repo 定位

- UI only：Vite + React + TypeScript 的私有前端 repo
- UI first：Vite + React + TypeScript 的 private hosted frontend
- Live data：若 `.env.local` / Hosting env 有 Firebase web config，畫面會讀 Firestore 上的 `thought-atlas` seed data
- Mock fallback：缺 Firebase config 時才回到 `src/data/mockThoughtAtlas.ts`
- Read-only boundary：第一版只讀 Firestore，不寫入、不 sync、不 ingest
- Core separated：不要把 engine、CLI、ingest pipeline 或 durable graph storage 搬進這個 repo

## 目前畫面

目前 V0 read-only viewer 已接上 Firestore live data，主要互動包含：

- Overview data status
- Source list / source filter
- Node explorer with search/kind/tag/source filters
- Node inspector with related incoming/outgoing edges
- Report viewer
- Simple graph preview

`mockThoughtAtlas.ts` 現在只作為缺 Firebase config 時的 local fallback。

## 開發

```bash
npm install
npm run dev
npm run build
```

`npm run build` 會先跑 TypeScript build，再用 Vite 產生 `dist/`。

## V0：Firestore read-only viewer

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
6. 保持 read-only，不做 Firestore writes。

## 文件

- `docs/backend-handoff-zh.md`：後端狀態、Firestore schema、資料語意、repo 分工交接
- `docs/firestore-ui-plan-zh.md`：下一階段 Firestore read-only viewer 開發計畫
- `docs/ui-architecture-zh.md`：UI repo 分層、資料邊界、未來 client 接法
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

V0 live 驗證狀態：

- `npm run build` 通過。
- Firebase Web App `thought-atlas-ui` 已建立並可取得 SDK config。
- Firestore rules 目前由 Jones 決定使用 public read / no client write：`allow read: if true; allow write: if false;`。
- Hosting 已部署：`https://thought-atlas.web.app`。
- Browser snapshot 已確認 hosted site 顯示 Live Firestore，且 counts 為 3 sources / 38 nodes / 37 edges / 3 reports。

下一步可再討論 Auth owner-only read 或 V1 graph explorer/library strategy；目前 V0 不做 Auth、不做 CRUD、不做 Functions、不做 Graphify/library 決策。
