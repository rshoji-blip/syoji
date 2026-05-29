'use client';

import { useMemo, useState } from 'react';
import { Episode } from '@/types';
import { normalizeString } from '@/lib/search';
import { getYouTubeUrl, hasDirectVideo, getThumbnailUrl } from '@/lib/youtube';

interface EpisodeCardProps {
  episode: Episode;
  highlightQuery: string;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const SEASON_THEMES = [
  { gradient: 'from-yellow-400 via-amber-400 to-orange-400', emoji: '🐵', border: 'border-l-yellow-400' },
  { gradient: 'from-sky-400 via-blue-400 to-indigo-400', emoji: '🌊', border: 'border-l-sky-400' },
  { gradient: 'from-emerald-400 via-green-500 to-teal-400', emoji: '🌿', border: 'border-l-emerald-400' },
  { gradient: 'from-rose-400 via-pink-500 to-fuchsia-400', emoji: '🌸', border: 'border-l-rose-400' },
  { gradient: 'from-violet-400 via-purple-500 to-indigo-400', emoji: '🔮', border: 'border-l-violet-400' },
  { gradient: 'from-orange-400 via-amber-500 to-yellow-400', emoji: '🍊', border: 'border-l-orange-400' },
  { gradient: 'from-cyan-400 via-sky-400 to-blue-400', emoji: '🐬', border: 'border-l-cyan-400' },
  { gradient: 'from-lime-400 via-green-400 to-emerald-400', emoji: '🍃', border: 'border-l-lime-400' },
  { gradient: 'from-red-400 via-rose-400 to-pink-400', emoji: '🎪', border: 'border-l-red-400' },
  { gradient: 'from-amber-400 via-yellow-300 to-lime-300', emoji: '🌟', border: 'border-l-amber-400' },
  { gradient: 'from-teal-400 via-cyan-400 to-sky-400', emoji: '🌊', border: 'border-l-teal-400' },
  { gradient: 'from-fuchsia-400 via-pink-400 to-rose-400', emoji: '🎀', border: 'border-l-fuchsia-400' },
  { gradient: 'from-indigo-400 via-violet-400 to-purple-400', emoji: '🎭', border: 'border-l-indigo-400' },
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

export default function EpisodeCard({ episode, highlightQuery, index, isFavorite, onToggleFavorite }: EpisodeCardProps) {
  const theme = SEASON_THEMES[(episode.season - 1) % SEASON_THEMES.length];
  const youtubeUrl = getYouTubeUrl(episode.title);
  const hasDirect = hasDirectVideo(episode.title);
  const thumbnailUrl = getThumbnailUrl(episode.title);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  const showThumbnail = !thumbnailFailed && (thumbnailUrl ?? episode.thumbnail);

  const matchingCharacters = useMemo(() => {
    if (!highlightQuery) return new Set<string>();
    const norm = normalizeString(highlightQuery);
    return new Set(episode.characters.filter(c => normalizeString(c).includes(norm)));
  }, [episode.characters, highlightQuery]);

  const isTitleMatch = useMemo(() => {
    if (!highlightQuery) return false;
    return normalizeString(episode.title).includes(normalizeString(highlightQuery));
  }, [episode.title, highlightQuery]);

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100 dark:border-slate-700 hover:scale-[1.015] active:scale-[0.99] animate-slide-up border-l-4 ${theme.border}`}
      style={{ animationDelay: `${Math.min(index * 40, 280)}ms` }}
    >
      <div className="flex gap-3 p-4">
        {/* Thumbnail */}
        <div
          className={`w-[88px] h-[88px] rounded-2xl bg-gradient-to-br ${theme.gradient} flex-shrink-0 flex flex-col items-center justify-center shadow-md overflow-hidden relative`}
        >
          {showThumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={showThumbnail}
              alt={episode.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setThumbnailFailed(true)}
            />
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="w-16 h-16 rounded-full border-4 border-white" />
              </div>
              <span className="text-3xl select-none z-10">{theme.emoji}</span>
              <span className="text-white text-[11px] font-black mt-0.5 z-10 drop-shadow bg-black/20 px-1.5 rounded-full">
                S{String(episode.season).padStart(2, '0')}
              </span>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Episode badge + date + heart */}
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span
              className={`text-[10px] font-black text-white bg-gradient-to-r ${theme.gradient} px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm`}
            >
              {episode.episode}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap font-medium">
              {formatDate(episode.date)}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(episode.id); }}
              className={`ml-auto flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150 active:scale-90 ${
                isFavorite
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/30'
                  : 'text-slate-300 dark:text-slate-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
              aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <h3 className={`text-sm font-black leading-snug mb-1 line-clamp-2 ${
            isTitleMatch
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-slate-800 dark:text-slate-100'
          }`}>
            {isTitleMatch ? highlightText(episode.title, highlightQuery) : episode.title}
          </h3>

          {/* Synopsis */}
          {episode.synopsis && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mb-1.5 line-clamp-2">
              {episode.synopsis}
            </p>
          )}

          {/* Characters */}
          <div className="flex flex-wrap gap-1 mb-2">
            {episode.characters.map((char) => {
              const isMatch = matchingCharacters.has(char);
              return (
                <span
                  key={char}
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                    isMatch
                      ? `bg-gradient-to-r ${theme.gradient} text-white shadow-sm ring-1 ring-white/40`
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700/80 dark:text-slate-400'
                  }`}
                >
                  {isMatch ? highlightText(char, highlightQuery) : char}
                </span>
              );
            })}
          </div>

          {/* YouTube button */}
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black transition-all duration-150 hover:scale-105 active:scale-95 shadow-sm ${
              hasDirect
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-red-900/30 dark:hover:text-red-400 border border-slate-200 dark:border-slate-600'
            }`}
          >
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>{hasDirect ? '動画を見る' : 'YouTubeで探す'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
