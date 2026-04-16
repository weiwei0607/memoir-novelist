import React, { useState, useEffect } from 'react';
import { fetchDiaries, fetchNovels, addDiary, generateNovel, deleteDiary, deleteNovel } from './api';
import Reader from './components/Reader';
import Alchemist from './components/Alchemist';
import Login from './components/Login';
import { auth, logout } from './firebase';
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
  LogOut
} from 'lucide-react';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-xl text-white text-sm font-bold transition-all ${type === 'error' ? 'bg-red-600' : 'bg-stone-800'}`}>
      {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
      <span>{message}</span>
    </div>
  );
}

const genreColor = {
  '古裝仙俠': 'bg-red-800',
  '星際科幻': 'bg-blue-800',
  '賽博龐克': 'bg-purple-800',
  '克蘇魯': 'bg-green-900',
};

function App() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = 未登入
  const [diaries, setDiaries] = useState([]);
  const [novels, setNovels] = useState([]);
  const [newDiaryText, setNewDiaryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('bookcase');
  const [readingNovel, setReadingNovel] = useState(null);
  const [toast, setToast] = useState(null);

  const [genre, setGenre] = useState('現代都會');
  const [userRole, setUserRole] = useState('主角');
  const [protagonistName, setProtagonistName] = useState('');
  const [selectedDiaryIds, setSelectedDiaryIds] = useState([]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadData();
    });
    return unsub;
  }, []);

  const loadData = async () => {
    try {
      const dRes = await fetchDiaries();
      const nRes = await fetchNovels();
      setDiaries(dRes.data.slice().reverse());
      setNovels(nRes.data.slice().reverse());
    } catch (err) {
      showToast('資料載入失敗，請重新整理', 'error');
    }
  };

  const handleAddDiary = async () => {
    if (!newDiaryText.trim()) return;
    try {
      await addDiary(newDiaryText);
      setNewDiaryText('');
      loadData();
      showToast('記憶已封存');
    } catch (err) {
      showToast('封存失敗，請稍後再試', 'error');
    }
  };

  const handleDeleteDiary = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('確定刪除這則日記？')) return;
    try {
      await deleteDiary(id);
      setDiaries(prev => prev.filter(d => d.id !== id));
      setSelectedDiaryIds(prev => prev.filter(i => i !== id));
      showToast('日記已刪除');
    } catch (err) {
      showToast('刪除失敗', 'error');
    }
  };

  const handleDeleteNovel = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('確定刪除這篇故事？')) return;
    try {
      await deleteNovel(id);
      setNovels(prev => prev.filter(n => n.id !== id));
      if (readingNovel?.id === id) setReadingNovel(null);
      showToast('故事已刪除');
    } catch (err) {
      showToast('刪除失敗', 'error');
    }
  };

  const handleGenerate = async () => {
    if (selectedDiaryIds.length === 0) return showToast('請先選取日記素材', 'error');
    setLoading(true);
    try {
      const res = await generateNovel({
        diary_ids: selectedDiaryIds,
        genre,
        user_role: userRole,
        protagonist_name: protagonistName || '無名氏'
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
  };

  if (user === undefined) return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-stone-100 flex font-serif selection:bg-amber-100 selection:text-amber-900">
      <nav className="w-20 bg-stone-900 text-stone-400 flex flex-col items-center py-8 space-y-8 fixed h-full z-20">
        <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-900/20 mb-4">
          <BookOpen size={28} />
        </div>
        <button onClick={() => setActiveTab('bookcase')} className={`p-3 rounded-xl transition-all ${activeTab === 'bookcase' ? 'bg-stone-800 text-amber-500' : 'hover:text-stone-200'}`}><History size={24} /></button>
        <button onClick={() => setActiveTab('diaries')} className={`p-3 rounded-xl transition-all ${activeTab === 'diaries' ? 'bg-stone-800 text-amber-500' : 'hover:text-stone-200'}`}><PenTool size={24} /></button>
        <button onClick={() => setActiveTab('alchemist')} className={`p-3 rounded-xl transition-all ${activeTab === 'alchemist' ? 'bg-stone-800 text-amber-500' : 'hover:text-stone-200'}`}><Wand2 size={24} /></button>
        <div className="flex-1" />
        <button onClick={logout} className="p-3 rounded-xl hover:text-red-400 transition-all mb-2">
          <LogOut size={20} />
        </button>
      </nav>

      <main className="flex-1 ml-20 p-10 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-stone-800 mb-2">
            {activeTab === 'bookcase' && '回憶書架'}
            {activeTab === 'diaries' && '靈感筆記'}
            {activeTab === 'alchemist' && '煉金法陣'}
          </h1>
          <p className="text-stone-500 text-lg italic text-left">
            {activeTab === 'bookcase' && '珍藏著由你的歲月碎片編織而成的故事。'}
            {activeTab === 'diaries' && '記下那些轉瞬即逝的瞬間，它們是煉金的最佳素材。'}
            {activeTab === 'alchemist' && '在此將破碎的記憶，重塑為璀璨的多重宇宙。'}
          </p>
        </header>

        {activeTab === 'bookcase' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {novels.length === 0 && (
              <div className="col-span-full py-24 text-center border-2 border-dashed border-stone-300 rounded-3xl text-stone-400">
                目前書架上空空如也，快去煉金室吧。
              </div>
            )}
            {novels.map(novel => (
              <article key={novel.id} onClick={() => setReadingNovel(novel)} className="relative bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer">
                <div className={`h-4 w-full ${genreColor[novel.genre] || 'bg-stone-800'}`}></div>
                <button
                  onClick={(e) => handleDeleteNovel(e, novel.id)}
                  className="absolute top-6 right-6 p-2 rounded-full text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <Trash2 size={16} />
                </button>
                <div className="p-8">
                  <div className="flex justify-between mb-4">
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">{novel.genre} · {novel.user_role}</span>
                    <span className="text-[10px] text-stone-400">{new Date(novel.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-left">{novel.title}</h3>
                  <p className="text-stone-600 line-clamp-4 text-sm italic text-left">{novel.full_content}</p>
                  <div className="mt-8 text-amber-700 font-bold text-sm text-left">翻閱篇章 →</div>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === 'diaries' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Sparkles size={20} className="text-amber-500" />
                <span>撰寫今日碎片</span>
              </h2>
              <textarea
                className="w-full h-32 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-stone-700 leading-relaxed mb-4 resize-none"
                placeholder="在此寫下那些瞬間..."
                value={newDiaryText}
                onChange={(e) => setNewDiaryText(e.target.value)}
              />
              <div className="flex justify-end">
                <button onClick={handleAddDiary} className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors flex items-center space-x-2">
                  <Plus size={20} /><span>封存記憶</span>
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {diaries.map(diary => (
                <div key={diary.id} className="group relative bg-white p-6 rounded-2xl border border-stone-200">
                  <button
                    onClick={(e) => handleDeleteDiary(e, diary.id)}
                    className="absolute top-4 right-4 p-2 rounded-full text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <span className="text-[10px] text-stone-400 mb-2 block text-left">{new Date(diary.created_at).toLocaleString()}</span>
                  <p className="text-stone-700 italic text-lg text-left">「{diary.content}」</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'alchemist' && (
          <Alchemist
            diaries={diaries} genre={genre} setGenre={setGenre}
            userRole={userRole} setUserRole={setUserRole}
            protagonistName={protagonistName} setProtagonistName={setProtagonistName}
            selectedDiaryIds={selectedDiaryIds}
            toggleDiarySelection={(id) => setSelectedDiaryIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
            generateNovel={handleGenerate} loading={loading}
          />
        )}

        <Reader
          novel={readingNovel}
          onClose={() => setReadingNovel(null)}
          onDelete={(id) => { handleDeleteNovel({ stopPropagation: () => {} }, id); }}
        />
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
