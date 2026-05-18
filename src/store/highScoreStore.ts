// ハイスコア管理 - localStorage で永続化

const STORAGE_KEY = 'syoji_highscores'
const MAX_ENTRIES = 5

export interface ScoreEntry {
  score: number
  wave: number
  killCount: number
  date: string // ISO 文字列
}

function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ScoreEntry[]
  } catch {
    return []
  }
}

function saveScores(scores: ScoreEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
  } catch {
    // localStorage が利用不可の場合は無視
  }
}

export const highScoreStore = {
  /** 保存済みスコア一覧 (スコア降順) */
  getScores(): ScoreEntry[] {
    return loadScores()
  },

  /** ベストスコアを返す (なければ 0) */
  getBestScore(): number {
    const scores = loadScores()
    return scores.length > 0 ? scores[0].score : 0
  },

  /**
   * 新しいスコアを追加し、新記録なら true を返す
   */
  addScore(entry: Omit<ScoreEntry, 'date'>): boolean {
    const scores = loadScores()
    const newEntry: ScoreEntry = {
      ...entry,
      date: new Date().toLocaleDateString('ja-JP'),
    }

    const prevBest = scores.length > 0 ? scores[0].score : 0
    const isNewRecord = newEntry.score > prevBest

    scores.push(newEntry)
    scores.sort((a, b) => b.score - a.score)
    const top = scores.slice(0, MAX_ENTRIES)
    saveScores(top)

    return isNewRecord
  },
}
