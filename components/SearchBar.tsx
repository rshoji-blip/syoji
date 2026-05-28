'use client';

import { useRef, KeyboardEvent } from 'react';

interface SearchBarProps {
  query: string;
  suggestions: string[];
  showSuggestions: boolean;
  onQueryChange: (value: string) => void;
  onSearch: (value: string) => void;
  onClear: () => void;
  onSuggestionClick: (suggestion: string) => void;
  onFocus: () => void;
}

export default function SearchBar({
  query,
  suggestions,
  showSuggestions,
  onQueryChange,
  onSearch,
  onClear,
  onSuggestionClick,
  onFocus,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSuggestions = showSuggestions && suggestions.length > 0;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(query);
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      onClear();
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2.5 bg-white dark:bg-slate-800 px-4 py-3.5 transition-all duration-200 border-2 ${
          hasSuggestions
            ? 'rounded-t-3xl border-b-transparent border-amber-400 shadow-lg shadow-amber-200/40 dark:shadow-amber-900/20'
            : 'rounded-3xl border-amber-200 dark:border-slate-600 focus-within:border-amber-400 focus-within:shadow-lg focus-within:shadow-amber-200/50 dark:focus-within:border-amber-500 shadow-md'
        }`}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
          <span className="text-sm select-none leading-none">🔍</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          placeholder="キャラクター名を入力…（例: ジョージ、ビル）"
          className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none text-sm font-bold min-w-0"
        />
        {query && (
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              onClear();
            }}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors duration-150"
            aria-label="クリア"
          >
            <span className="text-slate-500 dark:text-slate-300 text-xs font-black leading-none">✕</span>
          </button>
        )}
      </div>

      {hasSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 rounded-b-3xl shadow-xl border-2 border-t-0 border-amber-400 overflow-hidden z-50">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onMouseDown={(e) => {
                e.preventDefault();
                onSuggestionClick(suggestion);
              }}
              className="w-full text-left px-4 py-3 hover:bg-amber-50 dark:hover:bg-slate-700/80 flex items-center gap-3 transition-colors duration-100 border-t border-amber-50 dark:border-slate-700/60 first:border-0"
            >
              <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-sm flex-shrink-0 select-none">
                🐵
              </span>
              <span className="text-slate-700 dark:text-slate-200 font-bold text-sm">
                {suggestion}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
