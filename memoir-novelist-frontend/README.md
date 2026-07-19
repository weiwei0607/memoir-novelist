# Memoir Novelist 前端

「回憶煉金術士」— AI 回憶錄小說生成應用的前端。使用者將日常日記封存為素材，再由 AI 將多則日記「煉金」成一篇篇小說故事。

## 功能

- Google 登入（Firebase Authentication）
- 撰寫、封存與刪除日記素材
- 選取多則日記，指定類型、角色與主角名稱，生成 AI 小說（煉金）
- 故事書櫃：瀏覽、閱讀（Reader）與刪除已生成的小說
- 連續寫作天數（streak）追蹤與會員卡片
- 連貫模式（continuity mode）：讓故事與前作保持連貫

## 技術棧

- React 19 + Vite 8
- Tailwind CSS 4
- Firebase Authentication（Google 登入）
- Axios（串接後端 API，預設 Cloud Run 上的 `memoir-novelist-backend`）
- framer-motion、lucide-react

## 本地開發

```bash
npm install
cp .env.example .env   # 填入 Firebase 設定（必要）與 VITE_API_BASE（選填）
npm run dev
```

建置與預覽：

```bash
npm run build
npm run preview
```

Lint：

```bash
npm run lint
```

## 環境變數

見 `.env.example`。`VITE_FIREBASE_*` 為 Firebase Web 應用設定；`VITE_API_BASE` 為後端 API 位址（未設定時預設指向 Cloud Run 正式後端）。

## 部署

部署於 Firebase Hosting（target：`memoir-novelist`）：

```bash
npm run build
firebase deploy --only hosting:memoir-novelist
```

線上網址：https://memoir-novelist.web.app
