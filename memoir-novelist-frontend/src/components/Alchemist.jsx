import React from 'react';
import { Wand2, User as UserIcon, LayoutDashboard, Plus } from 'lucide-react';

export default function Alchemist({ 
  diaries, genre, setGenre, userRole, setUserRole, 
  protagonistName, setProtagonistName, selectedDiaryIds, 
  toggleDiarySelection, generateNovel, loading 
}) {
  return (
    <div className="max-w-6xl mx-auto flex gap-10">
      <div className="w-1/2 bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
        <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3 text-amber-700">
          <Wand2 size={24} />
          <span>設定故事設定集</span>
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-stone-400 mb-3 uppercase tracking-[0.2em]">世界觀 (風格)</label>
            <div className="grid grid-cols-3 gap-2">
              {['現代都會', '古裝仙俠', '星際科幻', '青春校園', '賽博龐克', '克蘇魯'].map(g => (
                <button key={g} onClick={() => setGenre(g)} className={`p-3 rounded-xl text-xs font-bold border-2 transition-all ${genre === g ? 'border-amber-600 bg-amber-50 text-amber-700 shadow-sm' : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-200'}`}>{g}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 mb-3 uppercase tracking-[0.2em]">你的身份</label>
            <div className="grid grid-cols-4 gap-2">
              {['主角', '配角', '反派', '路人'].map(r => (
                <button key={r} onClick={() => setUserRole(r)} className={`p-3 rounded-xl text-xs font-bold border-2 transition-all ${userRole === r ? 'border-amber-600 bg-amber-50 text-amber-700 shadow-sm' : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-200'}`}>{r}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 mb-3 uppercase tracking-[0.2em]">主角姓名</label>
            <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl p-3 px-4">
              <UserIcon size={18} className="text-stone-400 mr-3" />
              <input type="text" className="bg-transparent focus:outline-none w-full text-stone-700 text-sm" placeholder="你的名字..." value={protagonistName} onChange={(e) => setProtagonistName(e.target.value)} />
            </div>
          </div>
        </div>
        <button onClick={generateNovel} disabled={loading} className={`w-full mt-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 shadow-xl transition-all ${loading ? 'bg-stone-300 text-stone-500' : 'bg-gradient-to-r from-amber-700 to-stone-900 text-white hover:scale-[1.02] active:scale-[0.98]'}`}>
          {loading ? <span className="animate-pulse">正在注入靈魂，煉金中...</span> : <><Wand2 size={20} /><span>啟動回憶煉金</span></>}
        </button>
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3 text-stone-700">
          <LayoutDashboard size={24} className="text-stone-300" />
          <span>選取記憶素材 ({selectedDiaryIds.length})</span>
        </h2>
        <div className="space-y-3 h-[500px] overflow-y-auto pr-2">
          {diaries.length === 0 && <p className="text-stone-400 italic">目前沒有日記可選...</p>}
          {diaries.map(diary => (
            <div key={diary.id} onClick={() => toggleDiarySelection(diary.id)} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedDiaryIds.includes(diary.id) ? 'border-amber-600 bg-white shadow-md' : 'border-transparent bg-stone-50 text-stone-500 hover:bg-stone-100'}`}>
              <p className="line-clamp-2 text-sm italic text-left">「{diary.content}」</p>
              <span className="text-[10px] uppercase mt-2 block opacity-40 text-left">{new Date(diary.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
