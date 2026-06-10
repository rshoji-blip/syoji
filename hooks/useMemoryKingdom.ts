'use client';

import { useReducer, useEffect, useRef } from 'react';
import { gameReducer, createInitialState } from '@/lib/memory-kingdom-game/gameLogic';
import { GameState, GameAction } from '@/lib/memory-kingdom-game/types';

export function useMemoryKingdom() {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());

  const resolveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mageTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoutTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 両カードが公開されたら自動でRESOLVE ─────────────────────────────────
  useEffect(() => {
    if (state.phase !== 'resolving') return;
    // 記憶封印中なら0.4秒、通常は1.3秒
    const sealed = state.players[state.currentPlayer].memorySealed;
    const delay = sealed ? 400 : 1300;
    resolveTimer.current = setTimeout(() => dispatch({ type: 'RESOLVE' }), delay);
    return () => { if (resolveTimer.current) clearTimeout(resolveTimer.current); };
  }, [state.phase, state.flippedIds, state.currentPlayer]); // eslint-disable-line

  // ── 魔法使塔：3秒後に公開終了 ────────────────────────────────────────────
  useEffect(() => {
    if (state.phase !== 'mage_reveal') return;
    mageTimer.current = setTimeout(() => dispatch({ type: 'END_MAGE' }), 3000);
    return () => { if (mageTimer.current) clearTimeout(mageTimer.current); };
  }, [state.phase]);

  // ── 偵察：2秒後にカードを裏返す ──────────────────────────────────────────
  useEffect(() => {
    const scoutedCard = state.cards.find(c => c.scouted);
    if (!scoutedCard) return;
    scoutTimer.current = setTimeout(() => {
      dispatch({ type: 'CLEAR_SCOUT', cardId: scoutedCard.id });
    }, 2000);
    return () => { if (scoutTimer.current) clearTimeout(scoutTimer.current); };
  }, [state.cards]);

  return { state, dispatch };
}
