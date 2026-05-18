// 敵エンティティ

import Phaser from 'phaser'
import type { EnemyConfig } from '../data/EnemyData'
import type { BulletPool } from './BulletPool'
import { GAME_WIDTH } from '../GameConfig'

export class Enemy extends Phaser.GameObjects.Arc {
  config: EnemyConfig
  hp: number
  maxHp: number
  scale_factor: number
  private hpBar: Phaser.GameObjects.Rectangle
  private hpBarBg: Phaser.GameObjects.Rectangle
  private bulletPool: BulletPool
  private shootTimer: number = 0
  private orbitAngle: number = 0
  private targetX: number = 0
  private chargeSpeed: number = 0
  private isCharging: boolean = false

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

    // HPバー
    this.hpBarBg = scene.add
      .rectangle(x, y - config.size - 6, config.size * 2, 4, 0x333333)
      .setDepth(6)
    this.hpBar = scene.add
      .rectangle(x, y - config.size - 6, config.size * 2, 4, 0x00ff44)
      .setDepth(7)

    this.targetX = x
    this.orbitAngle = Math.random() * Math.PI * 2
  }

  update(delta: number, playerX: number, playerY: number): void {
    if (!this.active) return
    const dt = delta / 1000
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
          this.targetX = playerX
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
        const orbitRadius = 80
        this.x = Phaser.Math.Clamp(
          playerX + Math.cos(this.orbitAngle) * orbitRadius,
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

    // 射撃
    if (this.config.shootable && this.config.shootInterval) {
      this.shootTimer += delta
      if (this.shootTimer >= this.config.shootInterval / this.scale_factor) {
        this.shootTimer = 0
        this.shoot(playerX, playerY)
      }
    }

    this.hpBar.setPosition(this.x, this.y - this.config.size - 6)
    this.hpBarBg.setPosition(this.x, this.y - this.config.size - 6)
  }

  private shoot(targetX: number, targetY: number): void {
    const angle = Math.atan2(targetY - this.y, targetX - this.x)
    const speed = 260
    this.bulletPool.fireEnemy(
      this.x,
      this.y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      Math.round(this.config.damage * this.scale_factor * 0.7)
    )
  }

  takeDamage(damage: number): boolean {
    this.hp -= damage
    const ratio = Math.max(0, this.hp / this.maxHp)
    this.hpBar.setScale(ratio, 1)

    // ダメージフラッシュ
    this.setFillStyle(0xffffff)
    this.scene.time.delayedCall(80, () => {
      if (this.active) this.setFillStyle(this.config.color)
    })

    return this.hp <= 0
  }

  die(): void {
    this.hpBar.destroy()
    this.hpBarBg.destroy()
    this.destroy()
  }
}
