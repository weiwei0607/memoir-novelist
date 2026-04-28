import os
import json
import google.generativeai as genai
from typing import List
from models import Diary, NovelGenerateRequest
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
            # 使用支援 JSON Mode 的 Gemini 模型
            self.model = genai.GenerativeModel('gemini-2.0-flash')

    async def generate_novel_content(self, diaries: List[Diary], request: NovelGenerateRequest, previous_novels: List[dict] = None) -> dict:
        if not self.model:
            return {
                "title": "系統測試故事", 
                "full_content": "（系統提示：請在 .env 中設定有效的 GEMINI_API_KEY 以啟用真實生成功能）\n這是一個模擬生成的預覽故事...",
                "genre": request.genre,
                "user_role": request.user_role
            }

        # 1. 整合素材
        diary_context = "\n".join([f"[{d.created_at.date()}] {d.content}" for d in diaries])

        # 2. 連續性素材
        continuity_context = ""
        if previous_novels and len(previous_novels) > 0:
            continuity_context = "\n\n# 前情提要 (Previous Chapters Summary)\n"
            for i, prev in enumerate(previous_novels[-3:], 1):  # 最近 3 章
                continuity_context += f"第 {prev.get('chapter_number', '?')} 章《{prev.get('title', '')}》：{prev.get('full_content', '')[:200]}...\n"
            continuity_context += "\n請確保本章與前情提要的角色名字、場景設定、情節發展保持一致，形成連貫的長篇故事。"

        # 3. 設計多重宇宙與角色扮演 Prompt
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
        {continuity_context}

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
            # 呼叫 Gemini 進行生成，加入 timeout 避免請求掛死
            response = await self.model.generate_content_async(
                prompt,
                generation_config={"response_mime_type": "application/json"},
                request_options={"timeout": 60}
            )
            # 解析回傳的 JSON
            result = json.loads(response.text)
            return result
        except genai.types.BlockedPromptException as e:
            print(f"AI 內容被過濾: {str(e)}")
            return {
                "title": f"內容過濾 ({request.genre})",
                "full_content": "生成內容觸發安全過濾機制，請嘗試調整日記素材或風格設定。"
            }
        except genai.types.StopCandidateException as e:
            print(f"AI 生成中斷: {str(e)}")
            return {
                "title": f"生成中斷 ({request.genre})",
                "full_content": "AI 生成過程中斷，請稍後再試。"
            }
        except json.JSONDecodeError as e:
            print(f"AI 回傳 JSON 解析失敗: {str(e)}")
            return {
                "title": f"格式錯誤 ({request.genre})",
                "full_content": "AI 回傳格式異常，請稍後再試。"
            }
        except Exception as e:
            print(f"AI 生成失敗: {str(e)}")
            return {
                "title": f"時空亂流中的殘片 ({request.genre})",
                "full_content": f"生成時遇到一點混亂。錯誤訊息: {str(e)}"
            }

# 初始化服務實例
ai_service = AIService()
