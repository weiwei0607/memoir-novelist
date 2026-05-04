# 📖 Memoir Novelist — 回憶小說家

> 把你的日記變成一本小說，用 AI 幫你把回憶變成故事

<p align="center">
  <img src="https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter" />
  <img src="https://img.shields.io/badge/FastAPI-0.1xx-009688?logo=fastapi" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/AI-Gemini-4285F4?logo=google" />
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase" />
</p>

<p align="center">
  <b>每天寫一點，AI 幫你串成一部屬於你的回憶錄</b><br/>
  <b>選擇小說風格、設定你在故事中的角色，讓回憶變得有趣</b>
</p>

---

## ✨ 核心體驗

### 📝 寫日記

```
📅 2026-04-25
今天去了宜蘭，騎腳踏車環湖，
晚上吃了超好吃的蔥油餅，
但回來的時候下大雨，淋成落湯雞...
```

### ✨ AI 生成小說

選擇風格後，AI 把你的多篇日記合成一部連貫小說：

```
🎭 選擇風格：
○ 青春校園愛情  ○ 懸疑推理  ○ 溫馨療癒  ○ 熱血冒險

👤 你在故事中的角色：主角 / 旁觀者 / 神秘導師

📖 生成中...

「第四章：雨中的蔥油餅」

林小雨從沒想過，一場突如其來的大雨會讓她遇見那個人。
那天她在宜蘭的湖邊騎著腳踏車，風把她的頭髮吹得亂七八糟...
```

---

## 🏗️ 系統架構

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Flutter App   │────→│  FastAPI 後端    │────→│   Gemini AI     │
│  (手機寫日記)    │     │  • 日記 CRUD     │     │  • 小說生成      │
│                 │←────│  • 用戶認證      │←────│  • 風格控制      │
└─────────────────┘     │  • 速率限制      │     └─────────────────┘
                        └─────────────────┘
                                 ↑
                        ┌─────────────────┐
                        │  React Web App  │
                        │  (網頁版閱讀)    │
                        └─────────────────┘
```

---

## 🛠️ 技術棧

| 層 | 技術 |
|----|------|
| **Mobile** | Flutter + Dart |
| **Backend** | FastAPI + SQLModel + SQLite |
| **Web** | React 19 + Vite + Tailwind |
| **AI** | Google Gemini 2.0 Flash |
| **Auth** | Firebase Auth |
| **Deploy** | Cloud Run + Firebase Hosting |

---

## 🚀 快速開始

### 後端
```bash
cd memoir-novelist-backend
pip install -r requirements.txt
# 設定 GEMINI_API_KEY 在 .env
python main.py
```

### 前端
```bash
cd memoir-novelist-frontend
npm install
npm run dev
```

### Mobile
```bash
cd memoir_novelist_mobile
flutter pub get
flutter run
```

---

## 🗺️ 產品路線圖

- [x] **核心功能**
  - [x] 日記撰寫與管理
  - [x] AI 小說生成（Gemini）
  - [x] 風格選擇（愛情/懸疑/療癒/冒險）
  - [x] 角色設定

- [ ] **增強體驗**
  - [ ] 插圖生成（AI 繪圖）
  - [ ] 語音朗讀小說
  - [ ] 分享/匯出 PDF
  - [ ] 多人協作寫同一本小說

---

## 📝 License

MIT License © 2026
