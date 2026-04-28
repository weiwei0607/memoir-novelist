import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Star, Flame, BookOpen, Wand2, Scroll, Gem,
  LogOut, ChevronUp, ChevronDown, Lock, Unlock, Zap, Trophy
} from 'lucide-react';
import { logout } from '../firebase';

const TIERS = [
  {
    level: 1,
    name: '記憶學徒',
    subtitle: '剛踏入回憶的旅途',
    minEntries: 0,
    color: 'from-stone-400 to-stone-500',
    badgeColor: 'bg-stone-400',
    icon: BookOpen,
    perks: [
      { icon: Wand2, label: '每日煉金 3 次', unlocked: true },
      { icon: BookOpen, label: '基礎風格（3種）', unlocked: true },
      { icon: Lock, label: '連續章節模式', unlocked: false },
      { icon: Lock, label: 'PDF 匯出', unlocked: false },
    ],
  },
  {
    level: 2,
    name: '靈感採集者',
    subtitle: '開始收集靈感的碎片',
    minEntries: 5,
    color: 'from-amber-600 to-amber-700',
    badgeColor: 'bg-amber-600',
    icon: Star,
    perks: [
      { icon: Wand2, label: '每日煉金 5 次', unlocked: true },
      { icon: BookOpen, label: '全部風格解鎖', unlocked: true },
      { icon: Zap, label: '新角色：路人', unlocked: true },
      { icon: Lock, label: 'PDF 匯出', unlocked: false },
    ],
  },
  {
    level: 3,
    name: '故事織匠',
    subtitle: '能將碎片編織成篇章',
    minEntries: 15,
    color: 'from-orange-600 to-red-700',
    badgeColor: 'bg-orange-600',
    icon: Scroll,
    perks: [
      { icon: Wand2, label: '每日煉金 8 次', unlocked: true },
      { icon: BookOpen, label: '全部風格解鎖', unlocked: true },
      { icon: Zap, label: '全部角色解鎖', unlocked: true },
      { icon: Lock, label: 'PDF 匯出', unlocked: false },
    ],
  },
  {
    level: 4,
    name: '夢境鍊金師',
    subtitle: '掌握將夢境化為現實的技法',
    minEntries: 30,
    color: 'from-purple-600 to-pink-700',
    badgeColor: 'bg-purple-600',
    icon: Gem,
    perks: [
      { icon: Wand2, label: '每日煉金 12 次', unlocked: true },
      { icon: BookOpen, label: '全部風格解鎖', unlocked: true },
      { icon: Zap, label: '全部角色解鎖', unlocked: true },
      { icon: Unlock, label: '連續章節模式', unlocked: true },
    ],
  },
  {
    level: 5,
    name: '時空編織者',
    subtitle: '穿越多重宇宙的大師',
    minEntries: 50,
    color: 'from-amber-500 via-orange-500 to-red-600',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-600',
    icon: Crown,
    perks: [
      { icon: Wand2, label: '無限煉金', unlocked: true },
      { icon: BookOpen, label: '全部風格解鎖', unlocked: true },
      { icon: Zap, label: '全部角色解鎖', unlocked: true },
      { icon: Unlock, label: 'PDF 匯出 + 連續模式', unlocked: true },
    ],
  },
];

function getTier(entryCount) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (entryCount >= TIERS[i].minEntries) return TIERS[i];
  }
  return TIERS[0];
}

function getNextTier(entryCount) {
  return TIERS.find(t => t.minEntries > entryCount) || null;
}

