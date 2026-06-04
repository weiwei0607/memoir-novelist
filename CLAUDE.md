# Memoir-Novelist-Project 回憶錄小說家

AI 輔助回憶錄撰寫平台，三端架構。

## 結構
```
memoir-novelist-backend/   — Python FastAPI 後端
memoir-novelist-frontend/  — React + Vite 前端
memoir_novelist_mobile/    — Flutter 手機版
deploy_backend.sh / deploy_frontend.sh — 部署腳本
firebase.json              — Firebase Hosting 設定
```

## 後端（Python FastAPI）
- `main.py` — API 路由入口
- `ai_service.py` — AI 呼叫（Gemini）
- `database.py` — SQLite（memoir_novelist.db）
- `models.py` — Pydantic 資料模型
- 啟動：`start_memoir_novelist.sh`

## 前端（React）
- `src/App.jsx` — 主入口
- `src/api.js` — 後端 API 呼叫封裝
- `src/firebase.js` — Firebase 設定

## 部署
- 前端：Firebase Hosting（`deploy_frontend.sh`）
- 後端：Google Cloud Run（`deploy_backend.sh`）

## 常用指令
```bash
cd ~/development/Memoir-Novelist-Project
./start_memoir_novelist.sh        # 一鍵啟動前後端
cd memoir-novelist-backend && python main.py
cd memoir-novelist-frontend && npm run dev
```
