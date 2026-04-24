from sqlmodel import create_engine, SQLModel, Session
import os
from dotenv import load_dotenv

load_dotenv()

# 優先使用環境變數 DATABASE_URL，否則使用本地 SQLite
_database_url = os.getenv("DATABASE_URL", "sqlite:///./memoir_novelist.db")
# Cloud SQL PostgreSQL 範例: postgresql+psycopg2://user:pass@/dbname?host=/cloudsql/PROJECT:REGION:INSTANCE
_engine_echo = os.getenv("DB_ECHO", "false").lower() == "true"

# 加入連線池設定，避免 Cloud Run / 容器環境中的斷線問題
engine = create_engine(
    _database_url,
    echo=_engine_echo,
    pool_pre_ping=True,      # 使用前 ping，自動回收失效連線
    pool_recycle=300,        # 5 分鐘回收連線，避免資料庫端 timeout
    pool_size=5,             # 預設連線池大小
    max_overflow=10,         # 超額連線數
)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
