// リザルトシーン (Phaser側) - 実際の表示はReact側のResultOverlayで行う
// このファイルは将来の拡張用に保持

import Phaser from 'phaser'

export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' })
  }

  create(): void {
    // 現在はReact側でリザルトを表示するため、ここでは何もしない
  }
}
