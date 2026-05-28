'use client';

import { SearchHistoryItem } from '@/types';

interface RecentSearchesProps {
  history: SearchHistoryItem[];
  onItemClick: (query: string) => void;
  onClear: () => void;
}

export default function RecentSearches({
  history,
  onItemClick,
  onClear,
}: RecentSearchesProps) {
  if (history.length === 0) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-black text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-xs select-none">🕐</span>
          <span>最近の検索</span>
        </h2>
        <button
          onClick={onClear}
          className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-400 dark:hover:text-red-400 transition-colors duration-150 font-bold"
        >
          クリア
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.slice(0, 8).map((item, i) => (
          <button
            key={`${item.query}-${i}`}
            onClick={() => onItemClick(item.query)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-sm font-bold hover:bg-amber-50 dark:hover:bg-slate-700 hover:text-amber-700 dark:hover:text-amber-400 transition-all duration-150 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <span className="text-amber-400 text-xs select-none">↩</span>
            {item.query}
          </button>
        ))}
      </div>
    </div>
  );
}
