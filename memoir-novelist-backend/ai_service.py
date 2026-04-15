import os
import json
import google.generativeai as genai
from typing import List
from models import Diary, Novel, NovelGenerateRequest
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            # 這裡不報錯，但在呼叫時會檢查，方便開發測試
            self.model = None
        else:
            genai.configure(api_key=api_key)
            # 使用最新且支援 JSON Mode 的 Gemini 1.5 Pro
            self.model = genai.GenerativeModel('gemini-1.5-pro')

    async def generate_novel_content(self, diaries: List[Diary], request: NovelGenerateRequest) -> dict:
        if not self.model:
            return {
                "title": "系統測試故事", 
                "full_content": "（系統提示：請在 .env 中設定有效的 GEMINI_API_KEY 以啟用真實生成功能）\n這是一個模擬生成的預覽故事...",
                "genre": request.genre,
                "user_role": request.user_role
            }

        # 1. 整合素材
        diary_context = "\n".join([f"[{d.created_at.date()}] {d.content}" for d in diaries])

        # 2. 設計多重宇宙與角色扮演 Prompt
        prompt = f"""
        # Role: 專業小說創作者 (宇宙煉金師)
        你是一位擅長將平庸日常轉化為非凡史詩的小說家。你的任務是將提供的日記碎片轉化為一篇短篇小說。

        # 設定 (Settings)
        - 故事風格 (Genre): {request.genre}
        - 使用者角色 (User Role): {request.user_role}
        - 主角姓名 (Protagonist Name): {request.protagonist_name}
        - 文學風格: {request.style}

        # 任務目標 (Objectives)
        1. 轉譯場景: 如果風格是「古裝」，將現代咖啡廳轉化為客棧，現代手機轉化為傳信紙箋。如果是「科幻」，則轉化為太空站。
        2. 角色視角: 如果使用者角色是「主角」，請以第一人稱或緊貼主角的第三人稱敘述。如果是「路人」，請以旁觀者的視角冷眼觀察日記中的事件。
        3. 起承轉合: 確保故事包含開端、發展、高潮與結局，字數約 600 字左右。
        4. 嚴格限制: 標題與內文絕對不可包含冒號 (:) 符號。

        # 來源日記素材
        {diary_context}

        # 輸出格式 (JSON Mode)
        請回傳以下格式的 JSON 物件：
        {{
            "title": "故事標題",
            "full_content": "故事內文全文..."
        }}
        """

        try:
            # 呼叫 Gemini 1.5 Pro 進行生成
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            # 解析回傳的 JSON
            result = json.loads(response.text)
            return result
        except Exception as e:
            print(f"AI 生成失敗: {str(e)}")
            return {
                "title": f"時空亂流中的殘片 ({request.genre})",
                "full_content": f"生成時遇到一點混亂。錯誤訊息: {str(e)}"
            }

# 初始化服務實例
ai_service = AIService()
