import React, { useState } from 'react';
import { useGet, apiPost } from '../hooks/useApi';
import { CATEGORY_ICONS, ALL_CATEGORIES } from '../types';

interface RecordData {
  child_name: string;
  plays_by_cat: Record<string, Array<{ id: string; name: string; dev_categories: string[] }>>;
}

const CAT_DESCS: Record<string, string> = {
  "探索":"新しいものを発見","創造":"作る・描く・表現","会話":"話す・聞く・読む",
  "運動":"走る・跳ぶ・動く","感覚":"触る・聞く・感じる","協力":"一緒に・順番に","挑戦":"難しいことに挑む",
};
const BG_COLORS: Record<string, string> = {
  "探索":"#EBF0FE","創造":"#FEF3E2","会話":"#E8F8EF","運動":"#F5EAFA","感覚":"#FFF9E6","協力":"#E6F9FD","挑戦":"#FDE8E8",
};

type Step = 'category' | 'play' | 'done';

export default function Record() {
  const { data, loading } = useGet<RecordData>('/record_data');
  const [step, setStep] = useState<Step>('category');
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [selectedPlay, setSelectedPlay] = useState<{ id: string; name: string; cats: string[] } | null>(null);

  const handleCategory = (cat: string) => {
    setSelectedCat(cat);
    setTimeout(() => setStep('play'), 200);
  };

  const handlePlay = async (play: { id: string; name: string; dev_categories: string[] }) => {
    setSelectedPlay({ id: play.id, name: play.name, cats: play.dev_categories });
    await apiPost('/record_log', { play_id: play.id, play_name: play.name });
    setStep('done');
  };

  const reset = () => {
    setStep('category'); setSelectedCat(''); setSelectedPlay(null);
  };

  if (loading || !data) return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-light)' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🌱</div>
      <div>読み込み中…</div>
    </div>
  );

  return (
    <div style={{ padding: '0 16px 100px' }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '20px 0 12px' }}>
        {[1, 2, 3].map((n, i) => (
          <React.Fragment key={n}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              background: step === 'category' && n === 1 ? 'var(--primary)'
                : step === 'play' && n === 2 ? 'var(--primary)'
                : step === 'done' && n === 3 ? 'var(--primary)'
                : (step === 'play' && n === 1) || (step === 'done' && n <= 2) ? 'var(--accent)'
                : 'var(--bg)',
              color: (step === 'category' && n === 1) || (step === 'play' && n === 2) || (step === 'done' && n === 3)
                ? 'white' : (step === 'play' && n === 1) || (step === 'done' && n <= 2) ? 'white' : 'var(--text-light)',
              border: '2px solid',
              borderColor: ((step === 'category' && n === 1) || (step === 'play' && n === 2) || (step === 'done' && n === 3)) ? 'var(--primary)'
                : (step === 'play' && n === 1) || (step === 'done' && n <= 2) ? 'var(--accent)' : 'var(--border)',
            }}>{n === 3 ? '✓' : n}</div>
            {i < 2 && <div style={{
              flex: 1, height: 2, borderRadius: 1,
              background: (i === 0 && (step === 'play' || step === 'done')) || (i === 1 && step === 'done') ? 'var(--accent)' : 'var(--border)',
            }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Category */}
      {step === 'category' && (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>どんな経験をしましたか？</div>
          <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>カテゴリを選んでください</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {ALL_CATEGORIES.filter(cat => data.plays_by_cat[cat]).map(cat => (
              <button key={cat} onClick={() => handleCategory(cat)} style={{
                background: BG_COLORS[cat] || 'white', borderRadius: 'var(--radius-sm)',
                padding: '18px 14px', textAlign: 'center', cursor: 'pointer',
                boxShadow: 'var(--shadow)', border: '2.5px solid transparent',
                transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{CATEGORY_ICONS[cat]}</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{cat}</div>
                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>{CAT_DESCS[cat]}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Play */}
      {step === 'play' && (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <button onClick={() => setStep('category')} style={{
              background: 'var(--bg)', border: 'none', borderRadius: '50%',
              width: 32, height: 32, cursor: 'pointer', fontSize: 16,
            }}>‹</button>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{CATEGORY_ICONS[selectedCat]}{selectedCat}の遊び</div>
              <div style={{ fontSize: 13, color: 'var(--text-light)' }}>遊びを選んでください</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(data.plays_by_cat[selectedCat] || []).map(play => (
              <button key={play.id} onClick={() => handlePlay(play)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'white', borderRadius: 'var(--radius-sm)',
                padding: '14px 16px', boxShadow: 'var(--shadow)',
                border: '2.5px solid transparent', cursor: 'pointer', textAlign: 'left', width: '100%',
              }}>
                <div style={{ fontSize: 24, width: 40, textAlign: 'center' }}>🎮</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{play.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>
                    {play.dev_categories.map(c => CATEGORY_ICONS[c] + c).join(' · ')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Done */}
      {step === 'done' && selectedPlay && (
        <div style={{ textAlign: 'center', padding: '24px 0', animation: 'pop 0.5s ease both' }}>
          <div style={{ fontSize: 72, marginBottom: 12, animation: 'pop 0.5s ease both' }}>🎉</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>記録完了！</div>
          <div style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 20 }}>
            「{selectedPlay.name}」を記録しました！<br />すてきな時間でしたね 🌸
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
            {selectedPlay.cats.map((c, i) => (
              <div key={c} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'var(--primary-light)', color: 'var(--primary)',
                padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                animation: `pop 0.4s ease ${i * 0.1}s both`,
              }}>{CATEGORY_ICONS[c]}{c}</div>
            ))}
          </div>
          <button onClick={reset} style={{
            width: '100%', padding: 15, borderRadius: 'var(--radius-sm)',
            background: 'var(--bg)', color: 'var(--text-mid)', border: '1.5px solid var(--border)',
            fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8,
          }}>もう1つ記録する</button>
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pop { 0% { transform:scale(0.8); opacity:0; } 70% { transform:scale(1.05); } 100% { transform:scale(1); opacity:1; } }
      `}</style>
    </div>
  );
}
