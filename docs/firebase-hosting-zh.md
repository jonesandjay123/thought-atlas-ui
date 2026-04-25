# Firebase Hosting 設定筆記

這個 repo 會預留給 future Firebase Hosting，但目前不部署、不連 Firebase SDK、不綁定真實 project。

## 目前狀態

- `firebase.json` 已設定 Hosting 讀取 Vite build output：`dist`
- `.firebaserc` 使用 placeholder project id
- `dist/` 由 `npm run build` 產生，並由 `.gitignore` 排除
- app 目前是 static SPA，可以由 Hosting rewrite 到 `index.html`

## 部署前要做的事

1. 在 Firebase console 建立正式 project
2. 把 `.firebaserc` 的 `thought-atlas-ui-placeholder` 換成真實 project id
3. 確認 `firebase login` 使用正確 Google 帳號
4. 執行 `firebase use <project-id>` 檢查目標 project
5. 跑 `npm run build`
6. 跑 `firebase hosting:channel:deploy preview` 先看 preview channel
7. 確認 preview OK 後，才執行 production deploy

## 建議 Hosting 行為

目前 `firebase.json` 採用：

- public directory：`dist`
- SPA rewrite：所有 route 回到 `/index.html`
- ignore：`firebase.json`、dotfiles、`node_modules`
- cleanUrls：開啟
- trailingSlash：關閉

這些設定適合單頁 Vite app。未來如果改成多頁、SSR 或 Cloud Functions，需要重新設計 hosting target。

## 目前刻意不做

- 不加入 `firebase` npm package
- 不初始化 Firebase app
- 不設定 Firestore rules
- 不設定 Auth
- 不設定 Functions
- 不部署 Hosting

原因是 Thought Atlas core 與資料來源邊界尚未定案。現在先讓 UI repo 成為可 build、可 preview、可安全接 hosting 的 shell。

## 風險提醒

Firebase project 一旦綁定 production deploy，`firebase deploy` 會直接更新公開網站。部署前應該使用 preview channel，並確認 `.firebaserc` 指向的是正確 project。
