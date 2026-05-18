// チュートリアル画面 - 初回起動時のみ3画面で操作説明を表示

import { useState } from 'react'

interface Props {
  onClose: () => void
}

const PAGES = [
  {
    icon: '👆',
    title: '移動',
    body: 'タップ / ドラッグで\n移動できます\n\nPC: WASD / 矢印キー',
    sub: '敵の弾を回避しながら\n上へ進め！',
    color: 'text-cyan-400',
    border: 'border-cyan-500/40',
  },
  {
    icon: '🔫',
    title: '自動射撃',
    body: '弾は自動的に発射されます\n\n敵を倒して\nウェーブクリアを目指せ！',
    sub: '敵に体当たりされても\nダメージ！',
    color: 'text-green-400',
    border: 'border-green-500/40',
  },
  {
    icon: '⚡',
    title: 'スキル強化',
    body: 'ウェーブクリアごとに\nスキルを1つ選択！\n\n組み合わせでキャラを強化',
    sub: 'レジェンダリースキルを\nゲットしろ！',
    color: 'text-yellow-400',
    border: 'border-yellow-500/40',
  },
]

const STORAGE_KEY = 'syoji_tutorial_seen'

export function hasTutorialBeenSeen(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function markTutorialSeen(): void {
  localStorage.setItem(STORAGE_KEY, 'true')
}

export function TutorialOverlay({ onClose }: Props) {
  const [page, setPage] = useState(0)
  const current = PAGES[page]
  const isLast = page === PAGES.length - 1

  const handleNext = () => {
    if (isLast) {
      markTutorialSeen()
      onClose()
    } else {
      setPage(page + 1)
    }
  }

  const handleSkip = () => {
    markTutorialSeen()
    onClose()
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-50">
      {/* ページインジケーター */}
      <div className="flex gap-2 mb-8">
        {PAGES.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === page ? 'bg-cyan-400 w-6' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* カードコンテンツ */}
      <div
        className={`border ${current.border} bg-[#111128]/90 rounded-3xl p-8 w-72 text-center mb-8 transition-all duration-300`}
      >
        <div className="text-6xl mb-4">{current.icon}</div>
        <h3 className={`text-2xl font-bold mb-4 ${current.color}`}>{current.title}</h3>
        <p className="text-white text-base leading-relaxed whitespace-pre-line mb-4">
          {current.body}
        </p>
        <p className="text-gray-400 text-sm whitespace-pre-line">{current.sub}</p>
      </div>

      {/* ボタン */}
      <div className="flex flex-col items-center gap-3 w-64">
        <button
          onClick={handleNext}
          className="w-full bg-cyan-400 text-[#0a0a1a] font-bold text-lg py-3 rounded-xl
                     hover:bg-cyan-300 active:scale-95 transition-all duration-200 tracking-wider"
        >
          {isLast ? 'ゲームスタート！' : '次へ →'}
        </button>

        {!isLast && (
          <button
            onClick={handleSkip}
            className="text-gray-500 text-sm hover:text-gray-400 transition-colors"
          >
            スキップ
          </button>
        )}
      </div>
    </div>
  )
}
