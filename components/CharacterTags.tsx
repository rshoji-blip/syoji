'use client';

const TAG_STYLES = [
  'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50',
  'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50',
  'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50',
  'bg-lime-100 text-lime-800 hover:bg-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:hover:bg-lime-900/50',
  'bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:hover:bg-sky-900/50',
  'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50',
  'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50',
  'bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50',
];

interface CharacterTagsProps {
  characters: string[];
  onTagClick: (character: string) => void;
}

export default function CharacterTags({ characters, onTagClick }: CharacterTagsProps) {
  if (characters.length === 0) return null;

  return (
    <div className="animate-fade-in">
      <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
        <span className="select-none">⭐</span>
        <span>よく出てくるキャラクター</span>
      </h2>
      <div className="flex flex-wrap gap-2">
        {characters.map((character, i) => (
          <button
            key={character}
            onClick={() => onTagClick(character)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm cursor-pointer ${TAG_STYLES[i % TAG_STYLES.length]}`}
          >
            {character}
          </button>
        ))}
      </div>
    </div>
  );
}
