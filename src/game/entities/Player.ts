// プレイヤーエンティティ - サイバーフォックス戦士

import Phaser from 'phaser'
import type { BulletPool } from './BulletPool'
import { useGameStore } from '../../store/gameStore'
import { soundSystem } from '../systems/SoundSystem'
import { GAME_WIDTH, GAME_HEIGHT } from '../GameConfig'

export class Player extends Phaser.GameObjects.Container {
  private bodyGfx: Phaser.GameObjects.Graphics
  private thruster: Phaser.GameObjects.Arc
  private engineGlow: Phaser.GameObjects.Arc
  private shieldRing: Phaser.GameObjects.Arc
  private fireTimer: number = 0
  private trailTimer: number = 0
  private invincible: boolean = false
  private invincibleTimer: number = 0
  private shieldRegenTimer: number = 0
  private bulletPool: BulletPool
  private targetX: number = 0
  private targetY: number = 0

  private keyLeft!: Phaser.Input.Keyboard.Key
  private keyRight!: Phaser.Input.Keyboard.Key
  private keyUp!: Phaser.Input.Keyboard.Key
  private keyDown!: Phaser.Input.Keyboard.Key
  private keyA!: Phaser.Input.Keyboard.Key
  private keyD!: Phaser.Input.Keyboard.Key
  private keyW!: Phaser.Input.Keyboard.Key
  private keyS!: Phaser.Input.Keyboard.Key

  constructor(scene: Phaser.Scene, x: number, y: number, bulletPool: BulletPool) {
    super(scene, x, y)

    this.bulletPool = bulletPool
    this.targetX = x
    this.targetY = y

    // エンジングロー
    this.engineGlow = scene.add.circle(0, 18, 15, 0xff6600, 0.28)
    // スラスター本体
    this.thruster = scene.add.circle(0, 16, 7, 0xff8800)

    // サイバーフォックス メカスーツ
    this.bodyGfx = scene.add.graphics()
    this.drawFoxBody()

    // シールドリング
    this.shieldRing = scene.add.circle(0, 0, 28, 0x00aaff, 0)
      .setStrokeStyle(2, 0x00aaff, 0.7)

    this.add([this.engineGlow, this.thruster, this.bodyGfx, this.shieldRing])
    scene.add.existing(this)
    this.setDepth(20)

    this.setupInput(scene)

    // スラスターアニメ
    scene.tweens.add({
      targets: [this.thruster, this.engineGlow],
      scaleY: 0.35,
      alpha: 0.45,
      duration: 160,
      yoyo: true,
      repeat: -1,
    })
  }

  private drawFoxBody(): void {
    const g = this.bodyGfx
    g.clear()

    // ── スラスターフレーム (後部) ──
    g.fillStyle(0x222d3d, 1)
    g.fillRect(-9, 7, 18, 13)

    // ── メインボディ (ダークブルー装甲) ──
    g.fillStyle(0x1a3060, 1)
    g.fillRect(-11, -8, 22, 20)
    // 機首 (三角)
    g.fillTriangle(0, -30, -11, -8, 11, -8)

    // ── ショルダーウィング ──
    g.fillStyle(0x25447a, 1)
    g.fillTriangle(-11, -3, -23, 4, -11, 11)
    g.fillTriangle(11, -3, 23, 4, 11, 11)

    // ── 装甲ライン ──
    g.lineStyle(1, 0x4488cc, 0.55)
    g.lineBetween(-8, -22, 8, -22)
    g.lineBetween(-8, -22, -11, -8)
    g.lineBetween(8, -22, 11, -8)
    g.lineBetween(-11, -3, -11, 11)
    g.lineBetween(11, -3, 11, 11)

    // ── フォックスヘルメット ──
    g.fillStyle(0x2a3d52, 1)
    g.fillCircle(0, -20, 11)

    // ── フォックス耳 左 ──
    g.fillStyle(0x2a3d52, 1)
    g.fillTriangle(-7, -26, -19, -38, -3, -24)
    // 耳の内側 (オレンジ)
    g.fillStyle(0xff6600, 0.9)
    g.fillTriangle(-8, -26, -16, -35, -5, -24)

    // ── フォックス耳 右 ──
    g.fillStyle(0x2a3d52, 1)
    g.fillTriangle(7, -26, 19, -38, 3, -24)
    g.fillStyle(0xff6600, 0.9)
    g.fillTriangle(8, -26, 16, -35, 5, -24)

    // ── バイザー (シアン) ──
    g.fillStyle(0x00f5ff, 0.92)
    g.fillEllipse(0, -21, 16, 9)
    // バイザーのハイライト
    g.fillStyle(0xffffff, 0.35)
    g.fillEllipse(-2, -23, 7, 3.5)

    // ── エネルギーキャノンポート ──
    g.fillStyle(0x33aaff, 1)
    g.fillCircle(-8, -29, 3)
    g.fillCircle(8, -29, 3)
    g.fillStyle(0xaaeeff, 0.9)
    g.fillCircle(-8, -29, 1.5)
    g.fillCircle(8, -29, 1.5)

    // ── 胸のエネルギーコア ──
    g.fillStyle(0x00f5ff, 0.6)
    g.fillCircle(0, 0, 4)
    g.fillStyle(0xffffff, 0.5)
    g.fillCircle(0, 0, 2)
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

    if (scene.input.keyboard) {
      this.keyLeft  = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
      this.keyRight = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
      this.keyUp    = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
      this.keyDown  = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
      this.keyA     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
      this.keyD     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      this.keyW     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
      this.keyS     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    }
  }