export default function MemberCard({ user, streak, entryCount, novelCount }) {
  const [expanded, setExpanded] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const tier = useMemo(() => getTier(entryCount), [entryCount]);
  const nextTier = useMemo(() => getNextTier(entryCount), [entryCount]);

  const progressToNext = nextTier
    ? Math.min(100, ((entryCount - tier.minEntries) / (nextTier.minEntries - tier.minEntries)) * 100)
    : 100;

  const displayName = user?.displayName || user?.email?.split('@')[0] || '匿名旅人';
  const photoURL = user?.photoURL;
  const isAnonymous = !user?.email;

  const TierIcon = tier.icon;

  return (
    <div className="w-full px-2">
      {/* Mini Card */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex flex-col items-center gap-2 py-3 px-2 rounded-xl
                   hover:bg-stone-800/60 transition-colors group"
        whileTap={{ scale: 0.97 }}
      >
        {/* Avatar */}
        <div className="relative">
          {photoURL ? (
            <img
              src={photoURL}
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-stone-700 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center text-stone-400">
              <BookOpen size={18} />
            </div>
          )}
          {/* Level Badge */}
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${tier.badgeColor}
                           flex items-center justify-center text-white text-[9px] font-bold border-2 border-stone-900`}>
            {tier.level}
          </div>
        </div>

        {/* Name & Level */}
        <div className="text-center">
          <p className="text-stone-300 text-[10px] font-bold truncate max-w-[72px] leading-tight">
            {displayName}
          </p>
          <p className="text-stone-500 text-[9px] mt-0.5">{tier.name}</p>
        </div>

        {/* Expand Indicator */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {expanded ? <ChevronDown size={12} className="text-stone-600" /> : <ChevronUp size={12} className="text-stone-600" />}
        </motion.div>
      </motion.button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="bg-stone-800/80 rounded-2xl p-4 mt-2 border border-stone-700/50">

              {/* Tier Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-white shadow-lg`}>
                  <TierIcon size={20} />
                </div>
                <div>
                  <h3 className="text-stone-200 text-sm font-bold">{tier.name}</h3>
                  <p className="text-stone-500 text-[10px]">{tier.subtitle}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-stone-900/60 rounded-lg p-2 text-center">
                  <Flame size={14} className="text-orange-500 mx-auto mb-1" />
                  <p className="text-stone-200 text-xs font-bold">{streak.current_streak}</p>
                  <p className="text-stone-600 text-[9px]">連續天</p>
                </div>
                <div className="bg-stone-900/60 rounded-lg p-2 text-center">
                  <BookOpen size={14} className="text-amber-500 mx-auto mb-1" />
                  <p className="text-stone-200 text-xs font-bold">{entryCount}</p>
                  <p className="text-stone-600 text-[9px]">日記數</p>
                </div>
                <div className="bg-stone-900/60 rounded-lg p-2 text-center">
                  <Scroll size={14} className="text-purple-400 mx-auto mb-1" />
                  <p className="text-stone-200 text-xs font-bold">{novelCount}</p>
                  <p className="text-stone-600 text-[9px]">故事數</p>
                </div>
              </div>

              {/* Progress to next tier */}
              {nextTier && (
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-stone-500">升級進度</span>
                    <span className="text-amber-500 font-bold">
                      {entryCount} / {nextTier.minEntries} 篇
                    </span>
                  </div>
                  <div className="h-1.5 bg-stone-900 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${tier.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToNext}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-stone-600 text-[9px] mt-1 text-center">
                    再寫 {nextTier.minEntries - entryCount} 篇日記即可升級「{nextTier.name}」
                  </p>
                </div>
              )}

              {/* Max tier celebration */}
              {!nextTier && (
                <div className="mb-3 text-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-900/40 to-orange-900/40
                               border border-amber-700/30 rounded-lg px-3 py-1.5"
                  >
                    <Trophy size={14} className="text-amber-400" />
                    <span className="text-amber-400 text-[10px] font-bold">已達最高等級！</span>
                  </motion.div>
                </div>
              )}

              {/* Perks */}
              <div className="space-y-1.5 mb-3">
                <p className="text-stone-500 text-[10px] font-bold uppercase tracking-wider">會員權益</p>
                {tier.perks.map((perk, i) => {
                  const PerkIcon = perk.icon;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-[10px] py-1 px-2 rounded-lg ${
                        perk.unlocked ? 'text-stone-300' : 'text-stone-600'
                      }`}
                    >
                      <PerkIcon size={12} className={perk.unlocked ? 'text-amber-500' : 'text-stone-700'} />
                      <span>{perk.label}</span>
                      {perk.unlocked && <Unlock size={10} className="text-amber-600 ml-auto" />}
                      {!perk.unlocked && <Lock size={10} className="text-stone-700 ml-auto" />}
                    </div>
                  );
                })}
              </div>

              {/* Anonymous warning */}
              {isAnonymous && (
                <div className="bg-stone-900/60 rounded-lg p-2 mb-3">
                  <p className="text-stone-500 text-[9px] text-center">
                    你正在使用匿名帳號，資料可能遺失。<br />
                    建議綁定 Google 或信箱以保存進度。
                  </p>
                </div>
              )}

              {/* Logout */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-2 rounded-lg text-stone-500 text-[10px] font-bold
                           hover:text-red-400 hover:bg-red-950/30 transition-all
                           flex items-center justify-center gap-1.5"
              >
                <LogOut size={12} />
                登出
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirm */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-xs mx-4 text-center"
              onClick={e => e.stopPropagation()}
            >
              <LogOut size={24} className="text-stone-500 mx-auto mb-3" />
              <h3 className="text-stone-200 font-bold mb-1">確定要登出嗎？</h3>
              <p className="text-stone-500 text-xs mb-4">你的回憶與故事都會安全保存。</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-stone-800 text-stone-400 text-xs font-bold hover:bg-stone-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => { setShowLogoutConfirm(false); logout(); }}
                  className="flex-1 py-2 rounded-xl bg-red-900/40 text-red-400 text-xs font-bold hover:bg-red-900/60 transition-colors"
                >
                  登出
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
