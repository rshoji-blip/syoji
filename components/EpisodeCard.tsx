'use client';

import { useMemo } from 'react';
import { Episode } from '@/types';
import { normalizeString } from '@/lib/search';

interface EpisodeCardProps {
  episode: Episode;
  highlightQuery: string;
  index: number;
}

const GRADIENTS = [
  'from-yellow-400 to-amber-500',
  'from-orange-400 to-red-400',
  'from-amber-400 to-yellow-300',
  'from-lime-400 to-green-500',
  'from-sky-400 to-blue-500',
  'from-rose-400 to-pink-400',
  'from-violet-400 to-purple-500',
  'from-teal-400 to-cyan-500',
];

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const normalizedQuery = normalizeString(query);
  const normalizedText = normalizeString(text);
  const idx = normalizedText.indexOf(normalizedQuery);
  if (idx === -1) return text;
  return (
    <>
      {text.substring(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-700 text-inherit rounded px-0.5 not-italic">
        {text.substring(idx, idx + query.length)}
      </mark>
      {text.substring(idx + query.length)}
    </>
  );
}

function formatDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-');
    return `${y}年${parseInt(m)}月${parseInt(d)}日`;
  } catch {
    return dateStr;
  }
}

export default function EpisodeCard({ episode, highlightQuery, index }: EpisodeCardProps) {
  const gradient = GRADIENTS[index % GRADIENTS.length];

  const matchingCharacters = useMemo(() => {
    if (!highlightQuery) return new Set<string>();
    const norm = normalizeString(highlightQuery);
    return new Set(episode.characters.filter(c => normalizeString(c).includes(norm)));
  }, [episode.characters, highlightQuery]);

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100 dark:border-slate-700 hover:scale-[1.01] active:scale-[0.99] animate-slide-up"
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
    >
      <div className="flex gap-3 p-4">
        {/* Thumbnail */}
        <div
          className={`w-24 h-20 rounded-xl bg-gradient-to-br ${gradient} flex-shrink-0 flex flex-col items-center justify-center shadow-sm overflow-hidden`}
        >
          {episode.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={episode.thumbnail}
              alt={episode.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <>
              <span className="text-2xl select-none">🐵</span>
              <span className="text-white text-xs font-bold mt-0.5 drop-shadow">
                {episode.episode.replace('S10 ', '')}
              </span>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Episode badge + date */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-xs font-bold text-white bg-gradient-to-r ${gradient} px-2 py-0.5 rounded-full whitespace-nowrap`}
            >
              {episode.episode}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
              {formatDate(episode.date)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug mb-1.5 line-clamp-2">
            {episode.title}
          </h3>

          {/* Description */}
          {episode.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2 line-clamp-2">
              {episode.description}
            </p>
          )}

          {/* Characters */}
          <div className="flex flex-wrap gap-1">
            {episode.characters.map((char) => {
              const isMatch = matchingCharacters.has(char);
              return (
                <span
                  key={char}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                    isMatch
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-700'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}
                >
                  {isMatch ? highlightText(char, highlightQuery) : char}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
