'use client';

const TAG_STYLES = [
  { bg: 'bg-yellow-400', text: 'text-yellow-900', hover: 'hover:bg-yellow-500', shadow: 'shadow-yellow-200 dark:shadow-yellow-900/30', emoji: '⭐' },
  { bg: 'bg-orange-400', text: 'text-white', hover: 'hover:bg-orange-500', shadow: 'shadow-orange-200 dark:shadow-orange-900/30', emoji: '🍊' },
  { bg: 'bg-sky-400', text: 'text-white', hover: 'hover:bg-sky-500', shadow: 'shadow-sky-200 dark:shadow-sky-900/30', emoji: '💙' },
  { bg: 'bg-rose-400', text: 'text-white', hover: 'hover:bg-rose-500', shadow: 'shadow-rose-200 dark:shadow-rose-900/30', emoji: '🌸' },
  { bg: 'bg-emerald-400', text: 'text-white', hover: 'hover:bg-emerald-500', shadow: 'shadow-emerald-200 dark:shadow-emerald-900/30', emoji: '🌿' },
  { bg: 'bg-violet-400', text: 'text-white', hover: 'hover:bg-violet-500', shadow: 'shadow-violet-200 dark:shadow-violet-900/30', emoji: '💜' },
  { bg: 'bg-pink-400', text: 'text-white', hover: 'hover:bg-pink-500', shadow: 'shadow-pink-200 dark:shadow-pink-900/30', emoji: '🌺' },
  { bg: 'bg-amber-400', text: 'text-amber-900', hover: 'hover:bg-amber-500', shadow: 'shadow-amber-200 dark:shadow-amber-900/30', emoji: '✨' },
];

interface CharacterTagsProps {
  characters: string[];
  onTagClick: (character: string) => void;
}

export default function CharacterTags({ characters, onTagClick }: CharacterTagsProps) {
  if (characters.length === 0) return null;

  return (
    <div className="animate-fade-in">
      <h2 className="text-sm font-black text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-xs select-none">⭐</span>
        <span>よく出てくるキャラクター</span>
      </h2>
      <div className="flex flex-wrap gap-2">
        {characters.map((character, i) => {
          const s = TAG_STYLES[i % TAG_STYLES.length];
          return (
            <button
              key={character}
              onClick={() => onTagClick(character)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-black transition-all duration-200 hover:scale-105 active:scale-95 shadow-md ${s.bg} ${s.text} ${s.hover} ${s.shadow}`}
            >
              <span className="select-none text-xs">{s.emoji}</span>
              {character}
            </button>
          );
        })}
      </div>
    </div>
  );
}
