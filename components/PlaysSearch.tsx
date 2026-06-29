'use client';

import { useState, useMemo } from 'react';
import { Play } from '@/types';
import { filterPlays, DOMAINS, ageLabel } from '@/lib/play-search';

interface Props {
  plays: Play[];
}

const DOMAIN_COLORS: Record<string, string> = {
  健康: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  人間関係: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  環境: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  言葉: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  表現: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  総合: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

export default function PlaysSearch({ plays }: Props) {
  const [ageMonths, setAgeMonths] = useState<number>(18);
  const [domain, setDomain] = useState<string>('すべて');
  const [location, setLocation] = useState<string>('すべて');
  const [keyword, setKeyword] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      filterPlays(plays, {
        ageMonths,
        domain,
        location: location === 'すべて' ? undefined : location,
        keyword: keyword.trim() || undefined,
      }),
    [plays, ageMonths, domain, location, keyword]
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-3">
          <h1 className="text-lg font-black text-slate-800 dark:text-white">
            🧸 遊び提案
          </h1>

          {/* Age slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>月齢・年齢</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {ageLabel(ageMonths)}
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={36}
              value={ageMonths}
              onChange={(e) => setAgeMonths(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>3ヶ月</span>
              <span>3歳</span>
            </div>
          </div>

          {/* Keyword */}
          <input
            type="text"
            placeholder="キーワード検索（例：粘土、歌、外遊び）"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          {/* Domain tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {DOMAINS.map((d) => (
              <button
                key={d}
                onClick={() => setDomain(d)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  domain === d
                    ? 'bg-amber-500 text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Location filter */}
          <div className="flex gap-2">
            {['すべて', '室内', '屋外'].map((loc) => (
              <button
                key={loc}
                onClick={() => setLocation(loc)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  location === loc
                    ? 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {loc === '室内' ? '🏠 室内' : loc === '屋外' ? '🌳 屋外' : '📍 すべて'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-700 dark:text-slate-200">{filtered.length}件</span> の遊びが見つかりました
        </p>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm">条件に合う遊びが見つかりませんでした</p>
          </div>
        )}

        {filtered.map((play) => (
          <PlayCard
            key={play.id}
            play={play}
            expanded={expandedId === play.id}
            onToggle={() => setExpandedId(expandedId === play.id ? null : play.id)}
            domainColors={DOMAIN_COLORS}
          />
        ))}
      </div>
    </main>
  );
}

function PlayCard({
  play,
  expanded,
  onToggle,
  domainColors,
}: {
  play: Play;
  expanded: boolean;
  onToggle: () => void;
  domainColors: Record<string, string>;
}) {
  const colorClass = domainColors[play.domain] ?? domainColors['総合'];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      {/* Card header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-start gap-3"
      >
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
              {play.domain}
            </span>
            <span className="text-[10px] text-slate-400">
              {ageLabel(play.age_min_months)}〜{ageLabel(play.age_max_months)}
            </span>
          </div>
          <p className="font-bold text-slate-800 dark:text-white text-sm leading-snug">
            {play.name}
          </p>
          {play.overview && !expanded && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {play.overview}
            </p>
          )}
          {/* Effects chips */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {play.effects.slice(0, 3).map((e) => (
              <span
                key={e}
                className="text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
        <span className="text-slate-400 text-sm mt-1">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 dark:border-slate-700 pt-3">
          {play.overview && (
            <p className="text-sm text-slate-600 dark:text-slate-300">{play.overview}</p>
          )}

          {play.preparation.length > 0 && (
            <Section title="📦 準備するもの">
              <ul className="space-y-1">
                {play.preparation.map((p, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex gap-1.5">
                    <span className="text-amber-500 mt-0.5">•</span>{p}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {play.materials.length > 0 && play.materials[0] !== 'なし' && (
            <Section title="🧰 素材・道具">
              <div className="flex flex-wrap gap-1">
                {play.materials.map((m) => (
                  <span key={m} className="text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                    {m}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {play.steps.length > 0 && (
            <Section title="▶ 遊び方">
              <ol className="space-y-1.5">
                {play.steps.map((s, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex gap-2">
                    <span className="flex-shrink-0 w-4 h-4 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {play.voice_guidance.length > 0 && (
            <Section title="💬 声がけ例">
              <ul className="space-y-1">
                {play.voice_guidance.map((v, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 italic flex gap-1.5">
                    <span className="text-pink-400 mt-0.5">♪</span>{v}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {play.reference_url && (
            <a
              href={play.reference_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-500 underline"
            >
              🎬 参考動画を見る
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  );
}
