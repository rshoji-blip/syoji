// ウェーブ管理システム

import Phaser from 'phaser'
import { getWaveConfig, type WaveConfig } from '../data/WaveData'
import type { EnemyManager } from '../entities/EnemyManager'
import { useGameStore } from '../../store/gameStore'

type WaveCompleteCallback = () => void

export class WaveSystem {
  private scene: Phaser.Scene
  private enemyManager: EnemyManager
  private waveConfig: WaveConfig | null = null
  private spawnTimers: Phaser.Time.TimerEvent[] = []
  private onWaveComplete: WaveCompleteCallback
  private remainingSpawns: number = 0
  private active: boolean = false

  constructor(
    scene: Phaser.Scene,
    enemyManager: EnemyManager,
    onWaveComplete: WaveCompleteCallback
  ) {
    this.scene = scene
    this.enemyManager = enemyManager
    this.onWaveComplete = onWaveComplete
  }

  startWave(wave: number): void {
    this.waveConfig = getWaveConfig(wave)
    this.active = true
    this.remainingSpawns = 0

    useGameStore.getState().setCurrentWave(wave)

    // 各スポーングループをスケジュール
    this.waveConfig.spawnGroups.forEach((group) => {
      this.remainingSpawns += group.count

      // 難易度スケール (ウェーブが増えるほど敵が強くなる)
      const scale = 1 + (wave - 1) * 0.12

      for (let i = 0; i < group.count; i++) {
        const delay = group.delay + i * group.interval

        const timer = this.scene.time.delayedCall(delay, () => {
          this.enemyManager.spawnEnemy(group.type, scale)
          this.remainingSpawns--
          this.checkWaveComplete()
        })
        this.spawnTimers.push(timer)
      }
    })
  }

  private checkWaveComplete(): void {
    if (!this.active) return
    // スポーン完了 かつ 敵が全滅したらウェーブクリア
    if (this.remainingSpawns <= 0 && this.enemyManager.getEnemyCount() === 0) {
      this.active = false
      // 少し待ってからコールバック
      this.scene.time.delayedCall(1000, () => {
        this.onWaveComplete()
      })
    }
  }

  // enemyManager から呼ばれる (敵が死んだとき)
  onEnemyKilled(): void {
    this.checkWaveComplete()
  }

  stopWave(): void {
    this.active = false
    this.spawnTimers.forEach((t) => t.remove())
    this.spawnTimers = []
  }

  isBossWave(): boolean {
    return this.waveConfig?.bossWave ?? false
  }
}
