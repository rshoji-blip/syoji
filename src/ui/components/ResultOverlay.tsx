// ゲームオーバー / リザルト画面

import { useEffect, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { highScoreStore, type ScoreEntry } from '../../store/highScoreStore'
import { soundSystem } from '../../game/systems/SoundSystem'

export function ResultOverlay() {
  const { gameResult, resetGame, acquiredSkills } = useGameStore()
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [topScores, setTopScores] = useState<ScoreEntry[]>([])

  // マウント時にスコアを保存
  useEffect(() => {
    if (!gameResult) return
    const newRecord = highScoreStore.addScore({
      score: gameResult.score,
      wave: gameResult.wave,
      killCount: gameResult.killCount,
    })
    setIsNewRecord(newRecord)
    setTopScores(highScoreStore.getScores())

    if (newRecord) soundSystem.skillAcquire()
  }, [gameResult])

  if (!gameResult) return null

  const minutes = Math.floor(gameResult.playTime / 60)
  const seconds = gameResult.playTime % 60

  const handleRestart = () => {
    soundSystem.buttonClick()
    resetGame()
    window.location.reload()
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md z-50 overflow-y-auto py-4">
      {/* 新記録バナー */}
      {isNewRecord && (
        <div className="mb-3 px-6 py-1 bg-yellow-400/20 border border-yellow-400 rounded-full">
          <span className="text-yellow-400 font-bold text-sm tracking-widest">
            ★ NEW RECORD ★
          </span>
        </div>
      )}

      <h2 className="text-4xl font-bold text-red-500 mb-2 tracking-widest">
        GAME OVER
      </h2>

      {/* スコアカード */}
      <div className="bg-[#111128] border border-gray-700 rounded-2xl p-5 mb-4 w-72 mt-2">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Score</p>
            <p className="text-yellow-400 text-2xl font-bold">
              {gameResult.score.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Wave</p>
            <p className="text-cyan-400 text-2xl font-bold">{gameResult.wave}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Kills</p>
            <p className="text-green-400 text-2xl font-bold">{gameResult.killCount}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">Time</p>
            <p className="text-white text-2xl font-bold">
              {minutes}:{String(seconds).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>

      {/* トップスコアランキング */}
      {topScores.length > 0 && (
        <div className="w-72 mb-4">
          <p className="text-gray-400 text-xs text-center mb-2 uppercase tracking-wide">
            Top Scores
          </p>
          <div className="bg-[#111128] border border-gray-700 rounded-xl overflow-hidden">
            {topScores.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-2 text-sm
                  ${i === 0 ? 'bg-yellow-400/10 border-b border-yellow-400/20' : 'border-b border-gray-800'}
                  ${entry.score === gameResult.score && isNewRecord && i === 0 ? 'text-yellow-400' : 'text-gray-300'}
                `}
              >
                <span className={`w-6 font-bold ${i === 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                  {i + 1}
                </span>
                <span className="font-bold flex-1 text-right">
                  {entry.score.toLocaleString()}
                </span>
                <span className="text-gray-500 ml-3 text-xs">
                  Wave {entry.wave}
                </span>
                <span className="text-gray-600 ml-3 text-xs w-16 text-right">
                  {entry.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 取得スキル一覧 */}
      {acquiredSkills.length > 0 && (
        <div className="mb-4 w-72">
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
        className="bg-cyan-400 text-[#0a0a1a] font-bold text-lg px-8 py-3 rounded-xl
                   hover:bg-cyan-300 active:scale-95 transition-all duration-200
                   tracking-widest uppercase"
      >
        RETRY
      </button>
    </div>
  )
}
