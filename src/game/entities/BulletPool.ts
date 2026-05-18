// オブジェクトプール: 弾の生成・再利用でGCを防ぐ

import Phaser from 'phaser'
import { GAME_CONSTANTS } from '../GameConfig'

export interface Bullet extends Phaser.GameObjects.Arc {
  velocityX: number
  velocityY: number
  damage: number
  isCrit: boolean
  isPiercing: boolean
  isExplosive: boolean
  lifespan: number
  elapsed: number
}

export class BulletPool {
  private scene: Phaser.Scene
  private pool: Bullet[] = []
  private active: Bullet[] = []

  // 敵の弾用プール
  private enemyPool: Bullet[] = []
  private activeEnemy: Bullet[] = []

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.initialize()
  }

  private initialize(): void {
    // プレイヤー弾
    for (let i = 0; i < GAME_CONSTANTS.MAX_BULLETS; i++) {
      const bullet = this.createBullet(0x00f5ff, 5) as Bullet
      bullet.setActive(false).setVisible(false)
      this.pool.push(bullet)
    }

    // 敵弾
    for (let i = 0; i < 60; i++) {
      const bullet = this.createBullet(0xff4400, 4) as Bullet
      bullet.setActive(false).setVisible(false)
      this.enemyPool.push(bullet)
    }
  }

  private createBullet(color: number, radius: number): Phaser.GameObjects.Arc {
    const bullet = this.scene.add
      .circle(0, 0, radius, color)
      .setDepth(10) as Bullet

    ;(bullet as Bullet).velocityX = 0
    ;(bullet as Bullet).velocityY = 0
    ;(bullet as Bullet).damage = 0
    ;(bullet as Bullet).isCrit = false
    ;(bullet as Bullet).isPiercing = false
    ;(bullet as Bullet).isExplosive = false
    ;(bullet as Bullet).lifespan = GAME_CONSTANTS.BULLET_LIFESPAN
    ;(bullet as Bullet).elapsed = 0

    return bullet
  }

  // プレイヤー弾を発射
  fire(
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number,
    isCrit: boolean,
    isPiercing: boolean,
    isExplosive: boolean
  ): Bullet | null {
    const bullet = this.pool.pop()
    if (!bullet) return null

    bullet.setPosition(x, y).setActive(true).setVisible(true)
    bullet.velocityX = vx
    bullet.velocityY = vy
    bullet.damage = damage
    bullet.isCrit = isCrit
    bullet.isPiercing = isPiercing
    bullet.isExplosive = isExplosive
    bullet.elapsed = 0
    bullet.setAlpha(1)

    if (isCrit) bullet.setFillStyle(0xffee00)
    else bullet.setFillStyle(0x00f5ff)

    this.active.push(bullet)
    return bullet
  }

  // 敵弾を発射
  fireEnemy(x: number, y: number, vx: number, vy: number, damage: number): Bullet | null {
    const bullet = this.enemyPool.pop()
    if (!bullet) return null

    bullet.setPosition(x, y).setActive(true).setVisible(true)
    bullet.velocityX = vx
    bullet.velocityY = vy
    bullet.damage = damage
    bullet.elapsed = 0

    this.activeEnemy.push(bullet)
    return bullet
  }

  update(delta: number): void {
    const dt = delta / 1000

    for (let i = this.active.length - 1; i >= 0; i--) {
      const b = this.active[i]
      b.x += b.velocityX * dt
      b.y += b.velocityY * dt
      b.elapsed += delta

      if (b.elapsed >= b.lifespan) {
        this.returnBullet(b, i)
      }
    }

    for (let i = this.activeEnemy.length - 1; i >= 0; i--) {
      const b = this.activeEnemy[i]
      b.x += b.velocityX * dt
      b.y += b.velocityY * dt
      b.elapsed += delta

      if (b.elapsed >= b.lifespan) {
        this.returnEnemyBullet(b, i)
      }
    }
  }

  returnBullet(bullet: Bullet, index?: number): void {
    bullet.setActive(false).setVisible(false)
    const idx = index ?? this.active.indexOf(bullet)
    if (idx !== -1) this.active.splice(idx, 1)
    this.pool.push(bullet)
  }

  returnEnemyBullet(bullet: Bullet, index?: number): void {
    bullet.setActive(false).setVisible(false)
    const idx = index ?? this.activeEnemy.indexOf(bullet)
    if (idx !== -1) this.activeEnemy.splice(idx, 1)
    this.enemyPool.push(bullet)
  }

  getActiveBullets(): Bullet[] { return this.active }
  getActiveEnemyBullets(): Bullet[] { return this.activeEnemy }

  clear(): void {
    ;[...this.active].forEach((b) => this.returnBullet(b))
    ;[...this.activeEnemy].forEach((b) => this.returnEnemyBullet(b))
  }
}
