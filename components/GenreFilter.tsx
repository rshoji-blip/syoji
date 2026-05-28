'use client';

import { GENRES } from '@/lib/genres';

interface GenreFilterProps {
  selectedGenre: string | null;
  episodeCounts: Record<string, number>;
  onSelect: (genreId: string | null) => void;
}

const GENRE_COLORS: Record<string, { idle: string; active: string }> = {
  food:     { idle: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800', active: 'bg-orange-400 text-white border-orange-500 shadow-orange-200/60' },
  animals:  { idle: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800', active: 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-200/60' },
  vehicles: { idle: 'bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800', active: 'bg-sky-500 text-white border-sky-600 shadow-sky-200/60' },
  science:  { idle: 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800', active: 'bg-violet-500 text-white border-violet-600 shadow-violet-200/60' },
  sports:   { idle: 'bg-lime-100 text-lime-700 border-lime-200 hover:bg-lime-200 dark:bg-lime-900/20 dark:text-lime-300 dark:border-lime-800', active: 'bg-lime-500 text-white border-lime-600 shadow-lime-200/60' },
  music:    { idle: 'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800', active: 'bg-pink-500 text-white border-pink-600 shadow-pink-200/60' },
  nature:   { idle: 'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800', active: 'bg-teal-500 text-white border-teal-600 shadow-teal-200/60' },
  events:   { idle: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800', active: 'bg-rose-500 text-white border-rose-600 shadow-rose-200/60' },
};

export default function GenreFilter({
  selectedGenre,
  episodeCounts,
  onSelect,
}: GenreFilterProps) {
  return (
    <div>
      <h2 className="text-sm font-black text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-xs select-none">🎨</span>
        <span>ジャンルで探す</span>
      </h2>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => {
          const count = episodeCounts[genre.id] ?? 0;
          const isSelected = selectedGenre === genre.id;
          const colors = GENRE_COLORS[genre.id];
          return (
            <button
              key={genre.id}
              onClick={() => onSelect(isSelected ? null : genre.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black transition-all duration-200 border hover:scale-105 active:scale-95 shadow-sm ${
                isSelected
                  ? `${colors.active} shadow-md scale-105`
                  : colors.idle
              }`}
            >
              <span className="select-none text-sm">{genre.emoji}</span>
              <span>{genre.label}</span>
              <span
                className={`rounded-full px-1.5 py-0 font-black text-[10px] ${
                  isSelected ? 'bg-white/30 text-white' : 'bg-white/70 dark:bg-black/30 text-current opacity-80'
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
