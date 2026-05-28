'use client';

import { useTheme } from './ThemeProvider';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 text-white py-4 px-4 shadow-lg">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center flex-shrink-0 animate-bounce-gentle">
            <span className="text-2xl select-none">🐵</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold leading-tight tracking-wide text-amber-900 dark:text-white">
              おさるのジョージ
            </h1>
            <p className="text-xs text-amber-800 dark:text-slate-400 mt-0.5 leading-tight font-medium">
              キャラクターからエピソードを探そう！
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
          aria-label={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
        >
          <span className="text-xl select-none">{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
      </div>
    </header>
  );
}
