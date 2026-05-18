// UIシーン: ゲームプレイ中のHUD (GameSceneと並列実行)

import Phaser from 'phaser'
import { useGameStore } from '../../store/gameStore'
import { soundSystem } from '../systems/SoundSystem'
import { bgmSystem } from '../systems/BgmSystem'
import { GAME_WIDTH } from '../GameConfig'

export class UIScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Rectangle
  private shieldBar!: Phaser.GameObjects.Rectangle
  private hpText!: Phaser.GameObjects.Text
  private scoreText!: Phaser.GameObjects.Text
  private waveText!: Phaser.GameObjects.Text
  private killText!: Phaser.GameObjects.Text
  private muteBtn!: Phaser.GameObjects.Text
  private comboText!: Phaser.GameObjects.Text

  // ── ボスHPバー ─────────────────────────────────────────────
  private bossBarBg!: Phaser.GameObjects.Rectangle
  private bossBar!: Phaser.GameObjects.Rectangle
  private bossLabel!: Phaser.GameObjects.Text
  private bossPhaseText!: Phaser.GameObjects.Text
  private bossVisible = false

  constructor() {
    super({ key: 'UIScene' })
  }

  create(): void {
    // ── プレイヤーHP ──────────────────────────────────────────
    this.add.rectangle(16, 24, 160, 12, 0x333333).setOrigin(0, 0.5)
    this.hpBar = this.add.rectangle(16, 24, 160, 12, 0x00ff44).setOrigin(0, 0.5)
    this.shieldBar = this.add.rectangle(16, 12, 160, 6, 0x00aaff).setOrigin(0, 0.5)
    this.hpText = this.add
      .text(182, 24, 'HP 100/100', { fontSize: '12px', color: '#00ff44' })
      .setOrigin(0, 0.5)

    // ── スコア / ウェーブ / キル ──────────────────────────────
    this.scoreText = this.add
      .text(GAME_WIDTH - 10, 14, 'SCORE: 0', {
        fontSize: '16px',
        color: '#ffee00',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0.5)

    this.waveText = this.add
      .text(GAME_WIDTH / 2, 14, 'WAVE 1', {
        fontSize: '15px',
        color: '#00f5ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5)

    this.killText = this.add
      .text(GAME_WIDTH / 2, 30, 'KILLS: 0', {
        fontSize: '11px',
        color: '#aaaacc',
      })
      .setOrigin(0.5, 0.5)

    // ── ミュートボタン (SE + BGM 連動) ───────────────────────
    this.muteBtn = this.add
      .text(GAME_WIDTH - 10, 44, '🔊', { fontSize: '18px' })
      .setOrigin(1, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const muted = !soundSystem.isMuted()
        soundSystem.setMuted(muted)
        bgmSystem.setMuted(muted)
        this.muteBtn.setText(muted ? '🔇' : '🔊')
      })

    // ── ボスHPバー (画面下部に常駐、通常時は非表示) ─────────
    const bossY = 820
    this.add
      .rectangle(GAME_WIDTH / 2, bossY, 340, 18, 0x111111)
      .setOrigin(0.5, 0.5)
      .setStrokeStyle(1, 0x440000)

    this.bossBarBg = this.add
      .rectangle(GAME_WIDTH / 2, bossY, 336, 14, 0x330000)
      .setOrigin(0.5, 0.5)

    this.bossBar = this.add
      .rectangle(GAME_WIDTH / 2 - 168, bossY, 336, 14, 0xff2200)
      .setOrigin(0, 0.5)

    this.bossLabel = this.add
      .text(GAME_WIDTH / 2, bossY - 14, '⚙ 機甲熊 ⚙', {
        fontSize: '13px',
        color: '#ff6600',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5)

    this.bossPhaseText = this.add
      .text(GAME_WIDTH - 20, bossY, 'PHASE 1', {
        fontSize: '11px',
        color: '#ff4400',
      })
      .setOrigin(1, 0.5)

    // 初期状態は非表示
    this.setBossBarVisible(false)

    // ── コンボ表示 ────────────────────────────────────────────
    this.comboText = this.add
      .text(GAME_WIDTH / 2, 50, '', {
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffdd00',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false)
  }

  private setBossBarVisible(visible: boolean): void {
    this.bossVisible = visible
    this.bossBar.setVisible(visible)
    this.bossBarBg.setVisible(visible)
    this.bossLabel.setVisible(visible)
    this.bossPhaseText.setVisible(visible)
  }

  update(): void {
    const { playerStats, score, currentWave, killCount, bossState, comboCount, comboMultiplier } = useGameStore.getState()

    // ── プレイヤーHP更新 ──────────────────────────────────────
    const hpRatio = Math.max(0, playerStats.hp / playerStats.maxHp)
    this.hpBar.setScale(hpRatio, 1)
    const hpColor = hpRatio > 0.5 ? 0x00ff44 : hpRatio > 0.25 ? 0xffaa00 : 0xff0044
    this.hpBar.setFillStyle(hpColor)
    this.hpText.setText(`HP ${playerStats.hp}/${playerStats.maxHp}`)

    if (playerStats.maxShield > 0) {
      const shieldRatio = playerStats.shield / playerStats.maxShield
      this.shieldBar.setScale(shieldRatio, 1).setVisible(true)
    } else {
      this.shieldBar.setVisible(false)
    }

    // ── スコア等 ──────────────────────────────────────────────
    this.scoreText.setText(`SCORE: ${score.toLocaleString()}`)
    this.waveText.setText(`WAVE ${currentWave}`)
    this.killText.setText(`KILLS: ${killCount}`)

    // ── ボスHPバー ────────────────────────────────────────────
    if (bossState) {
      if (!this.bossVisible) this.setBossBarVisible(true)

      const ratio = Math.max(0, bossState.hp / bossState.maxHp)
      this.bossBar.setScale(ratio, 1)

      // フェーズ別の色
      const barColor = bossState.phase === 3 ? 0xff0000
        : bossState.phase === 2 ? 0xff6600
        : 0xff2200
      this.bossBar.setFillStyle(barColor)
      this.bossPhaseText.setText(`PHASE ${bossState.phase}`)
      this.bossPhaseText.setColor(
        bossState.phase === 3 ? '#ff0000' : bossState.phase === 2 ? '#ff6600' : '#ff4400'
      )
    } else if (this.bossVisible) {
      this.setBossBarVisible(false)
    }

    // ── コンボ表示 ────────────────────────────────────────────
    if (comboCount >= 3) {
      const color = comboMultiplier >= 3.0 ? '#ff2200'
        : comboMultiplier >= 2.0 ? '#ff6600'
        : comboMultiplier >= 1.5 ? '#ffaa00'
        : '#ffdd00'
      this.comboText
        .setText(`${comboCount} COMBO  ×${comboMultiplier.toFixed(1)}`)
        .setColor(color)
        .setVisible(true)
    } else {
      this.comboText.setVisible(false)
    }
  }
}
