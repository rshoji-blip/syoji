// メインゲームシーン

import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { EnemyManager } from '../entities/EnemyManager'
import { BulletPool } from '../entities/BulletPool'
import { WaveSystem } from '../systems/WaveSystem'
import { ScrollSystem } from '../systems/ScrollSystem'
import { EffectSystem } from '../systems/EffectSystem'
import { SkillSystem } from '../systems/SkillSystem'
import { ComboSystem } from '../systems/ComboSystem'
import { GAME_CONSTANTS } from '../GameConfig'
import { useGameStore } from '../../store/gameStore'
import { soundSystem } from '../systems/SoundSystem'
import { bgmSystem } from '../systems/BgmSystem'

export class GameScene extends Phaser.Scene {
  private player!: Player
  private enemyManager!: EnemyManager
  private bulletPool!: BulletPool
  private waveSystem!: WaveSystem
  private scrollSystem!: ScrollSystem
  private effectSystem!: EffectSystem
  private combo!: ComboSystem
  private gameOver: boolean = false
  private paused: boolean = false

  constructor() {
    super({ key: 'GameScene' })
  }

  create(): void {
    const store = useGameStore.getState()
    store.resetGame()
    store.setPhase('playing')
    store.setPlayStartTime(Date.now())

    // バトルBGM開始
    bgmSystem.start('battle')

    // 背景色
    this.cameras.main.setBackgroundColor(0x0a0a1a)

    // システム初期化
    this.scrollSystem = new ScrollSystem(this)
    this.effectSystem = new EffectSystem(this)
    this.combo = new ComboSystem()
    this.bulletPool = new BulletPool(this)
    this.enemyManager = new EnemyManager(this, this.bulletPool)

    // プレイヤー生成
    this.player = new Player(
      this,
      GAME_CONSTANTS.PLAYER_START_X,
      GAME_CONSTANTS.PLAYER_START_Y,
      this.bulletPool
    )

    // ウェーブシステム
    this.waveSystem = new WaveSystem(this, this.enemyManager, () =>
      this.onWaveComplete()
    )
    this.enemyManager.setKillCallback(() => {
      this.waveSystem.onEnemyKilled()
      store.addKill()
    })

    // 最初のウェーブ開始
    this.waveSystem.startWave(1)

    // キーボード操作 (デスクトップ)
    this.setupKeyboard()
  }

  private setupKeyboard(): void {
    // スペースで一時停止 (将来実装)
    this.input.keyboard?.on('keydown-SPACE', () => {
      // reserved
    })
  }

  update(_time: number, delta: number): void {
    if (this.gameOver || this.paused) return

    const store = useGameStore.getState()
    const stats = store.playerStats

    // ゲームオーバー判定
    if (stats.hp <= 0) {
      this.triggerGameOver()
      return
    }

    // 各システム更新
    this.scrollSystem.update(delta)
    this.player.update(delta)
    this.bulletPool.update(delta)
    this.enemyManager.update(delta, this.player.x, this.player.y)

    // 衝突判定
    this.checkBulletEnemyCollision(store)
    this.checkEnemyPlayerCollision()
    this.checkEnemyBulletPlayerCollision()
  }

