// スキル選択UI (ウェーブクリア後に表示)

import { useGameStore } from '../../store/gameStore'
import { SkillSystem } from '../../game/systems/SkillSystem'
import type { Skill, SkillRarity } from '../../types/skill.types'

interface Props {
  onSelect: (nextWave: number) => void
}

const RARITY_STYLES: Record<SkillRarity, string> = {
  common: 'border-gray-400 bg-gray-800/80',
  rare: 'border-blue-400 bg-blue-900/60',
  epic: 'border-purple-400 bg-purple-900/60',
  legendary: 'border-yellow-400 bg-yellow-900/60',
}

const RARITY_TEXT: Record<SkillRarity, string> = {
  common: 'text-gray-300',
  rare: 'text-blue-300',
  epic: 'text-purple-300',
  legendary: 'text-yellow-300',
}

const RARITY_LABEL: Record<SkillRarity, string> = {
  common: 'COMMON',
  rare: 'RARE',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
}

export function SkillSelectOverlay({ onSelect }: Props) {
  const { skillCandidates, currentWave } = useGameStore()

  const handleSelect = (skill: Skill) => {
    SkillSystem.applySkill(skill)
    onSelect(currentWave + 1)
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm z-50">
      <h2 className="text-2xl font-bold text-neon-blue mb-1 tracking-widest">
        WAVE {currentWave} CLEAR!
      </h2>
      <p className="text-gray-400 mb-6 text-sm">スキルを選択してください</p>

      <div className="flex flex-col gap-4 w-full max-w-sm px-4">
        {skillCandidates.map((skill) => (
          <button
            key={skill.id}
            onClick={() => handleSelect(skill)}
            className={`
              border-2 rounded-xl p-4 text-left transition-all duration-200
              hover:scale-105 active:scale-95 cursor-pointer
              ${RARITY_STYLES[skill.rarity]}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{skill.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-white text-base">{skill.name}</span>
                  <span
                    className={`text-xs font-bold tracking-wide ${RARITY_TEXT[skill.rarity]}`}
                  >
                    {RARITY_LABEL[skill.rarity]}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">{skill.description}</p>
              </div>
            </div>
          </button>
        ))}

        {skillCandidates.length === 0 && (
          <p className="text-gray-500 text-center">利用可能なスキルがありません</p>
        )}
      </div>
    </div>
  )
}
