import React, { useState } from 'react';
import { Plus, Copy, Check, Trash2 } from 'lucide-react';

export default function Reader({ novel, onClose, onDelete }) {
  const [copied, setCopied] = useState(false);

  if (!novel) return null;

  const handleCopy = () => {
    const text = `${novel.title}\n\n${novel.full_content}\n\n— 由回憶小說家生成`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (!window.confirm('確定刪除這篇故事？')) return;
    onDelete(novel.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6 md:p-12">
      <div className="bg-[#fcfaf7] w-full max-w-4xl max-h-full rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border border-stone-200">

        <div className="absolute top-8 right-8 flex items-center space-x-2 z-10">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full text-stone-500 hover:bg-stone-100 transition-colors text-xs font-bold"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            <span>{copied ? '已複製' : '複製全文'}</span>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"
          >
            <Plus size={32} className="rotate-45" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 md:p-24 scrollbar-hide">
          <div className="max-w-2xl mx-auto">
            <header className="mb-16 text-center">
              <span className="text-amber-700 font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block">
                —— {novel.genre} · {novel.user_role} ——
              </span>
              <h2 className="text-5xl font-bold text-stone-900 mb-8 leading-tight tracking-tight">
                {novel.title}
              </h2>
              <div className="h-[2px] w-12 bg-stone-200 mx-auto"></div>
            </header>

            <div className="text-stone-800 text-xl leading-[2] space-y-10 whitespace-pre-wrap font-serif first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-4 first-letter:mt-2 first-letter:text-amber-800">
              {novel.full_content}
            </div>

            <footer className="mt-24 pt-12 border-t border-stone-100 text-center">
              <p className="text-stone-400 italic text-xs mb-2 uppercase tracking-widest">
                此篇章由 {novel.protagonist_name || '無名氏'} 的記憶煉金而成
              </p>
              <p className="text-stone-300 text-[10px]">
                {new Date(novel.created_at).toLocaleString()}
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
