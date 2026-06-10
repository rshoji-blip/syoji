'use client';

import { useMemoryKingdom } from '@/hooks/useMemoryKingdom';
import SetupScreen from './screens/SetupScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';

export default function GameContainer() {
  const { state, dispatch } = useMemoryKingdom();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      {/* スマホ縦持ちフレーム */}
      <div
        className="relative overflow-hidden"
        style={{
          width: 390,
          height: 844,
          borderRadius: 48,
          boxShadow: '0 0 0 8px #111827, 0 0 0 10px #1f2937, 0 32px 80px rgba(0,0,0,0.9)',
          flexShrink: 0,
        }}
      >
        {(state.phase === 'setup') && (
          <SetupScreen dispatch={dispatch} />
        )}
        {(state.phase !== 'setup' && state.phase !== 'game_over') && (
          <GameScreen state={state} dispatch={dispatch} />
        )}
        {state.phase === 'game_over' && (
          <ResultScreen state={state} dispatch={dispatch} />
        )}
      </div>
    </div>
  );
}
