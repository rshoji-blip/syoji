// 敵の生成・管理

import Phaser from 'phaser'
import { Enemy } from './Enemy'
import type { BulletPool } from './BulletPool'
import { ENEMY_CONFIGS, type EnemyType } from '../data/EnemyData'
import { GAME_WIDTH, GAME_CONSTANTS } from '../GameConfig'

export class EnemyManager {
  private scene: Phaser.Scene
  private enemies: Enemy[] = []
  private bulletPool: BulletPool
  private onEnemyKilled: (() => void) | null = null

  constructor(scene: Phaser.Scene, bulletPool: BulletPool) {
    this.scene = scene
    this.bulletPool = bulletPool
  }

  setKillCallback(cb: () => void): void {
    this.onEnemyKilled = cb
  }

  spawnEnemy(type: EnemyType, scaleFactor: number = 1): Enemy {
    const config = ENEMY_CONFIGS[type]
    const x = Phaser.Math.Between(config.size + 10, GAME_WIDTH - config.size - 10)
    const y = GAME_CONSTANTS.ENEMY_SPAWN_Y

    const enemy = new Enemy(this.scene, x, y, config, scaleFactor, this.bulletPool)
    this.enemies.push(enemy)
    return enemy
  }

  update(delta: number, playerX: number, playerY: number): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i]
      if (!enemy.active) {
        this.enemies.splice(i, 1)
        continue
      }
      enemy.update(delta, playerX, playerY)

      // 画面下に抜けたら削除
      if (enemy.y > 900) {
        enemy.die()
        this.enemies.splice(i, 1)
      }
    }
  }

  damageEnemy(enemy: Enemy, damage: number): boolean {
    const died = enemy.takeDamage(damage)
    if (died) {
      const idx = this.enemies.indexOf(enemy)
      if (idx !== -1) this.enemies.splice(idx, 1)
      enemy.die()
      this.onEnemyKilled?.()
      return true
    }
    return false
  }

  getEnemies(): Enemy[] { return this.enemies }
  getEnemyCount(): number { return this.enemies.length }

  clear(): void {
    this.enemies.forEach((e) => e.die())
    this.enemies = []
  }
}
