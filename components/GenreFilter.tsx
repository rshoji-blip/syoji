'use client';

import { GENRES } from '@/lib/genres';

interface GenreFilterProps {
  selectedGenre: string | null;
  episodeCounts: Record<string, number>;
  onSelect: (genreId: string | null) => void;
}

export default function GenreFilter({
  selectedGenre,
  episodeCounts,
  onSelect,
}: GenreFilterProps) {
  return (
    <div>
      <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
        ジャンルで探す
      </h2>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => {
          const count = episodeCounts[genre.id] ?? 0;
          const isSelected = selectedGenre === genre.id;
          return (
            <button
              key={genre.id}
              onClick={() => onSelect(isSelected ? null : genre.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                isSelected
                  ? 'bg-amber-400 text-white shadow-md scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-amber-200 dark:border-slate-600 hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-400'
              }`}
            >
              <span className="select-none">{genre.emoji}</span>
              <span>{genre.label}</span>
              <span
                className={`text-xs rounded-full px-1.5 py-0 font-bold ${
                  isSelected
                    ? 'bg-white/30 text-white'
                    : 'bg-amber-50 dark:bg-slate-700 text-amber-600 dark:text-amber-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
