import os
from fastapi import FastAPI, Depends, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from sqlmodel import Session, select
from typing import List, Optional
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from database import engine, init_db, get_session
from models import Diary, DiaryCreate, Novel, NovelGenerateRequest
from sqlalchemy import func
from ai_service import ai_service

# --- Rate Limiter ---
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="回憶小說家 (Memoir Novelist) API", version="1.1.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- Firebase Admin 初始化（使用 Cloud Run 預設憑證）---
if not firebase_admin._apps:
    firebase_admin.initialize_app()

# --- CORS 設定 ---
_allow_origins = os.getenv("CORS_ORIGINS", "https://memoir-novelist.web.app,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176")
origins = [o.strip() for o in _allow_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Trusted Host (生產環境建議開啟) ---
if os.getenv("ENV", "dev").lower() == "production":
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*.web.app", "*.run.app"])

@app.on_event("startup")
def on_startup():
    init_db()

# --- Auth 依賴 ---
def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未登入")
    token = authorization.split(" ")[1]
    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Token 無效")

@app.get("/")
def read_root():
    return {"status": "online", "message": "歡迎來到回憶小說家 API"}

# --- Diary API ---
@app.get("/diaries", response_model=List[Diary])
@limiter.limit("60/minute")
def list_diaries(request: Request, uid: str = Depends(get_current_user), session: Session = Depends(get_session)):
    diaries = session.exec(select(Diary).where(Diary.firebase_uid == uid)).all()
    return diaries

@app.post("/diaries", response_model=Diary)
@limiter.limit("30/minute")
def create_diary(request: Request, diary_in: DiaryCreate, uid: str = Depends(get_current_user), session: Session = Depends(get_session)):
    db_diary = Diary(firebase_uid=uid, content=diary_in.content)
    session.add(db_diary)
    session.commit()
    session.refresh(db_diary)
    return db_diary

@app.delete("/diaries/{diary_id}")
@limiter.limit("30/minute")
def delete_diary(request: Request, diary_id: int, uid: str = Depends(get_current_user), session: Session = Depends(get_session)):
    diary = session.get(Diary, diary_id)
    if not diary or diary.firebase_uid != uid:
        raise HTTPException(status_code=404, detail="日記不存在")
    session.delete(diary)
    session.commit()
    return {"ok": True}

# --- Novel API ---
@app.post("/novels/generate", response_model=Novel)
@limiter.limit("5/minute")
async def generate_novel(request: Request, req: NovelGenerateRequest, uid: str = Depends(get_current_user), session: Session = Depends(get_session)):
    diaries = session.exec(select(Diary).where(Diary.id.in_(req.diary_ids), Diary.firebase_uid == uid)).all()
    if not diaries:
        raise HTTPException(status_code=404, detail="找不到指定的日記素材")

    # Fetch previous novels for continuity
    previous_novels = []
    chapter_number = None
    if req.continuity_mode:
        prev_novels = session.exec(
            select(Novel).where(Novel.firebase_uid == uid).order_by(Novel.created_at.desc()).limit(3)
        ).all()
        previous_novels = [{"title": n.title, "full_content": n.full_content, "chapter_number": n.chapter_number or 1} for n in prev_novels]
        chapter_number = (prev_novels[0].chapter_number or 1) + 1 if prev_novels else 1

    novel_data = await ai_service.generate_novel_content(diaries, req, previous_novels)

    db_novel = Novel(
        firebase_uid=uid,
        title=novel_data.get("title", "未命名故事"),
        full_content=novel_data.get("full_content", "生成失敗"),
        genre=req.genre,
        user_role=req.user_role,
        protagonist_name=req.protagonist_name,
        diary_ids=req.diary_ids,
        chapter_number=chapter_number,
        previous_summary=previous_novels[0]["full_content"][:300] if previous_novels else None
    )
    session.add(db_novel)
    session.commit()
    session.refresh(db_novel)
    return db_novel

@app.get("/novels", response_model=List[Novel])
@limiter.limit("60/minute")
def list_novels(request: Request, uid: str = Depends(get_current_user), session: Session = Depends(get_session)):
    novels = session.exec(select(Novel).where(Novel.firebase_uid == uid)).all()
    return novels

@app.delete("/novels/{novel_id}")
@limiter.limit("30/minute")
def delete_novel(request: Request, novel_id: int, uid: str = Depends(get_current_user), session: Session = Depends(get_session)):
    novel = session.get(Novel, novel_id)
    if not novel or novel.firebase_uid != uid:
        raise HTTPException(status_code=404, detail="小說不存在")
    session.delete(novel)
    session.commit()
    return {"ok": True}

# --- Streak Tracking ---
@app.get("/streak")
@limiter.limit("60/minute")
def get_streak(request: Request, uid: str = Depends(get_current_user), session: Session = Depends(get_session)):
    diaries = session.exec(select(Diary).where(Diary.firebase_uid == uid).order_by(Diary.created_at.desc())).all()
    if not diaries:
        return {"current_streak": 0, "longest_streak": 0, "total_entries": 0, "last_entry_date": None}

    from datetime import date, timedelta
    dates = sorted(set([d.created_at.date() for d in diaries]), reverse=True)

    current_streak = 0
    longest_streak = 0
    temp_streak = 0
    prev_date = None

    for d in dates:
        if prev_date is None or (prev_date - d).days == 1:
            temp_streak += 1
        else:
            longest_streak = max(longest_streak, temp_streak)
            temp_streak = 1
        prev_date = d
    longest_streak = max(longest_streak, temp_streak)

    # Current streak from today or yesterday
    today = date.today()
    if dates and (today - dates[0]).days <= 1:
        current_streak = temp_streak
    else:
        current_streak = 0

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_entries": len(diaries),
        "last_entry_date": dates[0].isoformat() if dates else None
    }

# --- PDF Export ---
@app.get("/novels/{novel_id}/pdf")
@limiter.limit("10/minute")
def export_pdf(request: Request, novel_id: int, uid: str = Depends(get_current_user), session: Session = Depends(get_session)):
    novel = session.get(Novel, novel_id)
    if not novel or novel.firebase_uid != uid:
        raise HTTPException(status_code=404, detail="小說不存在")

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        from io import BytesIO

        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Title
        c.setFont("Helvetica-Bold", 20)
        c.drawString(72, height - 72, novel.title)

        # Metadata
        c.setFont("Helvetica", 10)
        c.drawString(72, height - 100, f"Genre: {novel.genre} | Role: {novel.user_role}")
        c.drawString(72, height - 115, f"Generated: {novel.created_at.strftime('%Y-%m-%d %H:%M')}")

        # Content (simple text wrapping)
        c.setFont("Helvetica", 12)
        y = height - 150
        words = novel.full_content.split()
        line = ""
        for word in words:
            if c.stringWidth(line + " " + word, "Helvetica", 12) < width - 144:
                line += " " + word if line else word
            else:
                c.drawString(72, y, line)
                y -= 18
                line = word
                if y < 72:
                    c.showPage()
                    y = height - 72
        if line:
            c.drawString(72, y, line)

        c.save()
        buffer.seek(0)
        from fastapi.responses import StreamingResponse
        return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={novel.id}_novel.pdf"})
    except ImportError:
        # Fallback: return text file if reportlab not installed
        from fastapi.responses import PlainTextResponse
        text = f"{novel.title}\n\n{novel.full_content}\n\n— Generated by Memoir Novelist"
        return PlainTextResponse(text, headers={"Content-Disposition": f"attachment; filename={novel.id}_novel.txt"})
