'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

function YellowHat({ size = 1 }: { size?: number }) {
  const crownW = Math.round(48 * size);
  const crownH = Math.round(40 * size);
  const brimW = Math.round(76 * size);
  const brimH = Math.round(13 * size);
  const bandH = Math.round(7 * size);

  return (
    <div className="relative flex flex-col items-center select-none" aria-hidden="true">
      {/* Crown */}
      <div
        className="relative rounded-t-2xl rounded-b border-2 border-yellow-500/30"
        style={{
          width: crownW,
          height: crownH,
          background: 'linear-gradient(160deg, #FFE234 0%, #FFD600 60%, #FFBC00 100%)',
          boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.12), inset 3px 4px 8px rgba(255,255,255,0.35)',
        }}
      >
        {/* Band */}
        <div
          className="absolute inset-x-0 rounded-sm"
          style={{
            bottom: bandH * 0.5,
            height: bandH,
            background: 'rgba(180, 100, 0, 0.45)',
          }}
        />
        {/* Highlight streak */}
        <div
          className="absolute rounded-full"
          style={{
            top: 6 * size,
            left: 6 * size,
            width: 8 * size,
            height: 16 * size,
            background: 'rgba(255,255,255,0.3)',
            transform: 'rotate(-15deg)',
          }}
        />
      </div>
      {/* Brim */}
      <div
        className="-mt-1 border-2 border-yellow-500/30"
        style={{
          width: brimW,
          height: brimH,
          borderRadius: '50%',
          background: 'linear-gradient(180deg, #FFD600 0%, #FFBC00 100%)',
          boxShadow: '0 4px 0 rgba(0,0,0,0.15), inset 0 -3px 0 rgba(0,0,0,0.1)',
        }}
      />
    </div>
  );
}

function NavLink({ href, label, title }: { href: string; label: string; title: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      title={title}
      className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all ${
        active
          ? 'bg-white/50 shadow-inner border-2 border-white/60'
          : 'bg-white/20 hover:bg-white/40 border-2 border-white/30'
      }`}
    >
      {label}
    </Link>
  );
}

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="relative overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{ background: 'linear-gradient(135deg, #FFE234 0%, #FFB300 55%, #FF8C00 100%)' }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1e293b 60%, #0f172a 100%)' }}
      />

      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <span className="absolute top-3 right-28 text-2xl opacity-60 animate-float">🍌</span>
        <span className="absolute top-7 left-5 text-xl opacity-30 animate-float-delayed">🌿</span>
        <span className="absolute top-1 left-[38%] text-base opacity-25 animate-float-slow">⭐</span>
        <span className="absolute bottom-12 right-4 text-xs opacity-30 animate-bounce-gentle">✨</span>
        {/* Main hat (top right) */}
        <div className="absolute -top-1 right-2 animate-hat-sway drop-shadow-lg">
          <YellowHat size={1} />
        </div>
        {/* Tiny second hat (ghost) */}
        <div className="absolute bottom-10 left-[55%] opacity-10 animate-float-delayed" style={{ transform: 'scale(0.45)' }}>
          <YellowHat size={1} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-5 pb-12">
        <div className="flex items-center justify-between">
          {/* Left: avatar + title */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-white shadow-xl border-[3px] border-white/70 flex items-center justify-center">
                <span className="text-3xl animate-bounce-gentle select-none">🐵</span>
              </div>
              <div className="absolute inset-0 rounded-full bg-white/40 animate-pulse-ring" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-white drop-shadow leading-tight tracking-wide">
                  おさるのジョージ
                </h1>
                <span className="text-[10px] font-black bg-white/30 text-white px-2 py-0.5 rounded-full border border-white/40 shadow whitespace-nowrap">
                  S1〜S13
                </span>
              </div>
              <p className="text-xs text-yellow-100 dark:text-indigo-200 font-bold mt-0.5 drop-shadow-sm">
                キャラクターからエピソードを探そう！
              </p>
            </div>
          </div>

          {/* Nav + Theme toggle */}
          <div className="flex items-center gap-2">
            <NavLink href="/" label="🐵" title="アニメ検索" />
            <NavLink href="/plays" label="🧸" title="遊び提案" />
          </div>
          <button
            onClick={toggleTheme}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white/25 hover:bg-white/45 border-2 border-white/40 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-md"
            aria-label={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
          >
            <span className="text-xl select-none">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 leading-none" aria-hidden="true">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="block w-full h-10">
          <path
            d="M0,24 C200,48 400,0 720,24 C1040,48 1240,0 1440,24 L1440,48 L0,48 Z"
            className="fill-[#FFF8E1] dark:fill-[#0f0f1a]"
          />
        </svg>
      </div>
    </header>
  );
}
