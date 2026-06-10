'use client';

import { useState } from 'react';
import TitleScreen from './screens/TitleScreen';
import CreateRoomScreen from './screens/CreateRoomScreen';
import JoinRoomScreen from './screens/JoinRoomScreen';
import BattleScreen from './screens/BattleScreen';
import VictoryScreen from './screens/VictoryScreen';

export type Screen = 'title' | 'create' | 'join' | 'battle' | 'victory';

export default function MemoryKingdomApp() {
  const [screen, setScreen] = useState<Screen>('title');
  const [playerName, setPlayerName] = useState('勇者プレイヤー');

  const go = (s: Screen) => setScreen(s);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      {/* スマホ縦持ちフレーム */}
      <div
        className="relative overflow-hidden"
        style={{
          width: 390,
          height: 844,
          borderRadius: 48,
          boxShadow: '0 0 0 8px #1a1a2e, 0 0 0 10px #16213e, 0 32px 64px rgba(0,0,0,0.8)',
        }}
      >
        {screen === 'title'   && <TitleScreen   onNavigate={go} />}
        {screen === 'create'  && <CreateRoomScreen onNavigate={go} playerName={playerName} setPlayerName={setPlayerName} />}
        {screen === 'join'    && <JoinRoomScreen   onNavigate={go} />}
        {screen === 'battle'  && <BattleScreen     onNavigate={go} />}
        {screen === 'victory' && <VictoryScreen    onNavigate={go} />}
      </div>
    </div>
  );
}
