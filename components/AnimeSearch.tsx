'use client';

import {
  useState,
  useMemo,
  useCallback,
  useTransition,
  useEffect,
  useRef,
} from 'react';
import { Episode, SearchHistoryItem } from '@/types';
import {
  filterEpisodes,
  getCharacterSuggestions,
  getPopularCharacters,
} from '@/lib/search';
import { filterByGenre, getGenreEpisodeCount, GENRES } from '@/lib/genres';
import {
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
} from '@/lib/history';
import { useFavorites } from '@/hooks/useFavorites';
import Header from './Header';
import SearchBar from './SearchBar';
import CharacterTags from './CharacterTags';
import RecentSearches from './RecentSearches';
import EpisodeCard from './EpisodeCard';
import NoResults from './NoResults';
import LoadingSpinner from './LoadingSpinner';
import GenreFilter from './GenreFilter';

interface Props {
  episodes: Episode[];
}

export default function AnimeSearch({ episodes }: Props) {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [showFavoritesView, setShowFavoritesView] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { favorites, toggle, isFavorite, count: favoriteCount } = useFavorites();

  useEffect(() => {
    setRecentSearches(getSearchHistory());
  }, []);

  const popularCharacters = useMemo(
    () => getPopularCharacters(episodes, 8),
    [episodes]
  );

  const suggestions = useMemo(
    () => getCharacterSuggestions(episodes, query, 6),
    [episodes, query]
  );

  const genreEpisodeCounts = useMemo(
    () => getGenreEpisodeCount(episodes),
    [episodes]
  );

  const filteredEpisodes = useMemo(() => {
    if (showFavoritesView) {
      let pool = episodes.filter((ep) => favorites.has(ep.id));
      if (activeQuery.trim()) pool = filterEpisodes(pool, activeQuery);
      if (selectedGenre) pool = filterByGenre(pool, selectedGenre);
      return pool;
    }
    const byCharacter = filterEpisodes(episodes, activeQuery);
    const pool = activeQuery.trim() ? byCharacter : episodes;
    return selectedGenre ? filterByGenre(pool, selectedGenre) : pool.filter(() => activeQuery.trim());
  }, [episodes, activeQuery, selectedGenre, showFavoritesView, favorites]);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setShowSuggestions(true);
    startTransition(() => {
      setActiveQuery(value);
    });
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      if (!value.trim()) return;
      setQuery(value);
      setShowSuggestions(false);
      startTransition(() => {
        setActiveQuery(value);
      });
      addToSearchHistory(value);
      setRecentSearches(getSearchHistory());
    },
    []
  );

  const handleClear = useCallback(() => {
    setQuery('');
    startTransition(() => {
      setActiveQuery('');
    });
    setShowSuggestions(false);
  }, []);

  const handleGenreSelect = useCallback((genreId: string | null) => {
    startTransition(() => {
      setSelectedGenre(genreId);
    });
  }, []);

  const handleClearHistory = useCallback(() => {
    clearSearchHistory();
    setRecentSearches([]);
  }, []);

  const handleToggleFavoritesView = useCallback(() => {
    setShowFavoritesView((prev) => !prev);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const hasQuery = activeQuery.trim().length > 0;
  const hasGenre = selectedGenre !== null;
  const isFiltering = hasQuery || hasGenre || showFavoritesView;
  const hasResults = filteredEpisodes.length > 0;

  const selectedGenreLabel = hasGenre
    ? GENRES.find((g) => g.id === selectedGenre)
    : null;

  const resultLabel = (() => {
    if (showFavoritesView) {
      if (hasQuery && hasGenre)
        return `お気に入り ×「${activeQuery}」× ${selectedGenreLabel?.emoji}${selectedGenreLabel?.label}`;
      if (hasQuery) return `お気に入り ×「${activeQuery}」`;
      if (hasGenre) return `お気に入り × ${selectedGenreLabel?.emoji} ${selectedGenreLabel?.label}`;
      return 'お気に入り';
    }
    if (hasQuery && hasGenre)
      return `「${activeQuery}」× ${selectedGenreLabel?.emoji}${selectedGenreLabel?.label}`;
    if (hasQuery) return `「${activeQuery}」`;
    if (hasGenre) return `${selectedGenreLabel?.emoji} ${selectedGenreLabel?.label}`;
    return '';
  })();

  return (
    <main className="min-h-screen bg-george-light dark:bg-slate-900 transition-colors duration-300">
      <Header />

      {/* Sticky search section */}
      <div className="sticky top-0 z-40 bg-[#FFF8E1]/95 dark:bg-[#0f0f1a]/95 backdrop-blur-md shadow-sm border-b-2 border-amber-100 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div ref={searchRef} className="flex items-center gap-2">
            <div className="flex-1">
              <SearchBar
                query={query}
                suggestions={suggestions}
                showSuggestions={showSuggestions}
                onQueryChange={handleQueryChange}
                onSearch={handleSearch}
                onClear={handleClear}
                onSuggestionClick={handleSearch}
                onFocus={() => setShowSuggestions(true)}
              />
            </div>
            {/* Favorites toggle button */}
            <button
              onClick={handleToggleFavoritesView}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-black transition-all duration-150 active:scale-95 ${
                showFavoritesView
                  ? 'bg-red-500 text-white shadow-md'
                  : favoriteCount > 0
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
              }`}
              aria-label="お気に入りを見る"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={showFavoritesView ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {favoriteCount > 0 && (
                <span>{favoriteCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 pb-10">

        {/* Initial state (no query, no genre, not favorites) */}
        {!isFiltering && (
          <div className="pt-5 space-y-6">
            <CharacterTags
              characters={popularCharacters}
              onTagClick={handleSearch}
            />
            {recentSearches.length > 0 && (
              <RecentSearches
                history={recentSearches}
                onItemClick={handleSearch}
                onClear={handleClearHistory}
              />
            )}
            <GenreFilter
              selectedGenre={selectedGenre}
              episodeCounts={genreEpisodeCounts}
              onSelect={handleGenreSelect}
            />
            {/* Hero illustration */}
            <div className="flex flex-col items-center py-8 gap-4 text-center animate-fade-in">
              <div className="relative select-none">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl animate-float">🎩</div>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-700">
                  <span className="text-5xl animate-bounce-gentle">🐵</span>
                </div>
                <span className="absolute -right-2 top-0 text-xl animate-float-delayed select-none">🍌</span>
                <span className="absolute -left-3 bottom-2 text-sm animate-float-slow select-none opacity-70">⭐</span>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl px-6 py-4 shadow-md border-2 border-amber-100 dark:border-slate-700 max-w-[260px]">
                <p className="text-slate-600 dark:text-slate-300 text-sm font-bold leading-relaxed">
                  キャラクター名を入力するか<br />
                  ジャンルをタップして<br />
                  エピソードを探そう！
                </p>
                <div className="mt-2 flex justify-center gap-1 text-base">
                  <span>🔍</span><span>🎩</span><span>🍌</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Genre selected but no query and not favorites — show genre filter header inline */}
        {!hasQuery && hasGenre && !showFavoritesView && (
          <div className="pt-5 space-y-4">
            <GenreFilter
              selectedGenre={selectedGenre}
              episodeCounts={genreEpisodeCounts}
              onSelect={handleGenreSelect}
            />
          </div>
        )}

        {/* Loading */}
        {isPending && isFiltering && <LoadingSpinner />}

        {/* Results */}
        {!isPending && isFiltering && (
          <div className="pt-4">
            {/* Favorites empty state */}
            {showFavoritesView && !hasQuery && !hasGenre && filteredEpisodes.length === 0 && (
              <div className="flex flex-col items-center py-12 gap-3 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                  まだお気に入りがありません
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs">
                  エピソードの ♡ をタップして<br />また見たいリストに追加しよう！
                </p>
              </div>
            )}

            {hasResults ? (
              <>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 font-medium">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">{resultLabel}</span>
                  {showFavoritesView && !hasQuery && !hasGenre ? (
                    <span className="ml-1 font-bold text-slate-700 dark:text-slate-300">
                      {filteredEpisodes.length}件
                    </span>
                  ) : (
                    <>
                      {' '}に関連するエピソード：
                      <span className="font-bold text-slate-700 dark:text-slate-300 ml-1">{filteredEpisodes.length}件</span>
                    </>
                  )}
                </p>
                {/* Genre filter strip */}
                {(hasQuery || showFavoritesView) && (
                  <div className="mb-4">
                    <GenreFilter
                      selectedGenre={selectedGenre}
                      episodeCounts={genreEpisodeCounts}
                      onSelect={handleGenreSelect}
                    />
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  {filteredEpisodes.map((ep, i) => (
                    <EpisodeCard
                      key={ep.id}
                      episode={ep}
                      highlightQuery={activeQuery}
                      index={i}
                      isFavorite={isFavorite(ep.id)}
                      onToggleFavorite={toggle}
                    />
                  ))}
                </div>
              </>
            ) : (
              !showFavoritesView || hasQuery || hasGenre ? (
                <>
                  {(hasQuery || showFavoritesView) && (
                    <div className="mb-4">
                      <GenreFilter
                        selectedGenre={selectedGenre}
                        episodeCounts={genreEpisodeCounts}
                        onSelect={handleGenreSelect}
                      />
                    </div>
                  )}
                  <NoResults query={activeQuery} />
                </>
              ) : null
            )}
          </div>
        )}
      </div>
    </main>
  );
}
