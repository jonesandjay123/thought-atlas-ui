# Thought Atlas UI

Thought Atlas UI 是 Thought Atlas 的 hosted web app shell。這個 repo 只負責前端介面、互動骨架、Firebase Hosting 設定，以及把 Firestore 上的 Thought Atlas 資料以 read-only explorer 呈現出來。

核心 engine、資料抽取、graph schema、import/export pipeline 不在這裡；它們屬於 `jonesandjay123/thought-atlas`。

> 新前端 session 接手請先讀：`docs/backend-handoff-zh.md` 和 `docs/firestore-ui-plan-zh.md`。

## Repo 定位

- UI only：Vite + React + TypeScript 的私有前端 repo
- UI first：Vite + React + TypeScript 的 private hosted frontend
- Current mock data：目前畫面仍讀 `src/data/mockThoughtAtlas.ts`
- Next phase：接 Firebase web SDK，讀 Firestore 上的 `thought-atlas` seed data
- Read-only boundary：第一版只讀 Firestore，不寫入、不 sync、不 ingest
- Core separated：不要把 engine、CLI、ingest pipeline 或 durable graph storage 搬進這個 repo

## 目前畫面

現有 atlas UI 來自早期 prototype，已保留主要互動：

- mock idea inbox
- static graph preview
- node inspector
- mock cluster report
- cluster filter tabs

這些資料只用來展示未來 UI shape。`thought-atlas` core repo 現在已經把 seed dataset sync 到 Firestore；下一階段應把 `mockThoughtAtlas.ts` 替換成 Firestore read-only data access layer。

## 開發

```bash
npm install
npm run dev
npm run build
```

`npm run build` 會先跑 TypeScript build，再用 Vite 產生 `dist/`。

## 下一階段：Firestore read-only viewer

後端目前已完成 v0 full sync 到 Firebase project `thought-atlas`：

```text
thoughtSources: 3
thoughtDigests: 3
thoughtNodes: 38
thoughtEdges: 37
thoughtReports: 3
thoughtRegistryRuns: 11
```

前端第一階段目標：

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

目前這個 repo 還沒有 Firebase SDK integration；下一個前端 session 可以開始接 Firestore read-only client。

部署仍不要急著做。先完成 local read-only viewer，確認資料顯示正確後，再決定 Hosting / Auth / Rules。