  // プレイヤー弾 ↔ 敵
  private checkBulletEnemyCollision(
    store: ReturnType<typeof useGameStore.getState>
  ): void {
    const bullets = this.bulletPool.getActiveBullets()
    const enemies = this.enemyManager.getEnemies()

    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const bullet = bullets[bi]

      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        const enemy = enemies[ei]
        const dist = Phaser.Math.Distance.Between(
          bullet.x, bullet.y, enemy.x, enemy.y
        )

        if (dist < enemy.config.size + 4) {
          if (bullet.isCrit) {
            this.effectSystem.critEffect(enemy.x, enemy.y)
          } else {
            this.effectSystem.hitEffect(bullet.x, bullet.y)
            soundSystem.hit()
          }

          const died = this.enemyManager.damageEnemy(enemy, bullet.damage)
          if (died) {
            const comboResult = this.combo.onKill(this.time.now)
            store.setCombo(comboResult.combo, comboResult.multiplier)
            const baseScore = enemy.config.score * Math.ceil(store.currentWave * 0.5)
            store.addScore(Math.round(baseScore * comboResult.multiplier))

            if (this.waveSystem.isBossWave()) {
              this.effectSystem.bigExplosion(enemy.x, enemy.y)
              soundSystem.bossDie()
            } else {
              this.effectSystem.explodeEnemy(enemy.x, enemy.y, enemy.config.color)
              soundSystem.enemyDie()
            }

            if (comboResult.isNewMilestone) {
              this.spawnComboMilestoneText(enemy.x, enemy.y, comboResult)
            }
          }

          if (!bullet.isPiercing) {
            this.bulletPool.returnBullet(bullet, bi)
            break
          }
        }
      }
    }
  }

  // 敵 ↔ プレイヤー接触 (プレイヤーの実質的な当たり判定を小さく)
  private checkEnemyPlayerCollision(): void {
    if (this.player.isInvincible()) return
    const enemies = this.enemyManager.getEnemies()
    const hitR = this.player.getHitRadius()

    for (const enemy of enemies) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, enemy.x, enemy.y
      )
      if (dist < enemy.config.size + hitR) {
        this.player.takeDamage(enemy.config.damage)
        this.effectSystem.playerDamageFlash(this.player)
        break
      }
    }
  }

  // 敵弾 ↔ プレイヤー (小さい当たり判定で爽快感を維持)
  private checkEnemyBulletPlayerCollision(): void {
    if (this.player.isInvincible()) return
    const enemyBullets = this.bulletPool.getActiveEnemyBullets()
    const hitR = this.player.getHitRadius()

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const bullet = enemyBullets[i]
      const dist = Phaser.Math.Distance.Between(
        bullet.x, bullet.y, this.player.x, this.player.y
      )
      if (dist < 4 + hitR) {
        this.player.takeDamage(bullet.damage)
        this.effectSystem.playerDamageFlash(this.player)
        this.bulletPool.returnEnemyBullet(bullet, i)
        break
      }
    }
  }

  private spawnComboMilestoneText(
    x: number,
    y: number,
    result: { combo: number; multiplier: number }
  ): void {
    const color = result.multiplier >= 3.0 ? '#ff2200'
      : result.multiplier >= 2.0 ? '#ff6600'
      : result.multiplier >= 1.5 ? '#ffaa00'
      : '#ffdd00'
    const label = this.add
      .text(x, y - 30, `×${result.multiplier.toFixed(1)} COMBO!`, {
        fontSize: result.multiplier >= 2.0 ? '22px' : '17px',
        fontStyle: 'bold',
        color,
        stroke: '#000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(100)
    this.tweens.add({
      targets: label,
      y: label.y - 50,
      alpha: 0,
      duration: 900,
      ease: 'Power2',
      onComplete: () => label.destroy(),
    })
  }

  private onWaveComplete(): void {
    this.combo.reset()
    useGameStore.getState().setCombo(0, 1.0)
    this.effectSystem.waveCompleteEffect()
    soundSystem.waveClear()
    useGameStore.getState().addScore(GAME_CONSTANTS.WAVE_CLEAR_BONUS)

    // スキル選択フェーズへ
    this.paused = true
    this.time.delayedCall(1500, () => {
      const candidates = SkillSystem.drawCandidates()
      useGameStore.getState().setSkillCandidates(candidates)
      useGameStore.getState().setPhase('skillSelect')
    })
  }

  // React側からスキル選択完了を受け取る
  resumeAfterSkillSelect(nextWave: number): void {
    this.paused = false
    this.bulletPool.clear()
    this.waveSystem.startWave(nextWave)
    useGameStore.getState().setPhase('playing')
  }

  private triggerGameOver(): void {
    if (this.gameOver) return
    this.gameOver = true

    const store = useGameStore.getState()
    const playTime = Math.round((Date.now() - store.playStartTime) / 1000)

    store.setGameResult({
      wave: store.currentWave,
      killCount: store.killCount,
      score: store.score,
      playTime,
    })

    bgmSystem.stop()
    this.cameras.main.shake(500, 0.015)
    this.time.delayedCall(800, () => {
      store.setPhase('result')
      this.scene.stop('UIScene')
      this.scene.stop('GameScene')
    })
  }
}
