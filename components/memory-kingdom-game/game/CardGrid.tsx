'use client';

import { GameState, GameAction } from '@/lib/memory-kingdom-game/types';
import CardTile from './CardTile';

interface Props {
  state: GameState;
  dispatch: (a: GameAction) => void;
}

export default function CardGrid({ state, dispatch }: Props) {
  const { phase, cards, currentPlayer, flippedIds, mageRevealIds } = state;
  const cp = currentPlayer;
  const oppIdx = cp === 0 ? 1 : 0;

  function handleCardClick(cardId: number) {
    if (phase === 'scout_target') {
      const card = cards.find(c => c.id === cardId);
      if (!card || card.taken || card.revealed) return;
      dispatch({ type: 'SCOUT_PICK', cardId });
      return;
    }
    if (phase === 'steal_target') {
      const card = cards.find(c => c.id === cardId);
      if (!card || !card.taken || card.takenBy !== oppIdx) return;
      dispatch({ type: 'STEAL_PICK', cardId });
      return;
    }
    if (phase === 'playing' || phase === 'awaiting') {
      dispatch({ type: 'FLIP', cardId });
    }
  }

  function isSelectable(cardId: number): boolean {
    const card = cards.find(c => c.id === cardId)!;
    if (card.taken) return false;
    if (phase === 'playing') return !card.revealed;
    if (phase === 'awaiting') return !card.revealed && !flippedIds.includes(cardId);
    return false;
  }

  function isScoutTarget(cardId: number): boolean {
    if (phase !== 'scout_target') return false;
    const card = cards.find(c => c.id === cardId)!;
    return !card.taken && !card.revealed;
  }

  function isStealTarget(cardId: number): boolean {
    if (phase !== 'steal_target') return false;
    const card = cards.find(c => c.id === cardId)!;
    return card.taken && card.takenBy === oppIdx;
  }

  return (
    <div className="grid grid-cols-5 gap-1.5 px-3 py-1">
      {cards.map(card => (
        <CardTile
          key={card.id}
          card={card}
          phase={phase}
          isSelectable={isSelectable(card.id)}
          isScoutTarget={isScoutTarget(card.id)}
          isStealTarget={isStealTarget(card.id)}
          isMageRevealed={mageRevealIds.includes(card.id)}
          onClick={() => handleCardClick(card.id)}
        />
      ))}
    </div>
  );
}
