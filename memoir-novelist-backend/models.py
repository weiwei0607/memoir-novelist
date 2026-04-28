from typing import List, Optional, Dict
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship, JSON, Column

# --- User Model ---
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(unique=True)
    hashed_password: str
    is_premium: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Diary Model ---
class Diary(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    firebase_uid: str = Field(index=True)
    content: str
    mood_score: Optional[float] = None
    tags: Optional[List[str]] = Field(default=[], sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Novel Model ---
class Novel(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    firebase_uid: str = Field(index=True)
    title: str
    full_content: str
    genre: str = Field(default="現代都會")
    user_role: str = Field(default="主角")
    protagonist_name: Optional[str] = Field(default="無名氏")
    diary_ids: List[int] = Field(default=[], sa_column=Column(JSON))
    chapter_number: Optional[int] = Field(default=None)
    previous_summary: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- API Request Models ---
class DiaryCreate(SQLModel):
    content: str

class NovelGenerateRequest(SQLModel):
    diary_ids: List[int]
    genre: str = "現代都會"
    user_role: str = "主角"
    protagonist_name: str = "無名氏"
    style: str = "流暢優美的文學風格"
    continuity_mode: bool = False  # 是否開啟連續章節模式
