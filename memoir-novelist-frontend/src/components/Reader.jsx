import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Trash2, X, Minus, Plus, FileText } from 'lucide-react';

// 字體大小限制
const FONT_SIZES = ['text-base', 'text-lg', 'text-xl', 'text-2xl'];
const FONT_LABELS = ['小', '中', '大', '特大'];

export default function Reader({ novel, onClose, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [fontIdx, setFontIdx] = useState(1); // 預設 text-lg

  // ESC 關閉（父層 App 也有，雙重保險）
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleCopy = () => {
    const text = `${novel.title}\n\n${novel.full_content}\n\n—由回憶小說家生成`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    // 刪除由父層 ConfirmModal 接手，此處直接呼叫
    onDelete(novel.id);
  };

  return (
    <AnimatePresence>
      {novel && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-stone-900/85 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            className="relative bg-[#fcfaf7] w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-200"
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          >
            {/* Toolbar */}
            <div className="absolute top-6 right-6 flex items-center space-x-1 z-10">
              {/* Font size controls */}
              <div className="flex items-center gap-1 bg-stone-100 rounded-full px-2 py-1 mr-2">
                <button
                  onClick={() => setFontIdx(i => Math.max(0, i - 1))}
                  disabled={fontIdx === 0}
                  className="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-stone-800 disabled:opacity-30 transition-colors"
                >
                  <Minus size={13} />
                </button>
                <span className="text-[10px] font-bold text-stone-500 w-4 text-center">
                  {FONT_LABELS[fontIdx]}
                </span>
                <button
                  onClick={() => setFontIdx(i => Math.min(FONT_SIZES.length - 1, i + 1))}
                  disabled={fontIdx === FONT_SIZES.length - 1}
                  className="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-stone-800 disabled:opacity-30 transition-colors"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Copy */}
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-full text-stone-500 hover:bg-stone-100 transition-colors text-xs font-bold"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-green-600">
                      <Check size={14} /> 已複製
                    </motion.span>
                  ) : (
                    <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                      <Copy size={14} /> 複製
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* PDF Export */}
              <button
                onClick={() => {
                  window.open(`/api/novels/${novel.id}/pdf`, '_blank');
                }}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-full text-stone-500 hover:bg-stone-100 transition-colors text-xs font-bold"
              >
                <FileText size={14} /> PDF
              </button>

              {/* Delete */}
              <button
                onClick={handleDelete}
                className="p-2 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-10 md:p-20 scrollbar-hide">
              <div className="max-w-2xl mx-auto">
                {/* Title area */}
                <header className="mb-16 text-center">
                  <span className="text-amber-700 font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block">
                    —— {novel.genre} · {novel.user_role} ——
                  </span>
                  <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-8 leading-tight tracking-tight">
                    {novel.title}
                  </h2>
                  <div className="h-[2px] w-12 bg-stone-200 mx-auto" />
                </header>

                {/* Body */}
                <div
                  className={`text-stone-800 leading-[2.1] space-y-10 whitespace-pre-wrap font-serif transition-all duration-200 ${FONT_SIZES[fontIdx]} first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-4 first-letter:mt-2 first-letter:text-amber-800`}
                >
                  {novel.full_content}
                </div>

                {/* Footer */}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
