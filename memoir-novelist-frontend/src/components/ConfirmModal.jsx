import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

/**
 * 自訂確認 Dialog，取代 window.confirm()
 * Props:
 *   open: boolean
 *   title: string
 *   message: string
 *   confirmLabel?: string (default: '確認刪除')
 *   cancelLabel?: string  (default: '取消')
 *   onConfirm: () => void
 *   onCancel: () => void
 *   danger?: boolean      (default: true)
 */
export default function ConfirmModal({
  open,
  title = '確認操作',
  message,
  confirmLabel = '確認刪除',
  cancelLabel = '取消',
  onConfirm,
  onCancel,
  danger = true,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl border border-stone-100 p-8 w-full max-w-sm"
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 ${danger ? 'bg-red-50' : 'bg-amber-50'}`}>
              <AlertTriangle size={28} className={danger ? 'text-red-500' : 'text-amber-500'} />
            </div>

            <h3 className="text-xl font-bold text-stone-900 text-center mb-2">{title}</h3>
            {message && (
              <p className="text-stone-500 text-sm text-center mb-8 leading-relaxed">{message}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  danger
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200'
                    : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-200'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
