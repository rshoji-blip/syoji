// タイトルシーン

import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../GameConfig'
import { ScrollSystem } from '../systems/ScrollSystem'
import { soundSystem } from '../systems/SoundSystem'
import { highScoreStore } from '../../store/highScoreStore'

export class TitleScene extends Phaser.Scene {
  private scrollSystem!: ScrollSystem

  constructor() {
    super({ key: 'TitleScene' })
  }

  create(): void {
    this.scrollSystem = new ScrollSystem(this)

    // タイトルロゴ
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.28, 'SYOJI', {
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#00f5ff',
        stroke: '#003366',
        strokeThickness: 6,
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.38, '機械獣討伐記', {
        fontSize: '20px',
        color: '#aaaacc',
      })
      .setOrigin(0.5)

    // スタートボタン
    const btnBg = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 0.6, 200, 56, 0x00f5ff, 0.15)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x00f5ff)

    const btnText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.6, 'START GAME', {
        fontSize: '22px',
        color: '#00f5ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x00f5ff, 0.3)
      this.tweens.add({ targets: btnText, scaleX: 1.05, scaleY: 1.05, duration: 100 })
    })
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x00f5ff, 0.15)
      this.tweens.add({ targets: btnText, scaleX: 1, scaleY: 1, duration: 100 })
    })
    btnBg.on('pointerdown', () => {
      soundSystem.buttonClick()
      this.cameras.main.flash(300, 0, 245, 255)
      this.time.delayedCall(300, () => {
        this.scene.stop('TitleScene')
        this.scene.start('GameScene')
        this.scene.start('UIScene')
      })
    })

    // ハイスコア表示
    const best = highScoreStore.getBestScore()
    if (best > 0) {
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.72, `BEST SCORE`, {
          fontSize: '11px',
          color: '#888899',
        })
        .setOrigin(0.5)
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.77, best.toLocaleString(), {
          fontSize: '22px',
          color: '#ffee00',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
    }

    // 操作説明
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.88, 'タップ/マウス: 移動  WASD/矢印: キーボード移動', {
        fontSize: '10px',
        color: '#445566',
        wordWrap: { width: 320 },
        align: 'center',
      })
      .setOrigin(0.5)

    // バージョン表示
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'v0.2.0', {
        fontSize: '10px',
        color: '#333355',
      })
      .setOrigin(0.5)

    // タイトルグロー アニメ
    this.tweens.add({
      targets: this.children.list[1], // タイトルテキスト
      alpha: 0.7,
      duration: 1200,
      yoyo: true,
      repeat: -1,
    })
  }

  update(_time: number, delta: number): void {
    this.scrollSystem.update(delta)
  }
}
