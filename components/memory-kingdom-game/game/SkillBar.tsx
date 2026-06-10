'use client';

import { PlayerState, SkillId, GamePhase } from '@/lib/memory-kingdom-game/types';
import { SKILL_DEFS } from '@/lib/memory-kingdom-game/constants';

interface Props {
  player: PlayerState;
  phase: GamePhase;
  onUseSkill: (id: SkillId) => void;
}

export default function SkillBar({ player, phase, onUseSkill }: Props) {
  const canAct = phase === 'playing' || phase === 'awaiting';

  return (
    <div className="flex gap-1.5 px-3 py-1.5">
      {player.skills.map(skillId => {
        const def = SKILL_DEFS.find(s => s.id === skillId)!;
        const canAfford = player.sp >= def.sp;
        const active = canAct && canAfford;

        return (
          <button
            key={skillId}
            onClick={() => active && onUseSkill(skillId)}
            disabled={!active}
            title={def.desc}
            className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all active:scale-95"
            style={{
              background: active
                ? 'linear-gradient(135deg, rgba(255,150,0,0.2), rgba(255,80,0,0.1))'
                : 'rgba(255,255,255,0.04)',
              border: active
                ? '1.5px solid rgba(255,180,50,0.5)'
                : '1.5px solid rgba(255,255,255,0.07)',
              opacity: active ? 1 : 0.4,
            }}
          >
            <span className="text-base leading-none">{def.icon}</span>
            <span className="text-white text-[10px] font-bold leading-none">{def.name}</span>
            <span
              className="text-[9px] font-bold leading-none px-1.5 py-0.5 rounded-full"
              style={{
                background: canAfford ? 'rgba(100,200,255,0.2)' : 'rgba(255,255,255,0.08)',
                color: canAfford ? '#7dd3fc' : '#64748b',
              }}
            >
              SP{def.sp}
            </span>
          </button>
        );
      })}
    </div>
  );
}
