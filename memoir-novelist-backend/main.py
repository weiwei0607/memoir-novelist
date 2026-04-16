from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List, Optional
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from database import engine, init_db, get_session
from models import Diary, DiaryCreate, Novel, NovelGenerateRequest
from ai_service import ai_service

app = FastAPI(title="回憶小說家 (Memoir Novelist) API", version="1.0.0")

# --- Firebase Admin 初始化（使用 Cloud Run 預設憑證）---
if not firebase_admin._apps:
    firebase_admin.initialize_app()

# --- CORS 設定 ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://memoir-novelist.web.app", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
def list_diaries(uid: str = Depends(get_current_user), session: Session = Depends(get_session)):
    diaries = session.exec(select(Diary).where(Diary.firebase_uid == uid)).all()
    return diaries

@app.post("/diaries", response_model=Diary)
def create_diary(diary_in: DiaryCreate, uid: str = Depends(get_current_user), session: Session = Depends(get_session)):
    db_diary = Diary(user_id=1, firebase_uid=uid, content=diary_in.content)
    session.add(db_diary)
    session.commit()
    session.refresh(db_diary)
    return db_diary

@app.delete("/diaries/{diary_id}")
def delete_diary(diary_id: int, uid: str = Depends(get_current_user), session: Session = Depends(get_session)):
    diary = session.get(Diary, diary_id)
    if not diary or diary.firebase_uid != uid:
        raise HTTPException(status_code=404, detail="日記不存在")
    session.delete(diary)
    session.commit()
    return {"ok": True}

# --- Novel API ---
@app.post("/novels/generate", response_model=Novel)
async def generate_novel(request: NovelGenerateRequest, uid: str = Depends(get_current_user), session: Session = Depends(get_session)):
    diaries = session.exec(select(Diary).where(Diary.id.in_(request.diary_ids), Diary.firebase_uid == uid)).all()
    if not diaries:
        raise HTTPException(status_code=404, detail="找不到指定的日記素材")

    novel_data = await ai_service.generate_novel_content(diaries, request)

    db_novel = Novel(
        user_id=1,
        firebase_uid=uid,
        title=novel_data.get("title", "未命名故事"),
        full_content=novel_data.get("full_content", "生成失敗"),
        genre=request.genre,
        user_role=request.user_role,
        protagonist_name=request.protagonist_name,
        diary_ids=request.diary_ids
    )
    session.add(db_novel)
    session.commit()
    session.refresh(db_novel)
    return db_novel

@app.get("/novels", response_model=List[Novel])
def list_novels(uid: str = Depends(get_current_user), session: Session = Depends(get_session)):
    novels = session.exec(select(Novel).where(Novel.firebase_uid == uid)).all()
    return novels

@app.delete("/novels/{novel_id}")
def delete_novel(novel_id: int, uid: str = Depends(get_current_user), session: Session = Depends(get_session)):
    novel = session.get(Novel, novel_id)
    if not novel or novel.firebase_uid != uid:
        raise HTTPException(status_code=404, detail="小說不存在")
    session.delete(novel)
    session.commit()
    return {"ok": True}
