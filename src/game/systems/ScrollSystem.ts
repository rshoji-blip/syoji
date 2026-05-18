// 背景スクロールシステム (パーティクル風の星フィールド)

import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../GameConfig'

interface StarLayer {
  stars: Phaser.GameObjects.Arc[]
  speed: number
}

export class ScrollSystem {
  private scene: Phaser.Scene
  private layers: StarLayer[] = []
  private bgSpeed: number = 80

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.createStarfield()
  }

  private createStarfield(): void {
    // 3レイヤーの星を生成 (遠い・中間・近い)
    const layerConfigs = [
      { count: 60, speed: 40, size: 1, alpha: 0.4 },
      { count: 30, speed: 80, size: 1.5, alpha: 0.6 },
      { count: 15, speed: 140, size: 2, alpha: 0.9 },
    ]

    layerConfigs.forEach((cfg, i) => {
      const stars: Phaser.GameObjects.Arc[] = []
      for (let j = 0; j < cfg.count; j++) {
        const star = this.scene.add
          .circle(
            Phaser.Math.Between(0, GAME_WIDTH),
            Phaser.Math.Between(0, GAME_HEIGHT),
            cfg.size,
            0xffffff
          )
          .setAlpha(cfg.alpha)
          .setDepth(i - 3)      // 背景の最奥に配置
          .setScrollFactor(0)   // カメラに追従させない
        stars.push(star)
      }
      this.layers.push({ stars, speed: cfg.speed })
    })
  }

  setSpeed(speed: number): void {
    this.bgSpeed = speed
    // suppress unused warning
    void this.bgSpeed
  }

  update(delta: number): void {
    const dt = delta / 1000

    this.layers.forEach((layer) => {
      layer.stars.forEach((star) => {
        star.y += layer.speed * dt

        // 画面下に出たら上に戻す
        if (star.y > GAME_HEIGHT + 10) {
          star.y = -10
          star.x = Phaser.Math.Between(0, GAME_WIDTH)
        }
      })
    })
  }

  destroy(): void {
    this.layers.forEach((layer) => {
      layer.stars.forEach((s) => s.destroy())
    })
    this.layers = []
  }
}
