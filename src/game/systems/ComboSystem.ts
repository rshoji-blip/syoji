// コンボシステム - 連続撃破でスコア倍率UP

export interface ComboResult {
  combo: number
  multiplier: number
  isNewMilestone: boolean  // 倍率が上がった瞬間
}

const COMBO_WINDOW_MS = 2500  // 2.5秒以内に次を倒せばコンボ継続

const MILESTONES: { count: number; multiplier: number; label: string }[] = [
  { count: 3,  multiplier: 1.2, label: '×1.2' },
  { count: 6,  multiplier: 1.5, label: '×1.5' },
  { count: 10, multiplier: 2.0, label: '×2.0' },
  { count: 15, multiplier: 3.0, label: '×3.0' },
]

export class ComboSystem {
  private comboCount = 0
  private lastKillTime = 0
  private lastMultiplier = 1.0

  onKill(nowMs: number): ComboResult {
    const elapsed = nowMs - this.lastKillTime

    if (elapsed > COMBO_WINDOW_MS) {
      // コンボリセット
      this.comboCount = 0
    }

    this.comboCount++
    this.lastKillTime = nowMs

    const multiplier = this.getMultiplier()
    const isNewMilestone = multiplier > this.lastMultiplier
    this.lastMultiplier = multiplier

    return { combo: this.comboCount, multiplier, isNewMilestone }
  }

  getMultiplier(): number {
    for (let i = MILESTONES.length - 1; i >= 0; i--) {
      if (this.comboCount >= MILESTONES[i].count) return MILESTONES[i].multiplier
    }
    return 1.0
  }

  getLabel(): string {
    for (let i = MILESTONES.length - 1; i >= 0; i--) {
      if (this.comboCount >= MILESTONES[i].count) return MILESTONES[i].label
    }
    return ''
  }

  getCombo(): number { return this.comboCount }

  isActive(nowMs: number): boolean {
    return this.comboCount > 0 && (nowMs - this.lastKillTime) < COMBO_WINDOW_MS
  }

  reset(): void {
    this.comboCount = 0
    this.lastMultiplier = 1.0
  }
}
