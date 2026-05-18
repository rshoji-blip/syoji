// Phaserゲームのマウントポイント

import { useRef, useState } from 'react'
import { useGameBridge } from '../hooks/useGameBridge'
import { SkillSelectOverlay } from './SkillSelectOverlay'
import { ResultOverlay } from './ResultOverlay'
import { TutorialOverlay, hasTutorialBeenSeen } from './TutorialOverlay'
import { useGameStore } from '../../store/gameStore'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resumeGame } = useGameBridge(containerRef)
  const phase = useGameStore((s) => s.phase)

  // 初回起動判定: チュートリアル未表示なら表示フラグON
  const [showTutorial, setShowTutorial] = useState(() => !hasTutorialBeenSeen())

  const handleTutorialClose = () => {
    setShowTutorial(false)
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0a0a1a]">
      {/* Phaserキャンバスコンテナ */}
      <div ref={containerRef} className="relative" />

      {/* チュートリアル (初回のみ、ゲーム前に表示) */}
      {showTutorial && <TutorialOverlay onClose={handleTutorialClose} />}

      {/* スキル選択オーバーレイ */}
      {!showTutorial && phase === 'skillSelect' && (
        <SkillSelectOverlay onSelect={resumeGame} />
      )}

      {/* リザルトオーバーレイ */}
      {!showTutorial && phase === 'result' && <ResultOverlay />}
    </div>
  )
}
