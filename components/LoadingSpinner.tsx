'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-amber-100 dark:border-slate-700" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 animate-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl select-none animate-bounce-gentle">🐵</span>
        </div>
      </div>
      <p className="text-slate-400 dark:text-slate-500 text-sm font-medium animate-pulse">
        さがし中...
      </p>
    </div>
  );
}
