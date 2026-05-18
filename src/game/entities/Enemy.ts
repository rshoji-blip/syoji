// 敵エンティティ - 5種の造形 + tankbear 3フェーズボスシステム

import Phaser from 'phaser'
import type { EnemyConfig } from '../data/EnemyData'
import type { BulletPool } from './BulletPool'
import { useGameStore } from '../../store/gameStore'
import { GAME_WIDTH } from '../GameConfig'

export class Enemy extends Phaser.GameObjects.Arc {
  config: EnemyConfig
  hp: number
  maxHp: number
  scale_factor: number

  // HPバー (シーンレベル)
  private hpBar: Phaser.GameObjects.Rectangle
  private hpBarBg: Phaser.GameObjects.Rectangle

  // ビジュアル装飾 (シーンレベル、位置を毎フレーム同期)
  private glowRing!: Phaser.GameObjects.Arc
  private eyeObjects: Phaser.GameObjects.Arc[] = []
  private armorRing: Phaser.GameObjects.Arc | null = null

  private bulletPool: BulletPool
  private shootTimer: number = 0
  private orbitAngle: number = 0
  private targetX: number = 0
  private chargeSpeed: number = 0
  private isCharging: boolean = false

  // ── ボスシステム ──────────────────────────────────────────────
  private bossPhase: 1 | 2 | 3 = 1
  private specialTimer: number = 0
  private dashTarget: { x: number; y: number } | null = null
  private isDashing = false
  private glowTween: Phaser.Tweens.Tween | null = null

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: EnemyConfig,
    scaleFactor: number,
    bulletPool: BulletPool
  ) {
    super(scene, x, y, config.size, config.color)
    this.config = config
    this.scale_factor = scaleFactor
    this.hp = Math.round(config.hp * scaleFactor)
    this.maxHp = this.hp
    this.bulletPool = bulletPool

    scene.add.existing(this)
    this.setDepth(5)

    // 共通: HPバー
    this.hpBarBg = scene.add
      .rectangle(x, y - config.size - 8, config.size * 2, 4, 0x222222)
      .setDepth(6)
    this.hpBar = scene.add
      .rectangle(x, y - config.size - 8, config.size * 2, 4, 0x00ff44)
      .setDepth(7)

    this.targetX = x
    this.orbitAngle = Math.random() * Math.PI * 2

    // 敵タイプ別のビジュアル構築
    this.buildVisuals(scene)
  }

  // ── ビジュアル構築 ────────────────────────────────────────────

  private buildVisuals(scene: Phaser.Scene): void {
    const { type, size, color } = this.config

    switch (type) {
      case 'mechdog':
        // 外側グロー (オレンジ)
        this.glowRing = scene.add
          .circle(this.x, this.y, size + 6, 0xff6600, 0.18)
          .setDepth(4)
        // 赤い目 ×2
        this.eyeObjects = [
          scene.add.circle(this.x - 6, this.y - 4, 3, 0xff0000).setDepth(8),
          scene.add.circle(this.x + 6, this.y - 4, 3, 0xff0000).setDepth(8),
        ]
        // メカリング
        this.armorRing = scene.add
          .circle(this.x, this.y, size - 4, 0x000000, 0)
          .setStrokeStyle(2, 0x886644, 0.7)
          .setDepth(6)
        break

      case 'dronebat':
        // 外側グロー (紫)
        this.glowRing = scene.add
          .circle(this.x, this.y, size + 8, 0xaa00ff, 0.2)
          .setDepth(4)
        // 単眼 (シアン)
        this.eyeObjects = [
          scene.add.circle(this.x, this.y - 2, 5, 0x00ffff).setDepth(8),
          scene.add.circle(this.x, this.y - 2, 2, 0xffffff).setDepth(9),
        ]
        // 翼の輝き
        this.armorRing = scene.add
          .circle(this.x, this.y, size + 3, 0xaa44ff, 0)
          .setStrokeStyle(1.5, 0xcc66ff, 0.5)
          .setDepth(4)
        // グロー脈動アニメ
        this.glowTween = scene.tweens.add({
          targets: this.glowRing,
          alpha: 0.05,
          duration: 600,
          yoyo: true,
          repeat: -1,
        })
        break

      case 'ironbird':
        // 外側グロー (ブルー)
        this.glowRing = scene.add
          .circle(this.x, this.y, size + 7, 0x0066ff, 0.2)
          .setDepth(4)
        // 白い目 ×2
        this.eyeObjects = [
          scene.add.circle(this.x - 7, this.y - 3, 3, 0xffffff).setDepth(8),
          scene.add.circle(this.x + 7, this.y - 3, 3, 0xffffff).setDepth(8),
        ]
        this.armorRing = scene.add
          .circle(this.x, this.y, size - 2, 0x000000, 0)
          .setStrokeStyle(2, 0x4488ff, 0.6)
          .setDepth(6)
        break

      case 'tankbear':
        // ボス: 大きなグロー (最初は銀色)
        this.glowRing = scene.add
          .circle(this.x, this.y, size + 18, 0x888888, 0.15)
          .setDepth(4)
        // 4つの赤眼
        this.eyeObjects = [
          scene.add.circle(this.x - 10, this.y - 8, 4, 0xff0000).setDepth(8),
          scene.add.circle(this.x + 10, this.y - 8, 4, 0xff0000).setDepth(8),
          scene.add.circle(this.x - 10, this.y + 5, 4, 0xff3300).setDepth(8),
          scene.add.circle(this.x + 10, this.y + 5, 4, 0xff3300).setDepth(8),
        ]
        // 外装リング
        this.armorRing = scene.add
          .circle(this.x, this.y, size + 4, 0x000000, 0)
          .setStrokeStyle(3, 0x666666, 0.8)
          .setDepth(6)
        // ボスHP更新 (ゲームストアに通知)
        useGameStore.getState().setBossState({ hp: this.hp, maxHp: this.maxHp, phase: 1 })
        break

      case 'cyberwolf':
        // 外側グロー (サイバーグリーン)
        this.glowRing = scene.add
          .circle(this.x, this.y, size + 9, 0x00ffaa, 0.18)
          .setDepth(4)
        // シアン目 ×2
        this.eyeObjects = [
          scene.add.circle(this.x - 7, this.y - 5, 3, 0x00ffdd).setDepth(8),
          scene.add.circle(this.x + 7, this.y - 5, 3, 0x00ffdd).setDepth(8),
        ]
        this.armorRing = scene.add
          .circle(this.x, this.y, size - 3, 0x000000, 0)
          .setStrokeStyle(2, 0x00ffaa, 0.5)
          .setDepth(6)
        this.glowTween = this.scene.tweens.add({
          targets: this.glowRing,
          alpha: 0.05,
          duration: 400,
          yoyo: true,
          repeat: -1,
        })
        break

      default:
        this.glowRing = scene.add
          .circle(this.x, this.y, this.config.size + 6, color, 0.15)
          .setDepth(4)
    }
  }

  // ── 更新 ───────────────────────────────────────────────────────

  update(delta: number, playerX: number, playerY: number): void {
    if (!this.active) return
    const dt = delta / 1000

    // ボスフェーズ判定
    if (this.config.type === 'tankbear') {
      this.updateBossPhase(delta, playerX, playerY, dt)
    } else {
      this.updateMovement(delta, dt)
    }

    // 通常射撃
    if (this.config.shootable && this.config.shootInterval) {
      const interval = this.config.type === 'tankbear'
        ? this.getBossShootInterval()
        : this.config.shootInterval / this.scale_factor

      this.shootTimer += delta
      if (this.shootTimer >= interval) {
        this.shootTimer = 0
        if (this.config.type === 'tankbear') {
          this.bossFire(playerX, playerY)
        } else {
          this.shoot(playerX, playerY)
        }
      }
    }

    // ビジュアル位置同期
    this.syncVisuals()

    // HPバー位置同期
    const barY = this.y - this.config.size - 8
    this.hpBar.setPosition(this.x, barY)
    this.hpBarBg.setPosition(this.x, barY)
  }

  // ── 移動パターン ──────────────────────────────────────────────

  private updateMovement(_delta: number, dt: number): void {
    const speed = this.config.speed * this.scale_factor * 0.7

    switch (this.config.movePattern) {
      case 'straight':
        this.y += speed * dt
        break

      case 'zigzag':
        this.y += speed * dt
        this.x += Math.sin(this.y * 0.03) * speed * 0.6 * dt
        break

      case 'charge':
        if (!this.isCharging && this.y > 100) {
          this.isCharging = true
          this.chargeSpeed = speed * 1.5
        }
        if (this.isCharging) {
          const dx = this.targetX - this.x
          this.x += Math.sign(dx) * Math.min(Math.abs(dx), this.chargeSpeed * dt)
          this.y += speed * 0.5 * dt
        } else {
          this.y += speed * dt
        }
        break

      case 'orbit': {
        this.orbitAngle += 2.5 * dt
        this.x = Phaser.Math.Clamp(
          this.x + Math.cos(this.orbitAngle) * 1.5,
          20,
          GAME_WIDTH - 20
        )
        this.y += speed * 0.4 * dt
        break
      }

      case 'sniper':
        this.y += speed * 0.3 * dt
        this.x += Math.sin(this.y * 0.015) * 40 * dt
        break
    }
  }

  // ── ボスシステム ──────────────────────────────────────────────

  private updateBossPhase(
    delta: number,
    playerX: number,
    playerY: number,
    dt: number
  ): void {
    const hpRatio = this.hp / this.maxHp
    const newPhase: 1 | 2 | 3 = hpRatio > 0.6 ? 1 : hpRatio > 0.3 ? 2 : 3

    if (newPhase !== this.bossPhase) {
      this.bossPhase = newPhase
      this.onBossPhaseChange(newPhase)
    }

    // フェーズ別移動
    const baseSpeed = this.config.speed * this.scale_factor * 0.7
    const phaseSpeed = baseSpeed * (this.bossPhase === 3 ? 1.6 : this.bossPhase === 2 ? 1.25 : 1.0)

    if (this.isDashing && this.dashTarget) {
      // ダッシュ: プレイヤー位置へ高速移動
      const dx = this.dashTarget.x - this.x
      const dy = this.dashTarget.y - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 15) {
        this.isDashing = false
        this.dashTarget = null
      } else {
        const dashSpeed = phaseSpeed * 2.5
        this.x += (dx / dist) * dashSpeed * dt
        this.y += (dy / dist) * dashSpeed * dt
      }
    } else {
      // 通常: 画面上部をゆっくり横移動
      if (this.y < 180) {
        this.y += phaseSpeed * dt
      } else {
        // 左右往復
        this.x += Math.sin(this.y * 0.008 + this.orbitAngle) * phaseSpeed * 0.5 * dt
        this.x = Phaser.Math.Clamp(this.x, 50, GAME_WIDTH - 50)
      }
    }

    // フェーズ2・3 特殊攻撃タイマー
    if (this.bossPhase >= 2) {
      this.specialTimer += delta
      const specialInterval = this.bossPhase === 3 ? 2200 : 3800
      if (this.specialTimer >= specialInterval) {
        this.specialTimer = 0
        this.doSpecialAttack(playerX, playerY)
      }
    }

    // ストア更新 (UIのボスHPバー用)
    useGameStore.getState().setBossState({
      hp: this.hp,
      maxHp: this.maxHp,
      phase: this.bossPhase,
    })
  }

  private onBossPhaseChange(phase: 1 | 2 | 3): void {
    // グロー色をフェーズに合わせて変更
    const glowColor = phase === 3 ? 0xff2200 : phase === 2 ? 0xff6600 : 0x888888
    this.glowRing.setFillStyle(glowColor, phase === 3 ? 0.35 : 0.22)
    if (this.armorRing) {
      this.armorRing.setStrokeStyle(3, phase === 3 ? 0xff0000 : phase === 2 ? 0xff6600 : 0x666666, 0.8)
    }
    // 本体の色変化
    this.setFillStyle(phase === 3 ? 0xcc2200 : phase === 2 ? 0xaa5500 : 0x888888)

    // 脈動アニメ (フェーズ3は高速)
    if (this.glowTween) this.glowTween.stop()
    this.glowTween = this.scene.tweens.add({
      targets: this.glowRing,
      alpha: phase === 3 ? 0.08 : 0.06,
      duration: phase === 3 ? 200 : 500,
      yoyo: true,
      repeat: -1,
    })

    // フェーズ告知テキスト
    const labels = ['', 'PHASE 2', 'BERSERK!!']
    if (phase >= 2) {
      const label = this.scene.add
        .text(this.x, this.y - 60, labels[phase - 1], {
          fontSize: phase === 3 ? '28px' : '22px',
          fontStyle: 'bold',
          color: phase === 3 ? '#ff2200' : '#ff6600',
          stroke: '#000',
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setDepth(200)

      this.scene.tweens.add({
        targets: label,
        y: label.y - 50,
        alpha: 0,
        duration: 1400,
        ease: 'Power2',
        onComplete: () => label.destroy(),
      })

      // ダッシュ予告 (フェーズ3)
      if (phase === 3) this.scene.cameras.main.shake(300, 0.012)
    }
  }

  private getBossShootInterval(): number {
    const base = this.config.shootInterval ?? 3000
    return this.bossPhase === 3 ? base * 0.35 : this.bossPhase === 2 ? base * 0.55 : base
  }

  private bossFire(playerX: number, playerY: number): void {
    const spreadCount = this.bossPhase === 3 ? 5 : this.bossPhase === 2 ? 3 : 1
    const baseAngle = Math.atan2(playerY - this.y, playerX - this.x)
    const spreadAngle = Math.PI / 10

    for (let i = 0; i < spreadCount; i++) {
      const offset = spreadCount > 1
        ? -spreadAngle * ((spreadCount - 1) / 2) + spreadAngle * i
        : 0
      const angle = baseAngle + offset
      const speed = 280
      this.bulletPool.fireEnemy(
        this.x,
        this.y + this.config.size,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        Math.round(this.config.damage * this.scale_factor * 0.65)
      )
    }
  }

  private doSpecialAttack(playerX: number, playerY: number): void {
    if (this.bossPhase === 3) {
      // 全方向8方向弾幕
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i
        this.bulletPool.fireEnemy(
          this.x, this.y,
          Math.cos(angle) * 220,
          Math.sin(angle) * 220,
          Math.round(this.config.damage * 0.5)
        )
      }
      // プレイヤー目掛けてダッシュ
      this.dashTarget = { x: playerX, y: playerY }
      this.isDashing = true
    } else {
      // フェーズ2: 扇形5方向
      const baseAngle = Math.atan2(playerY - this.y, playerX - this.x)
      for (let i = -2; i <= 2; i++) {
        const angle = baseAngle + i * (Math.PI / 10)
        this.bulletPool.fireEnemy(
          this.x, this.y,
          Math.cos(angle) * 250,
          Math.sin(angle) * 250,
          Math.round(this.config.damage * 0.55)
        )
      }
    }
  }

  // ── 通常射撃 ─────────────────────────────────────────────────

  private shoot(targetX: number, targetY: number): void {
    const angle = Math.atan2(targetY - this.y, targetX - this.x)
    const speed = 265
    this.bulletPool.fireEnemy(
      this.x, this.y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      Math.round(this.config.damage * this.scale_factor * 0.68)
    )
  }

  // ── ビジュアル同期 ────────────────────────────────────────────

  private syncVisuals(): void {
    const { type } = this.config

    this.glowRing.setPosition(this.x, this.y)
    if (this.armorRing) this.armorRing.setPosition(this.x, this.y)

    // 目の位置は種別ごとにオフセット
    switch (type) {
      case 'mechdog':
        this.eyeObjects[0]?.setPosition(this.x - 6, this.y - 4)
        this.eyeObjects[1]?.setPosition(this.x + 6, this.y - 4)
        break
      case 'dronebat':
        this.eyeObjects[0]?.setPosition(this.x, this.y - 2)
        this.eyeObjects[1]?.setPosition(this.x, this.y - 2)
        break
      case 'ironbird':
        this.eyeObjects[0]?.setPosition(this.x - 7, this.y - 3)
        this.eyeObjects[1]?.setPosition(this.x + 7, this.y - 3)
        break
      case 'tankbear':
        this.eyeObjects[0]?.setPosition(this.x - 10, this.y - 8)
        this.eyeObjects[1]?.setPosition(this.x + 10, this.y - 8)
        this.eyeObjects[2]?.setPosition(this.x - 10, this.y + 5)
        this.eyeObjects[3]?.setPosition(this.x + 10, this.y + 5)
        break
      case 'cyberwolf':
        this.eyeObjects[0]?.setPosition(this.x - 7, this.y - 5)
        this.eyeObjects[1]?.setPosition(this.x + 7, this.y - 5)
        break
    }
  }

  // ── ダメージ・死亡 ────────────────────────────────────────────

  takeDamage(damage: number): boolean {
    this.hp -= damage
    const ratio = Math.max(0, this.hp / this.maxHp)
    this.hpBar.setScale(ratio, 1)

    // ダメージフラッシュ
    this.setFillStyle(0xffffff)
    this.scene.time.delayedCall(80, () => {
      if (!this.active) return
      // フェーズに応じた色に戻す
      const phaseColor = this.bossPhase === 3 ? 0xcc2200
        : this.bossPhase === 2 ? 0xaa5500
        : this.config.color
      this.setFillStyle(this.config.type === 'tankbear' ? phaseColor : this.config.color)
    })

    return this.hp <= 0
  }

  die(): void {
    if (this.config.type === 'tankbear') {
      useGameStore.getState().setBossState(null)
    }

    this.hpBar.destroy()
    this.hpBarBg.destroy()
    this.glowRing.destroy()
    this.eyeObjects.forEach((e) => e.destroy())
    this.armorRing?.destroy()
    this.glowTween?.stop()

    this.destroy()
  }
}
