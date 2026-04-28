import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchDiaries, fetchNovels, addDiary, generateNovel, deleteDiary, deleteNovel, fetchStreak } from './api';
import Reader from './components/Reader';
import Alchemist from './components/Alchemist';
import Login from './components/Login';
import ConfirmModal from './components/ConfirmModal';
import MemberCard from './components/MemberCard';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  History,
  PenTool,
  Wand2,
  BookOpen,
  Plus,
  Sparkles,
  Trash2,
  AlertCircle,
  CheckCircle,
  Library,
  Flame,
} from 'lucide-react';

// ─── Toast ───────────────────────────────────────────────────────────────────
const Toast = memo(function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      className={`fixed bottom-8 left-1/2 z-50 flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-xl text-white text-sm font-bold ${
        type === 'error' ? 'bg-red-600' : 'bg-stone-800'
      }`}
      style={{ x: '-50%' }}
      initial={{ y: 80, opacity: 0, scale: 0.92 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 40, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
      <span>{message}</span>
    </motion.div>
  );
});

// ─── Nav Tooltip ──────────────────────────────────────────────────────────────
const NavButton = memo(function NavButton({ icon, label, active, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div className="relative flex items-center">
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`p-3 rounded-xl transition-all duration-200 ${
          active ? 'bg-stone-800 text-amber-400' : 'text-stone-500 hover:text-stone-200 hover:bg-stone-800/50'
        }`}
      >
        {icon}
      </button>
      <AnimatePresence>
        {hover && (
          <motion.div
            className="absolute left-14 bg-stone-800 text-stone-100 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none z-30 shadow-xl"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
          >
            {label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-stone-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ─── Genre Color Map ──────────────────────────────────────────────────────────
const genreColor = {
  '古裝仙俠': 'bg-red-800',
  '星際科幻': 'bg-blue-800',
  '賽博龐克': 'bg-purple-800',
  '克蘇魯':   'bg-green-900',
  '現代都會': 'bg-stone-700',
  '青春校園': 'bg-orange-700',
};

// ─── Empty Bookcase ───────────────────────────────────────────────────────────
const EmptyBookcase = memo(function EmptyBookcase({ onGoAlchemist }) {
  return (
    <motion.div
      className="col-span-full py-24 flex flex-col items-center justify-center gap-6 border-2 border-dashed border-stone-200 rounded-3xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      >
        <Library size={56} className="text-stone-300" />
      </motion.div>
      <div className="text-center">
        <p className="text-stone-400 font-bold text-lg mb-1">書架還是空的</p>
        <p className="text-stone-400 text-sm">前往煉金室，將你的日記碎片化為故事吧</p>
      </div>
      <button
        onClick={onGoAlchemist}
        className="flex items-center gap-2 bg-gradient-to-r from-amber-700 to-stone-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:scale-[1.03] active:scale-[0.97] transition-transform shadow-lg shadow-amber-900/20"
      >
        <Wand2 size={16} />
        前往煉金室
      </button>
    </motion.div>
  );
});

// ─── Diary Item (memoized) ────────────────────────────────────────────────────
const DiaryItem = memo(function DiaryItem({ diary, onDelete }) {
  const dateStr = useMemo(() => new Date(diary.created_at).toLocaleString(), [diary.created_at]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group relative bg-white p-6 rounded-2xl border border-stone-200 hover:border-stone-300 transition-colors"
    >
      <button
        onClick={(e) => onDelete(e, diary.id)}
        className="absolute top-4 right-4 p-2 rounded-full text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 size={16} />
      </button>
      <span className="text-[10px] text-stone-400 mb-2 block text-left">
        {dateStr}
      </span>
      <p className="text-stone-700 italic text-lg text-left">「{diary.content}」</p>
    </motion.div>
  );
});

// ─── Novel Card (memoized) ────────────────────────────────────────────────────
const NovelCard = memo(function NovelCard({ novel, index, onClick, onDelete }) {
  const dateStr = useMemo(() => new Date(novel.created_at).toLocaleDateString(), [novel.created_at]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      onClick={() => onClick(novel)}
      className="relative bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1.5 group cursor-pointer"
    >
      <div className={`h-4 w-full ${genreColor[novel.genre] || 'bg-stone-800'}`} />
      <button
        onClick={(e) => onDelete(e, novel.id)}
        className="absolute top-6 right-6 p-2 rounded-full text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10"
      >
        <Trash2 size={16} />
      </button>
      <div className="p-8">
        <div className="flex justify-between mb-4">
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
            {novel.genre} · {novel.user_role}
          </span>
          <span className="text-[10px] text-stone-400">
            {dateStr}
          </span>
        </div>
        <h3 className="text-2xl font-bold mb-4 text-left">{novel.title}</h3>
        <p className="text-stone-600 line-clamp-4 text-sm italic text-left">{novel.full_content}</p>
        <div className="mt-8 text-amber-700 font-bold text-sm text-left group-hover:translate-x-1 transition-transform">
          翻閱篇章 →
        </div>
      </div>
    </motion.article>
  );
});

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(undefined);
  const [diaries, setDiaries] = useState([]);
  const [novels, setNovels] = useState([]);
  const [newDiaryText, setNewDiaryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('bookcase');
  const [readingNovel, setReadingNovel] = useState(null);
  const [toast, setToast] = useState(null);
  const toastIdRef = useRef(0);

  const [genre, setGenre] = useState('現代都會');
  const [userRole, setUserRole] = useState('主角');
  const [protagonistName, setProtagonistName] = useState('');
  const [continuityMode, setContinuityMode] = useState(false);
  const [selectedDiaryIds, setSelectedDiaryIds] = useState([]);

  // 確認 Modal 狀態
  const [confirmModal, setConfirmModal] = useState({
    open: false, title: '', message: '', onConfirm: null,
  });
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0, total_entries: 0 });

  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastIdRef.current;
    setToast({ message, type, id });
  }, []);

  const showConfirm = useCallback(({ title, message, onConfirm }) => {
    setConfirmModal({ open: true, title, message, onConfirm });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, open: false, onConfirm: null }));
  }, []);

  // ESC 關閉閱讀器
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setReadingNovel(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // 平行載入資料 + 錯誤分離
  const loadData = useCallback(async () => {
    try {
      const [dRes, nRes, sRes] = await Promise.all([
        fetchDiaries().catch(() => ({ data: [] })),
        fetchNovels().catch(() => ({ data: [] })),
        fetchStreak().catch(() => ({ data: { current_streak: 0, longest_streak: 0, total_entries: 0 } })),
      ]);
      setDiaries(dRes.data.slice().reverse());
      setNovels(nRes.data.slice().reverse());
      setStreak(sRes.data);
    } catch {
      showToast('資料載入失敗，請重新整理', 'error');
    }
  }, [showToast]);

  const handleAddDiary = useCallback(async () => {
    if (!newDiaryText.trim()) return;
    try {
      await addDiary(newDiaryText);
      setNewDiaryText('');
      loadData();
      showToast('記憶已封存');
    } catch {
      showToast('封存失敗，請稍後再試', 'error');
    }
  }, [newDiaryText, loadData, showToast]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadData();
    });
    return unsub;
  }, [loadData]);

  const handleDeleteDiary = useCallback((e, id) => {
    e.stopPropagation();
    showConfirm({
      title: '刪除日記',
      message: '這則記憶將永久消失，確定要刪除嗎？',
      onConfirm: async () => {
        closeConfirm();
        try {
          await deleteDiary(id);
          setDiaries(prev => prev.filter(d => d.id !== id));
          setSelectedDiaryIds(prev => prev.filter(i => i !== id));
          showToast('日記已刪除');
        } catch {
          showToast('刪除失敗', 'error');
        }
      },
    });
  }, [showConfirm, closeConfirm, showToast]);

  const handleDeleteNovel = useCallback((e, id) => {
    if (e?.stopPropagation) e.stopPropagation();
    showConfirm({
      title: '刪除故事',
      message: '這篇由記憶煉成的故事將永久消失，確定要刪除嗎？',
      onConfirm: async () => {
        closeConfirm();
        try {
          await deleteNovel(id);
          setNovels(prev => prev.filter(n => n.id !== id));
          if (readingNovel?.id === id) setReadingNovel(null);
          showToast('故事已刪除');
        } catch {
          showToast('刪除失敗', 'error');
        }
      },
    });
  }, [showConfirm, closeConfirm, showToast, readingNovel]);

  const handleGenerate = useCallback(async () => {
    if (selectedDiaryIds.length === 0) return showToast('請先選取日記素材', 'error');
    setLoading(true);
    try {
      const res = await generateNovel({
        diary_ids: selectedDiaryIds,
        genre,
        user_role: userRole,
        protagonist_name: protagonistName || '無名氏',
        continuity_mode: continuityMode,
      });
      setNovels(prev => [res.data, ...prev]);
      setActiveTab('bookcase');
      setReadingNovel(res.data);
      showToast('煉金成功，故事誕生了');
    } catch (err) {
      const msg = err?.response?.data?.detail || '生成失敗，請稍後再試';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDiaryIds, genre, userRole, protagonistName, showToast]);

  const toggleDiarySelection = useCallback((id) => {
    setSelectedDiaryIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  // ── Loading splash ──
  if (user === undefined) return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center">
      <motion.div
        className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );

  if (!user) return <Login />;

  // ── Tab page variants ──
  const pageVariants = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit:    { opacity: 0, y: -10, transition: { duration: 0.18 } },
  };

  const headerTitles = {
    bookcase:  { title: '回憶書架',  sub: '珍藏著由你的歲月碎片編織而成的故事。' },
    diaries:   { title: '靈感筆記',  sub: '記下那些轉瞬即逝的瞬間，它們是煉金的最佳素材。' },
    alchemist: { title: '煉金法陣',  sub: '在此將破碎的記憶，重塑為璀璨的多重宇宙。' },
  };

  return (
    <div className="min-h-screen bg-stone-100 flex font-serif selection:bg-amber-100 selection:text-amber-900">

      {/* ── Sidebar ── */}
      <nav className="w-20 bg-stone-900 text-stone-400 flex flex-col items-center py-8 space-y-6 fixed h-full z-20">
        <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-900/30 mb-2">
          <BookOpen size={26} />
        </div>
        <NavButton
          icon={<History size={22} />}
          label="回憶書架"
          active={activeTab === 'bookcase'}
          onClick={() => setActiveTab('bookcase')}
        />
        <NavButton
          icon={<PenTool size={22} />}
          label="靈感筆記"
          active={activeTab === 'diaries'}
          onClick={() => setActiveTab('diaries')}
        />
        <NavButton
          icon={<Wand2 size={22} />}
          label="煉金法陣"
          active={activeTab === 'alchemist'}
          onClick={() => setActiveTab('alchemist')}
        />
        <div className="flex-1" />
        <MemberCard
          user={user}
          streak={streak}
          entryCount={diaries.length}
          novelCount={novels.length}
        />
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1 ml-20 p-10 overflow-y-auto min-h-screen">
        {/* Header */}
        <AnimatePresence mode="wait">
          <motion.header
            key={activeTab + '-header'}
            className="mb-10"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-stone-800 mb-2">
              {headerTitles[activeTab]?.title}
            </h1>
            <p className="text-stone-500 text-lg italic text-left">
              {headerTitles[activeTab]?.sub}
            </p>
            {/* Streak Display */}
            {streak.current_streak > 0 && (
              <div className="mt-4 inline-flex items-center gap-3 bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl">
                <Flame size={20} className="text-orange-500" />
                <span className="text-sm font-bold text-orange-700">
                  連續寫作 {streak.current_streak} 天
                </span>
                <span className="text-xs text-orange-400">
                  最高紀錄: {streak.longest_streak} 天 · 總共 {streak.total_entries} 篇日記
                </span>
              </div>
            )}
          </motion.header>
        </AnimatePresence>

        {/* Tab Pages */}
        <AnimatePresence mode="wait">

          {/* ── BOOKCASE ── */}
          {activeTab === 'bookcase' && (
            <motion.div
              key="bookcase"
              variants={pageVariants}
              initial="initial" animate="animate" exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {novels.length === 0 ? (
                <EmptyBookcase onGoAlchemist={() => setActiveTab('alchemist')} />
              ) : novels.map((novel, i) => (
                <NovelCard
                  key={novel.id}
                  novel={novel}
                  index={i}
                  onClick={setReadingNovel}
                  onDelete={handleDeleteNovel}
                />
              ))}
            </motion.div>
          )}

          {/* ── DIARIES ── */}
          {activeTab === 'diaries' && (
            <motion.div
              key="diaries"
              variants={pageVariants}
              initial="initial" animate="animate" exit="exit"
              className="max-w-4xl mx-auto"
            >
              {/* Write Area */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <Sparkles size={20} className="text-amber-500" />
                  <span>撰寫今日碎片</span>
                </h2>
                <textarea
                  className="w-full h-32 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-stone-700 leading-relaxed mb-2 resize-none"
                  placeholder="在此寫下那些瞬間...（Ctrl+Enter 快速封存）"
                  value={newDiaryText}
                  onChange={(e) => setNewDiaryText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddDiary();
                  }}
                />
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${newDiaryText.length > 500 ? 'text-amber-600 font-bold' : 'text-stone-400'}`}>
                    {newDiaryText.length} 字
                  </span>
                  <button
                    onClick={handleAddDiary}
                    className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors flex items-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus size={18} /><span>封存記憶</span>
                  </button>
                </div>
              </div>

              {/* Diary List */}
              <motion.div className="space-y-4">
                <AnimatePresence>
                  {diaries.map((diary) => (
                    <DiaryItem
                      key={diary.id}
                      diary={diary}
                      onDelete={handleDeleteDiary}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}

          {/* ── ALCHEMIST ── */}
          {activeTab === 'alchemist' && (
            <motion.div
              key="alchemist-tab"
              variants={pageVariants}
              initial="initial" animate="animate" exit="exit"
            >
              <Alchemist
                diaries={diaries}
                genre={genre} setGenre={setGenre}
                userRole={userRole} setUserRole={setUserRole}
                protagonistName={protagonistName} setProtagonistName={setProtagonistName}
                selectedDiaryIds={selectedDiaryIds}
                toggleDiarySelection={toggleDiarySelection}
                setSelectedDiaryIds={setSelectedDiaryIds}
                generateNovel={handleGenerate}
                loading={loading}
                continuityMode={continuityMode} setContinuityMode={setContinuityMode}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Reader Modal ── */}
      <Reader
        novel={readingNovel}
        onClose={() => setReadingNovel(null)}
        onDelete={(id) => handleDeleteNovel(null, id)}
      />

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