  update(delta: number): void {
    const dt = delta / 1000
    const stats = useGameStore.getState().playerStats

    // ── キーボード移動 ──
    const kbSpeed = stats.speed * dt
    if (this.keyLeft?.isDown || this.keyA?.isDown) {
      this.targetX = Math.max(20, this.targetX - kbSpeed)
    }
    if (this.keyRight?.isDown || this.keyD?.isDown) {
      this.targetX = Math.min(GAME_WIDTH - 20, this.targetX + kbSpeed)
    }
    if (this.keyUp?.isDown || this.keyW?.isDown) {
      this.targetY = Math.max(60, this.targetY - kbSpeed)
    }
    if (this.keyDown?.isDown || this.keyS?.isDown) {
      this.targetY = Math.min(GAME_HEIGHT - 60, this.targetY + kbSpeed)
    }

    // ── ポインタ追従 (慣性あり) ──
    const dx = this.targetX - this.x
    const dy = this.targetY - this.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist > 2) {
      const moveSpeed = Math.min(stats.speed * dt, dist)
      const ratio = moveSpeed / dist
      this.x += dx * ratio
      this.y += dy * ratio
    }

    // ── 機体傾き ──
    const tiltTarget = Phaser.Math.Clamp(dx * 0.04, -0.3, 0.3)
    this.rotation += (tiltTarget - this.rotation) * 0.15

    // ── エンジントレイル ──
    this.trailTimer -= delta
    if (this.trailTimer <= 0) {
      this.trailTimer = 38
      const trail = this.scene.add
        .circle(this.x, this.y + 16, 5, 0xff6600, 0.4)
        .setDepth(15)
      this.scene.tweens.add({
        targets: trail,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 170,
        onComplete: () => trail.destroy(),
      })
    }

    // ── 自動射撃 ──
    this.fireTimer += delta
    if (this.fireTimer >= stats.fireRate) {
      this.fireTimer = 0
      this.fireBullets(stats)
    }

    // ── 無敵タイマー ──
    if (this.invincible) {
      this.invincibleTimer -= delta
      if (this.invincibleTimer <= 0) {
        this.invincible = false
        this.setAlpha(1)
      }
    }

    // ── シールドリング表示 ──
    const hasShield = stats.maxShield > 0 && stats.shield > 0
    this.shieldRing.setVisible(hasShield)
    if (hasShield) {
      this.shieldRing.setAlpha(0.4 + (stats.shield / stats.maxShield) * 0.4)
    }

    // ── シールド自動回復 ──
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

    this.spawnMuzzleFlash()
    soundSystem.shoot()

    if (isSpread) {
      const angles = [-0.3, 0, 0.3]
      angles.forEach((offset) => {
        this.bulletPool.fire(
          this.x, this.y - 20,
          Math.sin(offset) * stats.bulletSpeed,
          -Math.cos(offset) * stats.bulletSpeed,
          damage, isCrit, isPiercing, isExplosive
        )
      })
    } else {
      const spread = (stats.bulletCount - 1) * 12
      for (let i = 0; i < stats.bulletCount; i++) {
        const offsetX = stats.bulletCount > 1
          ? -spread / 2 + i * (spread / (stats.bulletCount - 1))
          : 0
        this.bulletPool.fire(
          this.x + offsetX, this.y - 20,
          offsetX * 0.8,
          -stats.bulletSpeed,
          damage, isCrit, isPiercing, isExplosive
        )
      }
    }
  }

  private spawnMuzzleFlash(): void {
    const flash = this.scene.add
      .circle(this.x, this.y - 32, 9, 0xaaeeff, 0.9)
      .setDepth(25)
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 2.5,
      scaleY: 2.5,
      duration: 65,
      onComplete: () => flash.destroy(),
    })
  }

  takeDamage(damage: number): void {
    if (this.invincible) return

    const store = useGameStore.getState()
    const stats = store.playerStats
    let remaining = damage

    if (stats.shield > 0) {
      const absorbed = Math.min(stats.shield, remaining)
      remaining -= absorbed
      store.setPlayerStats({ shield: stats.shield - absorbed })
    }

    if (remaining > 0) {
      store.setPlayerStats({ hp: Math.max(0, stats.hp - remaining) })
    }

    soundSystem.playerDamage()

    this.invincible = true
    this.invincibleTimer = 1200
  }

  getHitRadius(): number { return 10 }

  isInvincible(): boolean { return this.invincible }
}
