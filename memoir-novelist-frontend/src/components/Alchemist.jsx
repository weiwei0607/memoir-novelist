import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, User as UserIcon, LayoutDashboard, CheckCircle, Link2 } from 'lucide-react';

const GENRES   = ['現代都會', '古裝仙俠', '星際科幻', '青春校園', '賽博龐克', '克蘇魯'];
const ROLES    = ['主角', '配角', '反派', '路人'];

export default function Alchemist({
  diaries, genre, setGenre, userRole, setUserRole,
  protagonistName, setProtagonistName, selectedDiaryIds,
  toggleDiarySelection, setSelectedDiaryIds, generateNovel, loading,
  continuityMode, setContinuityMode,
}) {
  const allSelected = diaries.length > 0 && selectedDiaryIds.length === diaries.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedDiaryIds([]);
    } else {
      setSelectedDiaryIds(diaries.map(d => d.id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">

      {/* ── Left Panel: Settings ── */}
      <div className="md:w-1/2 bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
        <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3 text-amber-700">
          <Wand2 size={24} />
          <span>設定故事設定集</span>
        </h2>

        <div className="space-y-6">
          {/* Genre */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 mb-3 uppercase tracking-[0.2em]">
              世界觀 (風格)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GENRES.map(g => (
                <motion.button
                  key={g}
                  onClick={() => setGenre(g)}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl text-xs font-bold border-2 transition-all ${
                    genre === g
                      ? 'border-amber-600 bg-amber-50 text-amber-700 shadow-sm'
                      : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-300'
                  }`}
                >
                  {g}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 mb-3 uppercase tracking-[0.2em]">
              你的身份
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ROLES.map(r => (
                <motion.button
                  key={r}
                  onClick={() => setUserRole(r)}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl text-xs font-bold border-2 transition-all ${
                    userRole === r
                      ? 'border-amber-600 bg-amber-50 text-amber-700 shadow-sm'
                      : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-300'
                  }`}
                >
                  {r}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Continuity Mode */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 mb-3 uppercase tracking-[0.2em]">
              章節連續性
            </label>
            <motion.button
              onClick={() => setContinuityMode(!continuityMode)}
              whileTap={{ scale: 0.95 }}
              className={`w-full p-3 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                continuityMode
                  ? 'border-amber-600 bg-amber-50 text-amber-700 shadow-sm'
                  : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-300'
              }`}
            >
              <Link2 size={14} />
              {continuityMode ? '開啟連續章節模式' : '獨立短篇模式'}
            </motion.button>
            <p className="text-[10px] text-stone-400 mt-2">
              {continuityMode ? 'AI 會參考前幾章的內容，讓故事連貫發展' : '每次生成獨立短篇，不參考之前的故事'}
            </p>
          </div>

          {/* Protagonist Name */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 mb-3 uppercase tracking-[0.2em]">
              主角姓名
            </label>
            <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl p-3 px-4 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-300 transition-all">
              <UserIcon size={18} className="text-stone-400 mr-3 shrink-0" />
              <input
                type="text"
                className="bg-transparent focus:outline-none w-full text-stone-700 text-sm"
                placeholder="你的名字..."
                value={protagonistName}
                onChange={(e) => setProtagonistName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={generateNovel}
          disabled={loading}
          whileTap={!loading ? { scale: 0.97 } : {}}
          whileHover={!loading ? { scale: 1.02 } : {}}
          className={`w-full mt-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 shadow-xl transition-all ${
            loading
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-700 to-stone-900 text-white shadow-amber-900/20'
          }`}
        >
          {loading ? (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="flex items-center gap-3"
            >
              <motion.div
                className="w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              正在注入靈魂，煉金中...
            </motion.span>
          ) : (
            <>
              <Wand2 size={20} />
              <span>啟動回憶煉金</span>
            </>
          )}
        </motion.button>
      </div>

      {/* ── Right Panel: Diary Selection ── */}
      <div className="flex-1 min-w-0">
        {/* Header with Select All */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center space-x-3 text-stone-700">
            <LayoutDashboard size={24} className="text-stone-300" />
            <span>
              選取記憶素材
              {selectedDiaryIds.length > 0 && (
                <motion.span
                  key={selectedDiaryIds.length}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-amber-600 text-white text-xs rounded-full font-bold"
                >
                  {selectedDiaryIds.length}
                </motion.span>
              )}
            </span>
          </h2>

          {diaries.length > 0 && (
            <button
              onClick={handleSelectAll}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                allSelected
                  ? 'border-amber-600 text-amber-700 bg-amber-50 hover:bg-amber-100'
                  : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              {allSelected ? '清空全選' : '全選素材'}
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-hide">
          {diaries.length === 0 && (
            <p className="text-stone-400 italic text-center py-12">目前沒有日記可選，先去靈感筆記記錄吧...</p>
          )}
          <AnimatePresence>
            {diaries.map((diary, i) => {
              const selected = selectedDiaryIds.includes(diary.id);
              return (
                <motion.div
                  key={diary.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => toggleDiarySelection(diary.id)}
                  className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selected
                      ? 'border-amber-500 bg-white shadow-md shadow-amber-100'
                      : 'border-transparent bg-stone-50 text-stone-500 hover:bg-white hover:border-stone-200'
                  }`}
                >
                  {selected && (
                    <motion.div
                      className="absolute top-3 right-3"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    >
                      <CheckCircle size={18} className="text-amber-500" />
                    </motion.div>
                  )}
                  <p className="line-clamp-2 text-sm italic text-left pr-6">「{diary.content}」</p>
                  <span className="text-[10px] uppercase mt-2 block opacity-40 text-left">
                    {new Date(diary.created_at).toLocaleDateString()}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
