// ゲームオーバー / リザルト画面

import { useGameStore } from '../../store/gameStore'

export function ResultOverlay() {
  const { gameResult, resetGame, acquiredSkills } = useGameStore()

  if (!gameResult) return null

  const minutes = Math.floor(gameResult.playTime / 60)
  const seconds = gameResult.playTime % 60

  const handleRestart = () => {
    resetGame()
    // ページリロードで完全リセット (Phaserも再初期化)
    window.location.reload()
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md z-50">
      <h2 className="text-4xl font-bold text-neon-red mb-2 tracking-widest">
        GAME OVER
      </h2>

      {/* スコアカード */}
      <div className="bg-dark-panel border border-gray-700 rounded-2xl p-6 mb-6 w-72 mt-4">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Score</p>
            <p className="text-neon-yellow text-2xl font-bold">
              {gameResult.score.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Wave</p>
            <p className="text-neon-blue text-2xl font-bold">{gameResult.wave}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Kills</p>
            <p className="text-neon-green text-2xl font-bold">{gameResult.killCount}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Time</p>
            <p className="text-white text-2xl font-bold">
              {minutes}:{String(seconds).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>

      {/* 取得スキル一覧 */}
      {acquiredSkills.length > 0 && (
        <div className="mb-6 w-72">
          <p className="text-gray-400 text-xs text-center mb-2 uppercase tracking-wide">
            Acquired Skills
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {acquiredSkills.map(({ skill, stack }) => (
              <span
                key={skill.id}
                className="text-xs bg-gray-800 border border-gray-600 rounded-full px-2 py-1 text-gray-300"
              >
                {skill.icon} {skill.name}
                {stack > 1 && <span className="text-yellow-400 ml-1">×{stack}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* リスタートボタン */}
      <button
        onClick={handleRestart}
        className="bg-neon-blue text-dark-bg font-bold text-lg px-8 py-3 rounded-xl
                   hover:bg-opacity-80 active:scale-95 transition-all duration-200
                   tracking-widest uppercase"
      >
        RETRY
      </button>
    </div>
  )
}
