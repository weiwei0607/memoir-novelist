import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { signInWithGoogle, auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        'auth/user-not-found': '帳號不存在',
        'auth/wrong-password': '密碼錯誤',
        'auth/email-already-in-use': '此信箱已被註冊',
        'auth/weak-password': '密碼至少需要 6 個字元',
        'auth/invalid-email': '信箱格式錯誤',
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

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center font-serif">
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-12 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-6">
            <BookOpen size={32} />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">回憶小說家</h1>
          <p className="text-stone-400 italic text-sm">將你的日記，煉成一篇故事</p>
        </div>

        <div className="space-y-3 mb-6">
          <input
            type="email"
            placeholder="電子郵件"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmail()}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button
            onClick={handleEmail}
            disabled={loading}
            className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            {isRegister ? '註冊' : '登入'}
          </button>
          <p className="text-center text-stone-400 text-xs">
            {isRegister ? '已有帳號？' : '還沒有帳號？'}
            <button onClick={() => setIsRegister(!isRegister)} className="text-amber-600 font-bold ml-1">
              {isRegister ? '登入' : '註冊'}
            </button>
          </p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-stone-300 text-xs">或</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        <div className="space-y-3">
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full py-3 border-2 border-stone-200 rounded-xl font-bold text-sm text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
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
            className="w-full py-3 text-stone-400 text-xs hover:text-stone-600 transition-colors disabled:opacity-50"
          >
            不想註冊，先試用看看 →
          </button>
        </div>
      </div>
    </div>
  );
}
