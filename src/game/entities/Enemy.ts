// 敵エンティティ - Crash Bandicoot風カートゥーンアニマルデザイン + tankbear 3フェーズボスシステム

import Phaser from 'phaser'
import type { EnemyConfig } from '../data/EnemyData'
import type { BulletPool } from './BulletPool'
import { useGameStore } from '../../store/gameStore'
import { GAME_WIDTH } from '../GameConfig'

export class Enemy extends Phaser.GameObjects.Container {
  config: EnemyConfig
  hp: number
  maxHp: number
  scale_factor: number

  private gfx: Phaser.GameObjects.Graphics
  private hpBarBg: Phaser.GameObjects.Rectangle
  private hpBar: Phaser.GameObjects.Rectangle

  private bulletPool: BulletPool
  private shootTimer: number = 0
  private orbitAngle: number = 0
  private targetX: number = 0
  private chargeSpeed: number = 0
  private isCharging: boolean = false

  private bossPhase: 1 | 2 | 3 = 1
  private specialTimer: number = 0
  private dashTarget: { x: number; y: number } | null = null
  private isDashing = false
  private pulseTween: Phaser.Tweens.Tween | null = null

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: EnemyConfig,
    scaleFactor: number,
    bulletPool: BulletPool
  ) {
    super(scene, x, y)
    this.config = config
    this.scale_factor = scaleFactor
    this.hp = Math.round(config.hp * scaleFactor)
    this.maxHp = this.hp
    this.bulletPool = bulletPool
    this.targetX = x
    this.orbitAngle = Math.random() * Math.PI * 2

    this.gfx = scene.add.graphics()
    this.add(this.gfx)

    const barW = config.size * 2.4
    const barY = -(config.size + 14)
    this.hpBarBg = scene.add.rectangle(0, barY, barW, 4, 0x222222).setOrigin(0.5, 0.5)
    this.hpBar = scene.add.rectangle(-barW / 2, barY, barW, 4, 0x00ff44).setOrigin(0, 0.5)
    this.add([this.hpBarBg, this.hpBar])

    scene.add.existing(this)
    this.setDepth(5)

    this.drawBody()

    if (config.type === 'tankbear') {
      useGameStore.getState().setBossState({ hp: this.hp, maxHp: this.maxHp, phase: 1 })
      this.startBossPulse()
    }
  }

  // ── ボディ描画 ─────────────────────────────────────────────────

  private drawBody(): void {
    this.gfx.clear()
    const s = this.config.size
    switch (this.config.type) {
      case 'mechdog':     this.drawMechdog(s); break
      case 'dronebat':    this.drawDronebat(s); break
      case 'ironbird':    this.drawIronbird(s); break
      case 'tankbear':    this.drawTankbear(s, 1); break
      case 'cyberwolf':   this.drawCyberwolf(s); break
      case 'ironmole':    this.drawIronmole(s); break
      case 'mechraccoon': this.drawMechraccoon(s); break
    }
  }

  // ── サイボーグ犬 (mechdog) ────────────────────────────────────

  private drawMechdog(s: number): void {
    const g = this.gfx
    // 垂れ耳
    g.fillStyle(0xc87941, 1)
    g.fillEllipse(-s * 0.72, -s * 0.5, s * 0.65, s * 1.1)
    g.fillEllipse(s * 0.72, -s * 0.5, s * 0.65, s * 1.1)
    // ボディ
    g.fillStyle(0xc87941, 1)
    g.fillCircle(0, 2, s)
    // お腹 (ベージュ)
    g.fillStyle(0xe8b87a, 1)
    g.fillCircle(0, s * 0.3, s * 0.62)
    // 鼻先
    g.fillStyle(0x221100, 1)
    g.fillCircle(0, s * 0.38, s * 0.18)
    // 赤い機械眼
    g.fillStyle(0xff2200, 1)
    g.fillCircle(-s * 0.37, -s * 0.12, s * 0.2)
    g.fillCircle(s * 0.37, -s * 0.12, s * 0.2)
    // 眼のハイライト
    g.fillStyle(0xffffff, 0.85)
    g.fillCircle(-s * 0.31, -s * 0.19, s * 0.08)
    g.fillCircle(s * 0.44, -s * 0.19, s * 0.08)
    // メカ首輪
    g.fillStyle(0x554433, 1)
    g.fillRect(-s * 0.55, s * 0.56, s * 1.1, s * 0.24)
    g.lineStyle(1.5, 0x887766, 1)
    g.strokeRect(-s * 0.55, s * 0.56, s * 1.1, s * 0.24)
    // 輪郭
    g.lineStyle(2, 0xa06030, 0.7)
    g.strokeCircle(0, 2, s)
  }

  // ── ドローンコウモリ (dronebat) ───────────────────────────────

  private drawDronebat(s: number): void {
    const g = this.gfx
    // 翼
    g.fillStyle(0x5511aa, 0.9)
    g.fillTriangle(-s * 2.3, s * 0.3, -s * 0.5, -s * 0.7, -s * 0.3, s * 0.6)
    g.fillTriangle(s * 2.3, s * 0.3, s * 0.5, -s * 0.7, s * 0.3, s * 0.6)
    // 翼の脈
    g.lineStyle(1, 0xaa55ff, 0.5)
    g.lineBetween(-s * 1.6, s * 0.1, -s * 0.45, -s * 0.3)
    g.lineBetween(s * 1.6, s * 0.1, s * 0.45, -s * 0.3)
    // ボディ
    g.fillStyle(0x7733aa, 1)
    g.fillCircle(0, 0, s)
    // お腹
    g.fillStyle(0xaa55cc, 1)
    g.fillCircle(0, s * 0.2, s * 0.55)
    // 耳 (コウモリ耳)
    g.fillStyle(0x7733aa, 1)
    g.fillTriangle(-s * 0.48, -s * 0.9, -s * 0.72, -s * 1.55, -s * 0.18, -s * 0.88)
    g.fillTriangle(s * 0.48, -s * 0.9, s * 0.72, -s * 1.55, s * 0.18, -s * 0.88)
    // 大きな黄色の目
    g.fillStyle(0xffee00, 1)
    g.fillCircle(-s * 0.33, -s * 0.1, s * 0.28)
    g.fillCircle(s * 0.33, -s * 0.1, s * 0.28)
    g.fillStyle(0x221100, 1)
    g.fillCircle(-s * 0.33, -s * 0.1, s * 0.15)
    g.fillCircle(s * 0.33, -s * 0.1, s * 0.15)
    g.fillStyle(0xffffff, 0.7)
    g.fillCircle(-s * 0.27, -s * 0.17, s * 0.07)
    g.fillCircle(s * 0.39, -s * 0.17, s * 0.07)
    // キバ
    g.fillStyle(0xffffff, 1)
    g.fillTriangle(-s * 0.16, s * 0.45, -s * 0.05, s * 0.72, s * 0.04, s * 0.46)
    g.fillTriangle(s * 0.16, s * 0.45, s * 0.05, s * 0.72, -s * 0.04, s * 0.46)
    // ドローンロータ
    g.lineStyle(2, 0xcc99ff, 0.7)
    g.strokeCircle(0, -s * 0.5, s * 0.3)
  }

  // ── 鉄鷹 (ironbird) ──────────────────────────────────────────

  private drawIronbird(s: number): void {
    const g = this.gfx
    // 羽根 (鋼鉄)
    g.fillStyle(0x2266cc, 0.9)
    g.fillTriangle(-s * 2.1, s * 0.2, -s * 0.4, -s * 0.45, -s * 0.3, s * 0.55)
    g.fillTriangle(s * 2.1, s * 0.2, s * 0.4, -s * 0.45, s * 0.3, s * 0.55)
    // 羽根の模様
    g.lineStyle(1, 0x4499ff, 0.6)
    g.lineBetween(-s * 1.3, 0, -s * 0.4, 0)
    g.lineBetween(s * 1.3, 0, s * 0.4, 0)
    g.lineBetween(-s * 0.9, -s * 0.22, -s * 0.38, s * 0.3)
    g.lineBetween(s * 0.9, -s * 0.22, s * 0.38, s * 0.3)
    // ボディ (縦長楕円)
    g.fillStyle(0x4488ee, 1)
    g.fillEllipse(0, 0, s * 1.3, s * 2.1)
    // お腹
    g.fillStyle(0xddeeff, 1)
    g.fillEllipse(0, s * 0.4, s * 0.7, s * 0.95)
    // 怒り眉
    g.lineStyle(3.5, 0x001133, 1)
    g.lineBetween(-s * 0.52, -s * 0.37, -s * 0.16, -s * 0.22)
    g.lineBetween(s * 0.16, -s * 0.22, s * 0.52, -s * 0.37)
    // 目
    g.fillStyle(0xff7700, 1)
    g.fillCircle(-s * 0.28, -s * 0.14, s * 0.2)
    g.fillCircle(s * 0.28, -s * 0.14, s * 0.2)
    g.fillStyle(0x000000, 1)
    g.fillCircle(-s * 0.28, -s * 0.14, s * 0.1)
    g.fillCircle(s * 0.28, -s * 0.14, s * 0.1)
    // オレンジのくちばし
    g.fillStyle(0xff8800, 1)
    g.fillTriangle(0, s * 0.85, -s * 0.22, s * 0.56, s * 0.22, s * 0.56)
  }

  // ── 機甲クマ BOSS (tankbear) - フェーズ別 ────────────────────

  private drawTankbear(s: number, phase: 1 | 2 | 3): void {
    const g = this.gfx
    const bodyColor  = phase === 3 ? 0xcc2200 : phase === 2 ? 0xaa5500 : 0x888888
    const armorColor = phase === 3 ? 0x880000 : phase === 2 ? 0x774400 : 0x555555
    const glowColor  = phase === 3 ? 0xff2200 : phase === 2 ? 0xff6600 : 0x888888
    const glowAlpha  = phase === 3 ? 0.35     : phase === 2 ? 0.25     : 0.12
    const ringColor  = phase === 3 ? 0xff0000 : phase === 2 ? 0xff6600 : 0x666666
    const eyeColor   = phase === 3 ? 0xff4400 : 0xff0000

    // ボスグロー
    g.fillStyle(glowColor, glowAlpha)
    g.fillCircle(0, 0, s + 18)
    // 耳 (丸い)
    g.fillStyle(bodyColor, 1)
    g.fillCircle(-s * 0.64, -s * 0.88, s * 0.35)
    g.fillCircle(s * 0.64, -s * 0.88, s * 0.35)
    g.fillStyle(0x553333, 1)
    g.fillCircle(-s * 0.64, -s * 0.88, s * 0.19)
    g.fillCircle(s * 0.64, -s * 0.88, s * 0.19)
    // 巨大ボディ
    g.fillStyle(bodyColor, 1)
    g.fillCircle(0, 0, s)
    // 腹部装甲プレート
    g.fillStyle(armorColor, 1)
    g.fillRect(-s * 0.55, -s * 0.12, s * 1.1, s * 1.05)
    g.lineStyle(2.5, bodyColor, 1)
    g.strokeRect(-s * 0.55, -s * 0.12, s * 1.1, s * 1.05)
    g.lineStyle(1.5, 0xbbbbbb, 0.6)
    g.lineBetween(-s * 0.55, s * 0.28, s * 0.55, s * 0.28)
    g.lineBetween(-s * 0.55, s * 0.6, s * 0.55, s * 0.6)
    // 顔
    g.fillStyle(bodyColor, 1)
    g.fillCircle(0, -s * 0.22, s * 0.72)
    // 鼻先
    g.fillStyle(phase === 3 ? 0x661100 : phase === 2 ? 0x664400 : 0x666666, 1)
    g.fillEllipse(0, s * 0.14, s * 0.7, s * 0.52)
    g.fillStyle(0x221100, 1)
    g.fillCircle(-s * 0.14, s * 0.18, s * 0.1)
    g.fillCircle(s * 0.14, s * 0.18, s * 0.1)
    // 4つの赤い目
    g.fillStyle(eyeColor, 1)
    g.fillCircle(-s * 0.36, -s * 0.52, s * 0.17)
    g.fillCircle(s * 0.36, -s * 0.52, s * 0.17)
    g.fillCircle(-s * 0.36, -s * 0.28, s * 0.13)
    g.fillCircle(s * 0.36, -s * 0.28, s * 0.13)
    g.fillStyle(0xffffff, 0.7)
    g.fillCircle(-s * 0.3, -s * 0.57, s * 0.07)
    g.fillCircle(s * 0.43, -s * 0.57, s * 0.07)
    // 外装リング
    g.lineStyle(3.5, ringColor, 0.9)
    g.strokeCircle(0, 0, s + 2)
  }

  // ── サイバーウルフ (cyberwolf) ────────────────────────────────

  private drawCyberwolf(s: number): void {
    const g = this.gfx
    // サイバーグロー
    g.fillStyle(0x00ffaa, 0.1)
    g.fillCircle(0, 0, s + 7)
    // とがった耳
    g.fillStyle(0x335544, 1)
    g.fillTriangle(-s * 0.52, -s * 0.78, -s * 0.82, -s * 1.65, -s * 0.18, -s * 0.78)
    g.fillTriangle(s * 0.52, -s * 0.78, s * 0.82, -s * 1.65, s * 0.18, -s * 0.78)
    g.fillStyle(0x885544, 1)
    g.fillTriangle(-s * 0.48, -s * 0.8, -s * 0.72, -s * 1.42, -s * 0.22, -s * 0.8)
    g.fillTriangle(s * 0.48, -s * 0.8, s * 0.72, -s * 1.42, s * 0.22, -s * 0.8)
    // ボディ
    g.fillStyle(0x335544, 1)
    g.fillCircle(0, 2, s)
    // お腹
    g.fillStyle(0x44775a, 1)
    g.fillEllipse(0, s * 0.48, s * 1.0, s * 0.85)
    // マズル
    g.fillStyle(0x4a6655, 1)
    g.fillEllipse(0, s * 0.27, s * 0.7, s * 0.55)
    g.fillStyle(0x221100, 1)
    g.fillCircle(-s * 0.12, s * 0.32, s * 0.09)
    g.fillCircle(s * 0.12, s * 0.32, s * 0.09)
    // シアン目 (スリット)
    g.fillStyle(0x00ffdd, 1)
    g.fillEllipse(-s * 0.34, -s * 0.16, s * 0.35, s * 0.22)
    g.fillEllipse(s * 0.34, -s * 0.16, s * 0.35, s * 0.22)
    g.fillStyle(0x001a11, 1)
    g.fillEllipse(-s * 0.34, -s * 0.16, s * 0.1, s * 0.22)
    g.fillEllipse(s * 0.34, -s * 0.16, s * 0.1, s * 0.22)
    // サイバーインプラント
    g.lineStyle(1.5, 0x00ffaa, 0.6)
    g.lineBetween(-s * 0.22, -s * 0.6, s * 0.22, -s * 0.6)
    g.lineStyle(1, 0x00ffaa, 0.4)
    g.strokeCircle(0, 2, s)
  }

  // ── 鉄モグラ (ironmole) ────────────────────────────────────────

  private drawIronmole(s: number): void {
    const g = this.gfx
    // ボディ
    g.fillStyle(0x885533, 1)
    g.fillCircle(0, 0, s)
    // お腹
    g.fillStyle(0xcc9966, 1)
    g.fillEllipse(0, s * 0.18, s * 0.92, s * 0.82)
    // 大きな前足 (左右)
    g.fillStyle(0x885533, 1)
    g.fillEllipse(-s * 1.0, s * 0.35, s * 0.55, s * 0.38)
    g.fillEllipse(s * 1.0, s * 0.35, s * 0.55, s * 0.38)
    g.fillStyle(0x554422, 1)
    g.fillCircle(-s * 1.18, s * 0.36, s * 0.18)
    g.fillCircle(s * 1.18, s * 0.36, s * 0.18)
    // 爪
    g.lineStyle(2, 0x222222, 1)
    for (let i = -1; i <= 1; i++) {
      g.lineBetween(-s * 1.18 + i * s * 0.1, s * 0.48, -s * 1.18 + i * s * 0.1, s * 0.66)
      g.lineBetween(s * 1.18 + i * s * 0.1, s * 0.48, s * 1.18 + i * s * 0.1, s * 0.66)
    }
    // スコップ鼻
    g.fillStyle(0x999999, 1)
    g.fillRect(-s * 0.34, s * 0.32, s * 0.68, s * 0.46)
    g.fillStyle(0xbbbbbb, 1)
    g.fillRect(-s * 0.4, s * 0.24, s * 0.8, s * 0.18)
    g.lineStyle(1.5, 0x666666, 1)
    g.strokeRect(-s * 0.34, s * 0.32, s * 0.68, s * 0.46)
    // 小さい目
    g.fillStyle(0x111100, 1)
    g.fillEllipse(-s * 0.28, -s * 0.08, s * 0.25, s * 0.15)
    g.fillEllipse(s * 0.28, -s * 0.08, s * 0.25, s * 0.15)
    // 耳
    g.fillStyle(0x885533, 1)
    g.fillCircle(-s * 0.5, -s * 0.85, s * 0.22)
    g.fillCircle(s * 0.5, -s * 0.85, s * 0.22)
    // アーマーリング
    g.lineStyle(2.5, 0x996633, 0.8)
    g.strokeCircle(0, 0, s)
  }

  // ── メカアライグマ (mechraccoon) ──────────────────────────────

  private drawMechraccoon(s: number): void {
    const g = this.gfx
    // 尻尾 (後ろに描く)
    g.fillStyle(0x667788, 1)
    g.fillEllipse(s * 1.15, s * 0.55, s * 0.48, s * 1.25)
    g.fillStyle(0x222222, 1)
    for (let i = 0; i < 3; i++) {
      g.fillRect(s * 0.88, s * 0.05 + i * s * 0.38, s * 0.54, s * 0.16)
    }
    // ボディ
    g.fillStyle(0x778899, 1)
    g.fillCircle(0, 0, s)
    // お腹
    g.fillStyle(0xaabbcc, 1)
    g.fillEllipse(0, s * 0.24, s * 0.82, s * 0.75)
    // アライグママスク (黒い目周り)
    g.fillStyle(0x111111, 1)
    g.fillEllipse(-s * 0.35, -s * 0.1, s * 0.52, s * 0.36)
    g.fillEllipse(s * 0.35, -s * 0.1, s * 0.52, s * 0.36)
    // 目 (赤)
    g.fillStyle(0xff3300, 1)
    g.fillCircle(-s * 0.35, -s * 0.1, s * 0.18)
    g.fillCircle(s * 0.35, -s * 0.1, s * 0.18)
    g.fillStyle(0xffffff, 0.9)
    g.fillCircle(-s * 0.3, -s * 0.15, s * 0.07)
    g.fillCircle(s * 0.4, -s * 0.15, s * 0.07)
    // マズル
    g.fillStyle(0x667788, 1)
    g.fillEllipse(0, s * 0.27, s * 0.55, s * 0.46)
    g.fillStyle(0x221100, 1)
    g.fillCircle(-s * 0.1, s * 0.3, s * 0.09)
    g.fillCircle(s * 0.1, s * 0.3, s * 0.09)
    // 耳
    g.fillStyle(0x778899, 1)
    g.fillTriangle(-s * 0.52, -s * 0.82, -s * 0.78, -s * 1.42, -s * 0.2, -s * 0.82)
    g.fillTriangle(s * 0.52, -s * 0.82, s * 0.78, -s * 1.42, s * 0.2, -s * 0.82)
    // メカガン
    g.fillStyle(0x334455, 1)
    g.fillRect(-s * 0.12, -s * 0.88, s * 0.24, s * 0.36)
    g.fillStyle(0x556677, 1)
    g.fillRect(-s * 0.08, -s * 1.07, s * 0.16, s * 0.22)
  }

  // ── ボス脈動 ──────────────────────────────────────────────────

  private startBossPulse(): void {
    if (this.pulseTween) this.pulseTween.stop()
    const dur = this.bossPhase === 3 ? 180 : this.bossPhase === 2 ? 350 : 600
    this.pulseTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.72,
      duration: dur,
      yoyo: true,
      repeat: -1,
    })
  }

  // ── 更新 ───────────────────────────────────────────────────────

  update(delta: number, playerX: number, playerY: number): void {
    if (!this.active) return
    const dt = delta / 1000

    if (this.config.type === 'tankbear') {
      this.updateBossPhase(delta, playerX, playerY, dt)
    } else {
      this.updateMovement(dt)
    }

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

    // HPバー幅更新
    const ratio = Math.max(0, this.hp / this.maxHp)
    this.hpBar.setScale(ratio, 1)
  }

  // ── 移動パターン ──────────────────────────────────────────────

  private updateMovement(dt: number): void {
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
          20, GAME_WIDTH - 20
        )
        this.y += speed * 0.4 * dt
        break
      }

      case 'sniper':
        this.y += speed * 0.3 * dt
        this.x += Math.sin(this.y * 0.015) * 40 * dt
        break

      // 鉄モグラ: 初期x(targetX)が左側(< GAME_WIDTH/2)なら右へ、右側なら左へ横断
      case 'sidewind':
        this.x += (this.targetX < GAME_WIDTH / 2 ? 1 : -1) * speed * dt
        this.y += speed * 0.06 * dt
        break

      // メカアライグマ: 斜め高速突撃
      case 'diagonal':
        this.y += speed * dt
        this.x += (this.targetX < GAME_WIDTH / 2 ? 1 : -1) * speed * 0.55 * dt
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

    const baseSpeed = this.config.speed * this.scale_factor * 0.7
    const phaseSpeed = baseSpeed * (this.bossPhase === 3 ? 1.6 : this.bossPhase === 2 ? 1.25 : 1.0)

    if (this.isDashing && this.dashTarget) {
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
      if (this.y < 180) {
        this.y += phaseSpeed * dt
      } else {
        this.x += Math.sin(this.y * 0.008 + this.orbitAngle) * phaseSpeed * 0.5 * dt
        this.x = Phaser.Math.Clamp(this.x, 50, GAME_WIDTH - 50)
      }
    }

    if (this.bossPhase >= 2) {
      this.specialTimer += delta
      const specialInterval = this.bossPhase === 3 ? 2200 : 3800
      if (this.specialTimer >= specialInterval) {
        this.specialTimer = 0
        this.doSpecialAttack(playerX, playerY)
      }
    }

    useGameStore.getState().setBossState({
      hp: this.hp,
      maxHp: this.maxHp,
      phase: this.bossPhase,
    })
  }

  private onBossPhaseChange(phase: 1 | 2 | 3): void {
    // グラフィックスを再描画
    this.gfx.clear()
    this.drawTankbear(this.config.size, phase)
    this.startBossPulse()

    if (phase >= 2) {
      const labels = ['', 'PHASE 2', 'BERSERK!!']
      const label = this.scene.add
        .text(this.x, this.y - 70, labels[phase - 1], {
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
        y: label.y - 55,
        alpha: 0,
        duration: 1400,
        ease: 'Power2',
        onComplete: () => label.destroy(),
      })

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
      this.bulletPool.fireEnemy(
        this.x, this.y + this.config.size,
        Math.cos(angle) * 280,
        Math.sin(angle) * 280,
        Math.round(this.config.damage * this.scale_factor * 0.65)
      )
    }
  }

  private doSpecialAttack(playerX: number, playerY: number): void {
    if (this.bossPhase === 3) {
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i
        this.bulletPool.fireEnemy(
          this.x, this.y,
          Math.cos(angle) * 220,
          Math.sin(angle) * 220,
          Math.round(this.config.damage * 0.5)
        )
      }
      this.dashTarget = { x: playerX, y: playerY }
      this.isDashing = true
    } else {
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
    this.bulletPool.fireEnemy(
      this.x, this.y,
      Math.cos(angle) * 265,
      Math.sin(angle) * 265,
      Math.round(this.config.damage * this.scale_factor * 0.68)
    )
  }

  // ── ダメージ・死亡 ────────────────────────────────────────────

  takeDamage(damage: number): boolean {
    this.hp -= damage

    // ダメージフラッシュ (ボディだけ)
    this.gfx.setAlpha(0.1)
    this.scene.time.delayedCall(80, () => {
      if (!this.active) return
      this.gfx.setAlpha(1)
    })

    return this.hp <= 0
  }

  die(): void {
    if (this.config.type === 'tankbear') {
      useGameStore.getState().setBossState(null)
    }
    this.pulseTween?.stop()
    this.destroy(true)
  }
}
