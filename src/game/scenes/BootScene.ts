// 起動シーン: アセット読み込みとゲーム準備

import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    // プログレスバー
    const cam = this.cameras.main
    const barBg = this.add.rectangle(cam.width / 2, cam.height / 2, 300, 20, 0x222244)
    const bar = this.add.rectangle(
      cam.width / 2 - 150,
      cam.height / 2,
      0,
      16,
      0x00f5ff
    ).setOrigin(0, 0.5)

    const text = this.add
      .text(cam.width / 2, cam.height / 2 + 30, 'LOADING...', {
        color: '#00f5ff',
        fontSize: '14px',
      })
      .setOrigin(0.5)

    this.load.on('progress', (value: number) => {
      bar.setScale(value, 1)
      bar.width = 300 * value
    })

    // suppress unused warnings
    void barBg
    void text

    // 今は外部アセットなし (プログラマティックに生成)
    // 将来: this.load.image('player', '/assets/player.png')
  }

  create(): void {
    this.scene.start('TitleScene')
  }
}
