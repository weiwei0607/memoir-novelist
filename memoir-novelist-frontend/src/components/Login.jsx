import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { signInWithGoogle, auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmail = async () => {
    if (!email || !password) return setError('請填入信箱與密碼');
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      const msg = {
        'auth/user-not-found':     '帳號不存在',
        'auth/wrong-password':     '密碼錯誤',
        'auth/invalid-credential': '信箱或密碼錯誤',
        'auth/email-already-in-use': '此信箱已被註冊',
        'auth/weak-password':      '密碼至少需要 6 個字元',
        'auth/invalid-email':      '信箱格式錯誤',
      };
      setError(msg[err.code] || '登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch {
      setError('匿名登入失敗');
    } finally {
      setLoading(false);
    }
  };

  // 浮動粒子裝飾
  const particles = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center font-serif"
      style={{ background: 'linear-gradient(135deg, #1c1917 0%, #292524 40%, #3b2f2a 60%, #1c1917 100%)' }}>

      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-stone-800/40 rounded-full blur-3xl" />
      </div>

      {/* Floating particles */}
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-amber-600/40 rounded-full pointer-events-none"
          style={{
            left: `${10 + (i * 7.3) % 80}%`,
            top: `${5 + (i * 11.7) % 85}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Card */}
      <motion.div
        className="relative w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="rounded-3xl border border-stone-700/60 p-12 overflow-hidden"
          style={{
            background: 'rgba(28, 25, 23, 0.85)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(180,120,60,0.08)',
          }}
        >
          {/* Logo */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl flex items-center justify-center text-white shadow-2xl mx-auto mb-6">
              <BookOpen size={32} />
            </div>
            <h1 className="text-3xl font-bold text-stone-100 mb-2">回憶小說家</h1>
            <p className="text-stone-500 italic text-sm">將你的日記，煉成一篇故事</p>
          </motion.div>

          {/* Form */}
          <motion.div
            className="space-y-3 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <input
              type="email"
              placeholder="電子郵件"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-stone-800/60 border border-stone-700 rounded-xl text-stone-200 text-sm placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-700 transition-all"
            />
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="密碼"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEmail()}
                className="w-full px-4 py-3 bg-stone-800/60 border border-stone-700 rounded-xl text-stone-200 text-sm placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-700 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors p-1"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  className="text-red-400 text-xs text-center font-bold"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              onClick={handleEmail}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-700 to-amber-900 text-white rounded-xl font-bold text-sm hover:from-amber-600 hover:to-amber-800 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-900/30"
            >
              {loading ? '請稍候...' : (isRegister ? '註冊帳號' : '登入')}
            </button>

            <p className="text-center text-stone-600 text-xs">
              {isRegister ? '已有帳號？' : '還沒有帳號？'}
              <button
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="text-amber-500 font-bold ml-1 hover:text-amber-400 transition-colors"
              >
                {isRegister ? '登入' : '免費註冊'}
              </button>
            </p>
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-stone-700" />
            <span className="text-stone-600 text-xs">或</span>
            <div className="flex-1 h-px bg-stone-700" />
          </div>

          {/* Social */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full py-3 border border-stone-700 rounded-xl font-bold text-sm text-stone-300 hover:bg-stone-800 hover:border-stone-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 hover:scale-[1.01]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>使用 Google 登入</span>
            </button>
            <button
              onClick={handleAnonymous}
              disabled={loading}
              className="w-full py-3 text-stone-600 text-xs hover:text-stone-400 transition-colors disabled:opacity-50"
            >
              不想註冊，先試用看看 →
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
