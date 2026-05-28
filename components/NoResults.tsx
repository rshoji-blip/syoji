'use client';

interface NoResultsProps {
  query: string;
}

const EXAMPLE_CHARACTERS = ['ジョージ', 'ビル', 'アリー', 'クィント'];

export default function NoResults({ query }: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="text-6xl mb-4 animate-bounce-gentle select-none">🙈</div>
      <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
        見つかりませんでした
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
        「<span className="font-bold text-amber-600 dark:text-amber-400">{query}</span>」は
        <br />
        見つかりませんでした。
      </p>
      <p className="text-slate-400 dark:text-slate-500 text-xs mt-3">
        別のキャラクター名を試してみてください
      </p>
      <div className="mt-5 flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-slate-400 self-center">例：</span>
        {EXAMPLE_CHARACTERS.map((ex) => (
          <span
            key={ex}
            className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800"
          >
            {ex}
          </span>
        ))}
      </div>
    </div>
  );
}
