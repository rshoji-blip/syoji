'use client';

import { useEffect, useRef, useState } from 'react';
import { GameState, GameAction, SkillId, PlayerIdx } from '@/lib/memory-kingdom-game/types';
import { MatchEffect, useMatchFloats } from './MatchEffect';
import SkillCutin from './SkillCutin';
import SetCompleteDrama from './SetCompleteDrama';

interface Props {
  state: GameState;
  dispatch: (a: GameAction) => void;
  myPlayerIdx?: PlayerIdx;
}

interface CutinEntry {
  id: number;
  skillId: SkillId;
  playerIdx: PlayerIdx;
  playerName: string;
}

const PLAYER_COLORS = ['#f97316', '#3b82f6'] as const;

export default function EffectsLayer({ state, dispatch, myPlayerIdx }: Props) {
  const { floats, addFloat } = useMatchFloats();

  // cutin queue
  const [cutin, setCutin] = useState<CutinEntry | null>(null);
  const cutinQueueRef = useRef<CutinEntry[]>([]);
  let cutinId = useRef(0);

  function enqueueCutin(entry: Omit<CutinEntry, 'id'>) {
    const newEntry = { ...entry, id: cutinId.current++ };
    cutinQueueRef.current.push(newEntry);
    if (!cutin) flushCutin();
  }

  function flushCutin() {
    const next = cutinQueueRef.current.shift();
    setCutin(next ?? null);
  }

  // ── previous state tracking ───────────────────────────────────────────────
  const prevRef = useRef(state);

  useEffect(() => {
    const prev = prevRef.current;
    const cur = state;
    prevRef.current = cur;

    // ── match effect: score increased (RESOLVE fired) ──────────────────────
    if (prev.phase === 'resolving' && cur.phase !== 'resolving') {
      const cp = prev.currentPlayer;
      const prevScore = prev.players[cp].score;
      const curScore  = cur.players[cp].score;
      if (curScore > prevScore) {
        // position: center of card grid area (approx)
        const x = 195;
        const y = 320;
        addFloat(x, y, prev.consecutiveMatches, cp);
      }
    }

    // ── skill cutin: USE_SKILL → phase changed to skill phase ─────────────
    const skillPhases = ['scout_target', 'steal_target', 'mage_reveal'] as const;
    if (!skillPhases.includes(prev.phase as typeof skillPhases[number]) &&
        skillPhases.includes(cur.phase as typeof skillPhases[number])) {
      const skillMap: Record<string, SkillId> = {
        scout_target: 'scout',
        steal_target: 'steal',
        mage_reveal: 'seal', // seal triggers mage_reveal phase? Actually it triggers via bonus
      };
      // detect which skill was just used by checking sp delta
      for (let pi = 0; pi < 2; pi++) {
        const pIdx = pi as PlayerIdx;
        if (prev.players[pIdx].sp !== cur.players[pIdx].sp) {
          const spDiff = prev.players[pIdx].sp - cur.players[pIdx].sp;
          const skillId: SkillId | null = spDiff === 1 ? 'scout'
            : spDiff === 2 ? (cur.phase === 'steal_target' ? 'steal' : 'extra')
            : spDiff === 3 ? 'steal'
            : null;
          if (skillId) {
            enqueueCutin({
              skillId,
              playerIdx: pIdx,
              playerName: cur.players[pIdx].name,
            });
          }
          break;
        }
      }
    }

    // Also detect 'extra' or 'seal' skills (no phase change, but sp drops on playing phase)
    if (cur.phase === 'playing' && prev.phase === 'playing') {
      for (let pi = 0; pi < 2; pi++) {
        const pIdx = pi as PlayerIdx;
        const spDiff = prev.players[pIdx].sp - cur.players[pIdx].sp;
        if (spDiff === 2) {
          // could be seal or extra – check memorySealed or extraTurn
          const skillId: SkillId = cur.players[pIdx].extraTurn ? 'extra' : 'seal';
          enqueueCutin({
            skillId,
            playerIdx: pIdx,
            playerName: cur.players[pIdx].name,
          });
          break;
        }
      }
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ── set bonus drama ───────────────────────────────────────────────────────
  const showSetDrama = state.phase === 'set_bonus' && state.pendingBonus !== null;

  return (
    <>
      {/* floating score + rings */}
      <MatchEffect floats={floats} />

      {/* skill cutin */}
      {cutin && (
        <SkillCutin
          key={cutin.id}
          skillId={cutin.skillId}
          playerName={cutin.playerName}
          playerColor={PLAYER_COLORS[cutin.playerIdx]}
          onDone={flushCutin}
        />
      )}

      {/* set complete drama (replaces boring popup) */}
      {showSetDrama && state.pendingBonus && (
        <SetCompleteDrama
          setType={state.pendingBonus.setType}
          player={state.pendingBonus.player}
          playerName={state.players[state.pendingBonus.player].name}
          onClose={() => dispatch({ type: 'CLOSE_BONUS' })}
        />
      )}
    </>
  );
}
