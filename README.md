# Thought Atlas UI

Thought Atlas UI 是 Thought Atlas 的 hosted web app shell。這個 repo 只負責前端介面、互動骨架、Firebase Hosting 設定占位，以及未來接上資料 client 前的 mock atlas 畫面。

核心 engine、資料抽取、graph schema、import/export pipeline 不在這裡；它們屬於 `jonesandjay123/thought-atlas`。

## Repo 定位

- UI only：Vite + React + TypeScript 的私有前端 repo
- Mock data first：目前畫面讀 `src/data/mockThoughtAtlas.ts`
- Future Firebase Hosting：已放入 hosting placeholder config，但尚未部署
- No Firebase SDK yet：現在沒有 Firestore、Auth、Functions、Storage 或 Firebase app 初始化
- Core separated：不要把 engine、CLI、ingest pipeline 或 durable graph storage 搬進這個 repo

## 目前畫面

現有 atlas UI 來自早期 prototype，已保留主要互動：

- mock idea inbox
- static graph preview
- node inspector
- mock cluster report
- cluster filter tabs

這些資料只用來展示未來 UI shape。等 `thought-atlas` core repo 提供 Firestore client 或 exported graph client 後，才把 `mockThoughtAtlas.ts` 換成正式 data access layer。

## 開發

```bash
npm install
npm run dev
npm run build
```

`npm run build` 會先跑 TypeScript build，再用 Vite 產生 `dist/`。

## 文件

- `docs/ui-architecture-zh.md`：UI repo 分層、資料邊界、未來 client 接法
- `docs/firebase-hosting-zh.md`：未來 Firebase Hosting 設定與部署前檢查
- `docs/architecture-zh.md`：早期 prototype 的整體架構背景
- `docs/data-model-zh.md`：早期資料模型草案

## Firebase 狀態

`firebase.json` 和 `.firebaserc` 目前是 future hosting placeholder。`.firebaserc` 使用假 project id，部署前必須替換成真實 Firebase project。

目前不要執行 deploy。這個 repo 還沒有連接正式 Firebase project，也沒有 Firebase SDK integration。
