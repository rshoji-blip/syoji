'use client';

interface Props {
  onSelectLocal:  () => void;
  onSelectOnline: () => void;
}

export default function ModeSelectScreen({ onSelectLocal, onSelectOnline }: Props) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(175deg, #0b0c2a 0%, #1a1060 50%, #0d1a0a 100%)' }}
    >
      {/* 背景光 */}
      <div
        className="absolute rounded-full blur-3xl opacity-30"
        style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,200,80,0.5) 0%, transparent 70%)' }}
      />

      <div className="text-7xl mb-4 z-10" style={{ filter: 'drop-shadow(0 0 20px rgba(255,200,80,0.5))' }}>
        🏰
      </div>

      <h1
        className="text-5xl font-black tracking-wide z-10"
        style={{
          background: 'linear-gradient(135deg, #ffd700, #ffa500)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Memory
      </h1>
      <h1
        className="text-6xl font-black tracking-widest -mt-1 z-10"
        style={{
          background: 'linear-gradient(135deg, #ffd700, #ffa500)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Kingdom
      </h1>
      <p className="text-amber-400 text-xs tracking-[0.3em] mt-2 mb-10 z-10">
        記憶力だけでは勝てない
      </p>

      <div className="w-full px-8 space-y-3 z-10">
        {/* オンライン対戦 */}
        <button
          onClick={onSelectOnline}
          className="w-full py-5 rounded-2xl font-black text-xl text-white tracking-wide transition-all active:scale-95 text-left px-6"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1e3a8a)',
            boxShadow: '0 4px 24px rgba(37,99,235,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌐</span>
            <div>
              <p className="text-lg font-black leading-none">オンライン対戦</p>
              <p className="text-blue-200 text-xs font-normal mt-0.5">Firebase リアルタイム同期</p>
            </div>
          </div>
        </button>

        {/* ローカル対戦 */}
        <button
          onClick={onSelectLocal}
          className="w-full py-5 rounded-2xl font-black text-xl text-white tracking-wide transition-all active:scale-95 text-left px-6"
          style={{
            background: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
            boxShadow: '0 4px 24px rgba(220,38,38,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎮</span>
            <div>
              <p className="text-lg font-black leading-none">ローカル対戦</p>
              <p className="text-red-200 text-xs font-normal mt-0.5">同じ端末で2人対戦</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
