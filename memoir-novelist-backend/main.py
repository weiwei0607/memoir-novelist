from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
from database import engine, init_db, get_session
from models import Diary, DiaryCreate, Novel, NovelGenerateRequest
from ai_service import ai_service

app = FastAPI(title="回憶小說家 (Memoir Novelist) API", version="1.0.0")

# --- CORS 設定 (關鍵：允許 Web 與 Mobile 存取) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 正式環境應限制域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def read_root():
    return {"status": "online", "message": "歡迎來到回憶小說家 API"}

# --- Diary API ---
@app.get("/diaries", response_model=List[Diary])
def list_diaries(session: Session = Depends(get_session)):
    diaries = session.exec(select(Diary)).all()
    return diaries

@app.post("/diaries", response_model=Diary)
def create_diary(diary_in: DiaryCreate, session: Session = Depends(get_session)):
    # 這裡暫時模擬 user_id = 1，未來會加入 Auth
    db_diary = Diary(user_id=1, content=diary_in.content)
    session.add(db_diary)
    session.commit()
    session.refresh(db_diary)
    return db_diary

# --- Novel API ---
@app.post("/novels/generate", response_model=Novel)
async def generate_novel(request: NovelGenerateRequest, session: Session = Depends(get_session)):
    # 1. 抓取對應的日記素材
    diaries = session.exec(select(Diary).where(Diary.id.in_(request.diary_ids))).all()
    if not diaries:
        raise HTTPException(status_code=404, detail="找不到指定的日記素材")

    # 2. 呼叫 AI 服務進行生成
    novel_data = await ai_service.generate_novel_content(diaries, request)
    
    # 3. 將生成結果存入資料庫
    db_novel = Novel(
        user_id=1,  # 暫時模擬
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
def list_novels(session: Session = Depends(get_session)):
    novels = session.exec(select(Novel)).all()
    return novels
