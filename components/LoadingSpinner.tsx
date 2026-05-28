'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5 animate-fade-in">
      {/* Hat + spinner stack */}
      <div className="relative">
        {/* Spinning ring */}
        <div className="w-20 h-20 rounded-full border-4 border-amber-100 dark:border-slate-700" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 border-r-orange-300 animate-spin-slow" />
        {/* George in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl select-none animate-bounce-gentle">🐵</span>
        </div>
        {/* Hat floating above */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 animate-float select-none text-2xl">
          🎩
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-amber-600 dark:text-amber-400 text-sm font-black">
          さがし中…
        </p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
