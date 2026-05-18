// プレイヤーエンティティ

import Phaser from 'phaser'
import type { BulletPool } from './BulletPool'
import { useGameStore } from '../../store/gameStore'
import { GAME_WIDTH, GAME_HEIGHT } from '../GameConfig'

export class Player extends Phaser.GameObjects.Container {
  private body_shape: Phaser.GameObjects.Polygon
  private thruster: Phaser.GameObjects.Arc
  private fireTimer: number = 0
  private invincible: boolean = false
  private invincibleTimer: number = 0
  private shieldRegenTimer: number = 0
  private bulletPool: BulletPool
  private targetX: number = 0
  private targetY: number = 0

  constructor(scene: Phaser.Scene, x: number, y: number, bulletPool: BulletPool) {
    super(scene, x, y)

    this.bulletPool = bulletPool
    this.targetX = x
    this.targetY = y

    // 機体本体 (三角形)
    this.body_shape = scene.add.polygon(0, 0, [
      0, -24,
      -16, 12,
      16, 12,
    ], 0x00f5ff)

    // スラスター (後部の光)
    this.thruster = scene.add.circle(0, 14, 6, 0xff6600)

    this.add([this.thruster, this.body_shape])
    scene.add.existing(this)
    this.setDepth(20)

    this.setupInput(scene)

    // スラスターアニメ
    scene.tweens.add({
      targets: this.thruster,
      scaleY: 0.5,
      alpha: 0.6,
      duration: 200,
      yoyo: true,
      repeat: -1,
    })
  }

  private setupInput(scene: Phaser.Scene): void {
    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.targetX = Phaser.Math.Clamp(pointer.x, 20, GAME_WIDTH - 20)
        this.targetY = Phaser.Math.Clamp(pointer.y, 60, GAME_HEIGHT - 60)
      }
    })
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.targetX = Phaser.Math.Clamp(pointer.x, 20, GAME_WIDTH - 20)
      this.targetY = Phaser.Math.Clamp(pointer.y, 60, GAME_HEIGHT - 60)
    })
  }

  update(delta: number): void {
    const dt = delta / 1000
    const stats = useGameStore.getState().playerStats

    // ポインタに向かって滑らかに追従
    const dx = this.targetX - this.x
    const dy = this.targetY - this.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist > 2) {
      const moveSpeed = Math.min(stats.speed * dt, dist)
      const ratio = moveSpeed / dist
      this.x += dx * ratio
      this.y += dy * ratio
    }

    // 自動射撃
    this.fireTimer += delta
    if (this.fireTimer >= stats.fireRate) {
      this.fireTimer = 0
      this.fireBullets(stats)
    }

    // 無敵タイマー
    if (this.invincible) {
      this.invincibleTimer -= delta
      if (this.invincibleTimer <= 0) {
        this.invincible = false
        this.setAlpha(1)
      }
    }

    // シールド自動回復
    const hasShieldRegen = useGameStore
      .getState()
      .acquiredSkills.some((s) => s.skill.id === 'shield_regen')

    if (hasShieldRegen && stats.maxShield > 0) {
      this.shieldRegenTimer += delta
      if (this.shieldRegenTimer >= 1000) {
        this.shieldRegenTimer = 0
        const store = useGameStore.getState()
        const newShield = Math.min(stats.maxShield, stats.shield + 10)
        store.setPlayerStats({ shield: newShield })
      }
    }
  }

  private fireBullets(stats: ReturnType<typeof useGameStore.getState>['playerStats']): void {
    const isCrit = Math.random() < stats.critChance
    const damage = isCrit
      ? Math.round(stats.bulletDamage * stats.critMultiplier)
      : stats.bulletDamage

    const acquiredIds = new Set(
      useGameStore.getState().acquiredSkills.map((a) => a.skill.id)
    )
    const isPiercing = acquiredIds.has('piercing_shot')
    const isExplosive = acquiredIds.has('explosive_shot')
    const isSpread = acquiredIds.has('spread_shot')

    if (isSpread) {
      // 扇形3方向
      const angles = [-0.3, 0, 0.3]
      angles.forEach((offset) => {
        this.bulletPool.fire(
          this.x,
          this.y - 20,
          Math.sin(offset) * stats.bulletSpeed,
          -Math.cos(offset) * stats.bulletSpeed,
          damage,
          isCrit,
          isPiercing,
          isExplosive
        )
      })
    } else {
      // 通常: bulletCount 発
      const spread = (stats.bulletCount - 1) * 12
      for (let i = 0; i < stats.bulletCount; i++) {
        const offsetX = stats.bulletCount > 1
          ? -spread / 2 + i * (spread / (stats.bulletCount - 1))
          : 0
        this.bulletPool.fire(
          this.x + offsetX,
          this.y - 20,
          offsetX * 0.8,
          -stats.bulletSpeed,
          damage,
          isCrit,
          isPiercing,
          isExplosive
        )
      }
    }
  }

  takeDamage(damage: number): void {
    if (this.invincible) return

    const store = useGameStore.getState()
    const stats = store.playerStats
    let remaining = damage

    // シールドで先に吸収
    if (stats.shield > 0) {
      const absorbed = Math.min(stats.shield, remaining)
      remaining -= absorbed
      store.setPlayerStats({ shield: stats.shield - absorbed })
    }

    if (remaining > 0) {
      const newHp = Math.max(0, stats.hp - remaining)
      store.setPlayerStats({ hp: newHp })
    }

    // 無敵時間
    this.invincible = true
    this.invincibleTimer = 1500
  }

  isInvincible(): boolean { return this.invincible }
}
