# Thought Atlas 架構

Thought Atlas 採 local-first 架構。所有可長期保存的資料都應該先落在 repo 內的可讀檔案，前端只是其中一個操作介面。

## 分層

```text
Source Layer
  長篇 AI 對話、Markdown notes、research reports、repo STATE.md

Ingest Layer
  parser、chunker、frontmatter reader、conversation importer

Triage Layer
  idea inbox、auto-tag、duplicate detection、promotion suggestion

Graph Layer
  nodes、edges、clusters、source anchors、confidence metadata

Synthesis Layer
  cluster reports、open questions、next moves、change summaries

Interface Layer
  React atlas UI、CLI、Jarvis automation scripts
```

## 原則

- Local-first：資料預設存在本機，sync 是選項，不是前提
- Agent-native：Jarvis 可以用 script 修改資料，不必只能透過 UI
- Provenance-first：每個重要結論都要能回到來源
- Reviewable：自動抽取只能進 inbox，升級成 durable node 需要 review
- Dense over decorative：圖譜是為了提高判斷密度，不是視覺展示

## Prototype 決策

目前使用 Vite、React、TypeScript 和 SVG。圖譜使用固定 seed coordinates 模擬 force-directed atlas，先避免 D3 / Cytoscape / graph runtime 這類 dependency。等資料模型和互動方向穩定後，再決定是否需要真正的 layout engine。

## 未來可加入的本地 pipeline

```text
npm run ingest -- sources/chatgpt-thread.md
npm run promote -- inbox/2026-04-25.json
npm run report -- cluster jarvis-native
```

CLI 應該輸出清楚 diff，讓 Jarvis 能回報：「新增了 5 個 inbox items、promote 2 個 nodes、建立 3 條 edges、更新 1 份 cluster report」。
