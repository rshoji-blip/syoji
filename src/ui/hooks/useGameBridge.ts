// React ↔ Phaser のブリッジフック

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { BootScene } from '../../game/scenes/BootScene'
import { TitleScene } from '../../game/scenes/TitleScene'
import { GameScene } from '../../game/scenes/GameScene'
import { UIScene } from '../../game/scenes/UIScene'
import { ResultScene } from '../../game/scenes/ResultScene'
import { GAME_WIDTH, GAME_HEIGHT } from '../../game/GameConfig'

export function useGameBridge(containerRef: React.RefObject<HTMLDivElement | null>) {
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: containerRef.current,
      backgroundColor: '#0a0a1a',
      scene: [BootScene, TitleScene, GameScene, UIScene, ResultScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        antialias: false,
        pixelArt: false,
      },
      fps: {
        target: 60,
        forceSetTimeOut: false,
      },
    }

    gameRef.current = new Phaser.Game(config)

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [containerRef])

  // スキル選択後にゲームを再開させるメソッド
  const resumeGame = (nextWave: number) => {
    const gameScene = gameRef.current?.scene.getScene('GameScene') as
      | (Phaser.Scene & { resumeAfterSkillSelect: (wave: number) => void })
      | undefined
    gameScene?.resumeAfterSkillSelect(nextWave)
  }

  return { gameRef, resumeGame }
}
