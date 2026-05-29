'use client';

import { useState, useCallback, useEffect } from 'react';

const STEPS = [
  {
    emoji: '🐵',
    message: <>キャラクター名を入力するか<br />ジャンルをタップして<br />エピソードを探そう！</>,
    icons: ['🔍', '🎩', '🍌'],
    showLink: false,
  },
  {
    emoji: '😲',
    message: <>うわっ！びっくりした！<br />もう一回たたいてみて？</>,
    icons: ['😲', '✨', '🍌'],
    showLink: false,
  },
  {
    emoji: '🙈',
    message: <>やめて〜！くすぐったいよ〜！<br />もっとたたいたらどうなるかな？</>,
    icons: ['🙈', '😂', '💦'],
    showLink: false,
  },
  {
    emoji: '😜',
    message: <>ジョージのこと好き？<br />だったら公式サイトも見てみよ！</>,
    icons: ['❤️', '🐵', '🎉'],
    showLink: false,
  },
  {
    emoji: '🐒',
    message: <>バナナが食べたいなぁ🍌<br />公式サイトでもっと知ろう！</>,
    icons: ['🍌', '🍌', '🍌'],
    showLink: true,
  },
];

// After step 4, cycle through these bonus reactions
const BONUS = [
  { emoji: '🎩', message: <>おじさんの帽子もどこかに行っちゃった？<br />いたずらはほどほどに！</> },
  { emoji: '🐵', message: <>ジョージはいたずらっこだけど<br />やさしいサルなんだよ！</> },
  { emoji: '😴', message: <>こんなにたたいたら疲れちゃった…<br />おやすみジョージ💤</> },
  { emoji: '🎉', message: <>たくさん遊んでくれてありがとう！<br />エピソードもいっぱい見てね🐵</> },
];

export default function GeorgeHero() {
  const [clickCount, setClickCount] = useState(0);
  const [bouncing, setBouncing] = useState(false);
  const [popText, setPopText] = useState('');
  const [showPop, setShowPop] = useState(false);

  const POP_TEXTS = ['ぽん！', 'えいっ！', 'よいしょ！', 'うりゃ！', 'たたいた！'];

  const step = clickCount < STEPS.length
    ? STEPS[clickCount]
    : STEPS[STEPS.length - 1]; // keep link visible after step 4

  const bonus = clickCount >= STEPS.length
    ? BONUS[(clickCount - STEPS.length) % BONUS.length]
    : null;

  const displayEmoji = bonus ? bonus.emoji : step.emoji;
  const displayMessage = bonus ? bonus.message : step.message;

  const handleClick = useCallback(() => {
    setClickCount((c) => c + 1);
    setBouncing(true);
    const pop = POP_TEXTS[Math.floor(Math.random() * POP_TEXTS.length)];
    setPopText(pop);
    setShowPop(true);
    setTimeout(() => setShowPop(false), 600);
  }, []);

  useEffect(() => {
    if (!bouncing) return;
    const t = setTimeout(() => setBouncing(false), 400);
    return () => clearTimeout(t);
  }, [bouncing]);

  return (
    <div className="flex flex-col items-center py-8 gap-4 text-center animate-fade-in">
      {/* Monkey + decorations */}
      <div className="relative select-none">
        {/* Hat */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl animate-float">🎩</div>

        {/* Pop text */}
        {showPop && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-lg font-black text-amber-500 whitespace-nowrap pointer-events-none animate-pop-up z-10">
            {popText}
          </div>
        )}

        {/* George circle — clickable */}
        <button
          onClick={handleClick}
          className={`w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-700 transition-transform cursor-pointer active:scale-90 focus:outline-none ${bouncing ? 'animate-george-bounce' : ''}`}
          aria-label="ジョージをたたく"
        >
          <span className="text-5xl">{displayEmoji}</span>
        </button>

        {/* Banana */}
        <span className="absolute -right-2 top-0 text-xl animate-float-delayed select-none">🍌</span>
        <span className="absolute -left-3 bottom-2 text-sm animate-float-slow select-none opacity-70">⭐</span>

        {/* Click hint on first visit */}
        {clickCount === 0 && (
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-400 whitespace-nowrap animate-pulse">
            タップしてみて！
          </span>
        )}
      </div>

      {/* Speech bubble */}
      <div
        className={`bg-white dark:bg-slate-800 rounded-3xl px-6 py-4 shadow-md border-2 border-amber-100 dark:border-slate-700 max-w-[280px] transition-all duration-300 ${clickCount > 0 ? 'border-amber-300 dark:border-amber-600' : ''}`}
      >
        <p className="text-slate-600 dark:text-slate-300 text-sm font-bold leading-relaxed">
          {displayMessage}
        </p>

        {/* Icons row */}
        <div className="mt-2 flex justify-center gap-1 text-base">
          {(bonus ? ['🐵', '✨', '🎩'] : step.icons).map((icon, i) => (
            <span key={i}>{icon}</span>
          ))}
        </div>

        {/* Official site link — appears at step 4+ */}
        {(step.showLink || clickCount >= STEPS.length) && (
          <a
            href="https://www.osarunogeorge.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 w-full bg-amber-400 hover:bg-amber-500 active:scale-95 text-white text-[12px] font-black py-2 px-4 rounded-full shadow-md transition-all duration-150"
          >
            <span>🌐</span>
            <span>おさるのジョージ 公式サイトへ</span>
          </a>
        )}

        {/* Click counter hint */}
        {clickCount > 0 && clickCount < STEPS.length && (
          <p className="mt-2 text-[10px] text-slate-300 dark:text-slate-600">
            {clickCount}回たたいた！もっとたたいてみよう
          </p>
        )}
      </div>
    </div>
  );
}
