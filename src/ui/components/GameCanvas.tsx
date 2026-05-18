// Phaserゲームのマウントポイント

import { useRef } from 'react'
import { useGameBridge } from '../hooks/useGameBridge'
import { SkillSelectOverlay } from './SkillSelectOverlay'
import { ResultOverlay } from './ResultOverlay'
import { useGameStore } from '../../store/gameStore'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resumeGame } = useGameBridge(containerRef)
  const phase = useGameStore((s) => s.phase)

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-dark-bg">
      {/* Phaserキャンバスコンテナ */}
      <div ref={containerRef} className="relative" />

      {/* スキル選択オーバーレイ */}
      {phase === 'skillSelect' && (
        <SkillSelectOverlay onSelect={resumeGame} />
      )}

      {/* リザルトオーバーレイ */}
      {phase === 'result' && <ResultOverlay />}
    </div>
  )
}
