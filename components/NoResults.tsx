'use client';

interface NoResultsProps {
  query: string;
}

const EXAMPLE_CHARACTERS = ['ジョージ', 'ビル', 'アリー', 'クィント'];

export default function NoResults({ query }: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center animate-fade-in">
      {/* Sad hat */}
      <div className="relative mb-2 select-none">
        <div className="text-6xl animate-bounce-gentle">🙈</div>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-float opacity-70">🎩</div>
      </div>

      <div className="mt-4 bg-white dark:bg-slate-800 rounded-3xl shadow-md border-2 border-amber-100 dark:border-slate-700 px-6 py-5 max-w-xs w-full">
        <h3 className="text-base font-black text-slate-700 dark:text-slate-200 mb-1">
          見つかりませんでした 😥
        </h3>
        {query && (
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
            「<span className="font-black text-amber-600 dark:text-amber-400">{query}</span>」は
            まだ登録されていないキャラクターかも？
          </p>
        )}
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
          こんなキャラクターを試してみて！
        </p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {EXAMPLE_CHARACTERS.map((ex) => (
            <span
              key={ex}
              className="text-xs bg-amber-400 text-amber-900 font-black px-3 py-1 rounded-full shadow-sm"
            >
              {ex}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
