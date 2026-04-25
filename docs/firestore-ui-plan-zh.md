# Thought Atlas UI：Firestore Read-only 前端計畫

最後更新：2026-04-25

本文件描述下一篇前端 session 可以直接開始執行的 v0 開發計畫。

## 目標

把 Firestore 上已 sync 的 Thought Atlas backend 結果呈現出來。

```text
Firestore collections
  -> typed client
  -> normalized UI view model
  -> source / node / edge / report explorer
```

第一版目標是 read-only explorer，不是 production-grade editor。

## 成功標準

前端 v0 算完成，需達到：

- 可以從 Firebase project `thought-atlas` 讀資料。
- 顯示目前 meta counts：3 sources / 38 nodes / 37 edges / 3 reports。
- Source list 能列出三篇 seed sources。
- Node explorer 能列出 38 個 nodes，並能點選看詳情。
- Edge explorer 或 selected-node relation panel 能顯示 edges 關係。
- Report view 能顯示每篇 `thoughtReports/{sourceId}.markdown`。
- 沒有任何 UI write / delete / sync 動作。

## Firebase config 建議

Vite env：

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=thought-atlas
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

已新增：

```text
.env.example
```

下一個 session 應複製成：

```text
.env.local        # local only, do not commit
```

`.env.local` 不要 commit。

Firebase web config 不是 service account，不是 Admin SDK credential；但仍不要把私人 config/實驗設定亂貼到文件中。正式 deploy 前再整理。

## 建議檔案結構

```text
src/
  clients/
    firebaseApp.ts
    firestoreThoughtAtlasClient.ts
  viewModels/
    thoughtAtlasViewModel.ts
  types/
    firestore.ts
  data/
    mockThoughtAtlas.ts
  App.tsx
```

如果想維持目前簡單 repo，可以先不拆太細，但至少 client / adapter / components 要有概念分層。

## Firebase client sketch

```ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
```

## Read strategy

v0 用 one-shot reads：

```ts
getDoc(doc(db, 'thoughtAtlasMeta', 'current'))
getDocs(collection(db, 'thoughtSources'))
getDocs(collection(db, 'thoughtNodes'))
getDocs(collection(db, 'thoughtEdges'))
getDocs(collection(db, 'thoughtReports'))
```

暫時不要用 `onSnapshot`，避免前端狀態與即時更新複雜度過早上升。

## Data normalization

讀完 docs 後先 normalize：

```ts
const nodeById = new Map(nodes.map((node) => [node.id, node]));
const sourceById = new Map(sources.map((source) => [source.source_id, source]));
const reportBySourceId = new Map(reports.map((report) => [report.source_id, report]));
```

Edge 顯示時 resolve：

```ts
fromTitle = nodeById.get(edge.from)?.title ?? edge.from
toTitle = nodeById.get(edge.to)?.title ?? edge.to
```

Source filter：

```ts
node.source_ids.includes(selectedSourceId)
edge.source_ids.includes(selectedSourceId)
```

## UI surfaces

### 1. Status bar

顯示：

- Firebase project id
- `exported_at`
- source / node / edge / report counts
- read mode：Firestore read-only

### 2. Source list

Fields：

- title
- source_type
- status
- tags
- source_id
- last_seen_at / updated_at

點選 source 後：

- filter nodes / edges by source
- show report if exists

### 3. Node explorer

Fields：

- title
- kind
- body excerpt
- confidence
- tags
- source_ids

Filters：

- search text
- kind
- tag
- source

Inspector：

- full body
- source refs
- related outgoing/incoming edges

### 4. Edge explorer

Fields：

- from title
- relation
- to title
- confidence
- rationale
- source_ids

Useful grouping：

- by relation
- by selected node
- by selected source

### 5. Report view

Render `thoughtReports/{sourceId}.markdown`。

v0 可以先：

```css
white-space: pre-wrap;
```

之後再考慮 markdown renderer。

### 6. Graph preview

資料量目前只有 38 nodes / 37 edges。v0 可接受簡單布局：

- circular layout by index
- grouped columns by kind/source
- selected node centered with neighbors around it

不要一開始就引入重型 graph dependency，除非真的影響理解。

## Error handling

至少要分清楚：

- env config missing
- permission denied
- collection empty
- network / Firebase SDK error
- document shape mismatch

不要 silently fallback 到 mock data，否則 Jones 會以為看到 live data。

推薦：

```text
Live Firestore load failed: <error>
Mock data is available only in demo mode.
```

## Demo/mock mode

保留 `src/data/mockThoughtAtlas.ts` 有價值，但要明確標示。

建議模式：

```text
VITE_DATA_MODE=firestore | mock
```

預設可以先是 `mock`，接 Firestore 後改成 `firestore`。但 UI 上要顯示目前資料來源，避免混淆。

## Security / rules 注意

目前 UI read-only 不代表 Firestore rules 已經正式設計完。

前端 session 要先確認：

- 是否需要 Google Auth 才能 read。
- Firestore rules 是否允許目前 UI read。
- 若 rules 暫時關閉，前端可先完成 client code，但需要 Jones / Firebase Console 調整 rules 後才驗證 live read。

不要為了方便把 write 打開。

## 不應該在 UI repo 放的東西

- `.secrets/service-account.json`
- Firebase Admin SDK key
- backend sync script
- source ingestion pipeline
- graph patch apply script
- Firestore write utility

如果需要重新 sync：回 `~/Downloads/code/thought-atlas`。

## 下一個 session 可直接做的 checklist

1. `git pull` in `thought-atlas-ui`。
2. 讀：
   - `README.md`
   - `docs/backend-handoff-zh.md`
   - `docs/firestore-ui-plan-zh.md`
3. 新增 `.env.example` with Vite Firebase vars。
4. 安裝 Firebase web SDK。
5. 新增 Firebase client + Firestore read client。
6. 新增 typed Firestore doc types。
7. 新增 adapter：Firestore docs -> current UI shape 或 new view model。
8. 先 render status/source/node/report lists。
9. `npm run build`。
10. commit + push。

## 驗收方式

完成第一版 live read 後，回報 Jones：

```text
- connected project id
- loaded counts from thoughtAtlasMeta/current
- collections read successfully
- screenshot or local URL preview if available
- no writes performed
```

如果 permission denied，回報：

```text
Frontend code is ready, but Firestore rules/auth block read.
Need Jones to choose auth/rules posture.
```
