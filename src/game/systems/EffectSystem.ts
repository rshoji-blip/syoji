// パーティクル・エフェクト管理システム

import Phaser from 'phaser'

export class EffectSystem {
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  // 敵撃破エフェクト
  explodeEnemy(x: number, y: number, color: number): void {
    const particles = this.scene.add.particles(x, y, '__DEFAULT', {
      speed: { min: 80, max: 220 },
      scale: { start: 0.6, end: 0 },
      tint: color,
      lifespan: 500,
      quantity: 12,
      emitting: false,
    })
    particles.explode(12)
    this.scene.time.delayedCall(600, () => particles.destroy())
  }

  // 弾ヒットエフェクト
  hitEffect(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y, '__DEFAULT', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.3, end: 0 },
      tint: 0x00f5ff,
      lifespan: 250,
      quantity: 6,
      emitting: false,
    })
    particles.explode(6)
    this.scene.time.delayedCall(300, () => particles.destroy())
  }

  // クリティカルヒットエフェクト (大きめ)
  critEffect(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y, '__DEFAULT', {
      speed: { min: 100, max: 300 },
      scale: { start: 0.8, end: 0 },
      tint: 0xffee00,
      lifespan: 400,
      quantity: 18,
      emitting: false,
    })
    particles.explode(18)
    this.scene.time.delayedCall(500, () => particles.destroy())

    // フラッシュテキスト
    const text = this.scene.add
      .text(x, y - 20, 'CRITICAL!', {
        fontSize: '18px',
        color: '#ffee00',
        stroke: '#000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 700,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    })
  }

  // プレイヤーダメージフラッシュ
  playerDamageFlash(player: Phaser.GameObjects.GameObject): void {
    const cam = this.scene.cameras.main
    cam.shake(150, 0.005)

    // 赤フラッシュオーバーレイ
    const flash = this.scene.add
      .rectangle(0, 0, cam.width, cam.height, 0xff0044, 0.35)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(100)
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy(),
    })

    // プレイヤーの点滅
    this.scene.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        if (player.active) (player as Phaser.GameObjects.Shape).setAlpha(1)
      },
    })
  }

  // 爆発（ボス用）
  bigExplosion(x: number, y: number): void {
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 150, () => {
        this.explodeEnemy(
          x + Phaser.Math.Between(-40, 40),
          y + Phaser.Math.Between(-40, 40),
          0xff6600
        )
      })
    }
    this.scene.cameras.main.shake(300, 0.01)
  }

  // ウェーブクリア演出
  waveCompleteEffect(): void {
    const cam = this.scene.cameras.main
    const banner = this.scene.add
      .text(cam.width / 2, cam.height / 2, 'WAVE CLEAR!', {
        fontSize: '36px',
        color: '#00ff88',
        stroke: '#000',
        strokeThickness: 4,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200)
      .setAlpha(0)

    this.scene.tweens.add({
      targets: banner,
      alpha: 1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      hold: 600,
      onComplete: () => banner.destroy(),
    })
  }
}
