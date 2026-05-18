// UIシーン: ゲームプレイ中のHUD (GameSceneと並列実行)

import Phaser from 'phaser'
import { useGameStore } from '../../store/gameStore'
import { soundSystem } from '../systems/SoundSystem'
import { GAME_WIDTH } from '../GameConfig'

export class UIScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Rectangle
  private shieldBar!: Phaser.GameObjects.Rectangle
  private hpText!: Phaser.GameObjects.Text
  private scoreText!: Phaser.GameObjects.Text
  private waveText!: Phaser.GameObjects.Text
  private killText!: Phaser.GameObjects.Text
  private muteBtn!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'UIScene' })
  }

  create(): void {
    // HP バー背景
    this.add.rectangle(16, 24, 160, 12, 0x333333).setOrigin(0, 0.5)

    // HP バー
    this.hpBar = this.add
      .rectangle(16, 24, 160, 12, 0x00ff44)
      .setOrigin(0, 0.5)

    // シールドバー (HPの上)
    this.shieldBar = this.add
      .rectangle(16, 12, 160, 6, 0x00aaff)
      .setOrigin(0, 0.5)

    // HPテキスト
    this.hpText = this.add
      .text(182, 24, 'HP 100/100', { fontSize: '12px', color: '#00ff44' })
      .setOrigin(0, 0.5)

    // スコア
    this.scoreText = this.add
      .text(GAME_WIDTH - 10, 14, 'SCORE: 0', {
        fontSize: '16px',
        color: '#ffee00',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0.5)

    // ウェーブ
    this.waveText = this.add
      .text(GAME_WIDTH / 2, 14, 'WAVE 1', {
        fontSize: '15px',
        color: '#00f5ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5)

    // キル数
    this.killText = this.add
      .text(GAME_WIDTH / 2, 30, 'KILLS: 0', {
        fontSize: '11px',
        color: '#aaaacc',
      })
      .setOrigin(0.5, 0.5)

    // ミュートボタン
    this.muteBtn = this.add
      .text(GAME_WIDTH - 10, 44, '🔊', { fontSize: '18px' })
      .setOrigin(1, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const muted = !soundSystem.isMuted()
        soundSystem.setMuted(muted)
        this.muteBtn.setText(muted ? '🔇' : '🔊')
      })
  }

  update(): void {
    const { playerStats, score, currentWave, killCount } = useGameStore.getState()

    // HP バー更新
    const hpRatio = Math.max(0, playerStats.hp / playerStats.maxHp)
    this.hpBar.setScale(hpRatio, 1)
    const hpColor = hpRatio > 0.5 ? 0x00ff44 : hpRatio > 0.25 ? 0xffaa00 : 0xff0044
    this.hpBar.setFillStyle(hpColor)
    this.hpText.setText(`HP ${playerStats.hp}/${playerStats.maxHp}`)

    // シールドバー
    if (playerStats.maxShield > 0) {
      const shieldRatio = playerStats.shield / playerStats.maxShield
      this.shieldBar.setScale(shieldRatio, 1).setVisible(true)
    } else {
      this.shieldBar.setVisible(false)
    }

    // テキスト更新
    this.scoreText.setText(`SCORE: ${score.toLocaleString()}`)
    this.waveText.setText(`WAVE ${currentWave}`)
    this.killText.setText(`KILLS: ${killCount}`)
  }
}
