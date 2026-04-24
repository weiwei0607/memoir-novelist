#!/bin/bash
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "--- 啟動後端 ---"
cd "$SCRIPT_DIR/memoir-novelist-backend"
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 > backend.log 2>&1 &

echo "--- 啟動前端 ---"
cd "$SCRIPT_DIR/memoir-novelist-frontend"
npm run dev -- --host 127.0.0.1 --port 5173 > frontend.log 2>&1 &

sleep 5
