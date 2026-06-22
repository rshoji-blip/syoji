import React, { useState } from 'react';
import { useGet, apiPost } from '../hooks/useApi';
import { CATEGORY_ICONS, ALL_CATEGORIES } from '../types';

interface RecordData {
  child_name: string;
  plays_by_cat: Record<string, Array<{ id: string; name: string; dev_categories: string[] }>>;
}

const CAT_COLORS: Record<string, { bg: string; border: string; shadow: string }> = {
  "探索": { bg: "#E8F4FD", border: "#85C1E9", shadow: "#85C1E940" },
  "創造": { bg: "#FDE8EF", border: "#F4A0B5", shadow: "#F4A0B540" },
  "会話": { bg: "#E6F8F3", border: "#7DCFB6", shadow: "#7DCFB640" },
  "運動": { bg: "#F4EBF8", border: "#C39BD3", shadow: "#C39BD340" },
  "感覚": { bg: "#FEFAE5", border: "#D4B800", shadow: "#D4B80030" },
  "協力": { bg: "#FEE9E5", border: "#F4846F", shadow: "#F4846F40" },
  "挑戦": { bg: "#EAFAF1", border: "#52BE80", shadow: "#52BE8040" },
};

const CAT_DESCS: Record<string, string> = {
  "探索":"新しいことを発見！","創造":"つくる・かく・ひょうげん","会話":"はなす・きく・よむ",
  "運動":"はしる・とぶ・うごく","感覚":"さわる・きく・かんじる","協力":"いっしょに・じゅんばんに","挑戦":"むずかしいことにちょうせん",
};

type Step = 'category' | 'play' | 'done';

export default function Record() {
  const { data, loading } = useGet<RecordData>('/record_data');
  const [step, setStep] = useState<Step>('category');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedPlay, setSelectedPlay] = useState<{ id: string; name: string; cats: string[] } | null>(null);
  const [coins, setCoins] = useState(0);
  const [pressing, setPressing] = useState('');

  const handleCategory = (cat: string) => {
    setPressing(cat);
    setTimeout(() => { setPressing(''); setSelectedCat(cat); setStep('play'); }, 200);
  };

  const handlePlay = async (play: { id: string; name: string; dev_categories: string[] }) => {
    setPressing(play.id);
    setSelectedPlay({ id: play.id, name: play.name, cats: play.dev_categories });
    await apiPost('/record_log', { play_id: play.id, play_name: play.name });
    const earned = 1 + Math.floor(Math.random() * 3);
    setCoins(earned);
    setTimeout(() => { setPressing(''); setStep('done'); }, 200);
  };

  const reset = () => { setStep('category'); setSelectedCat(''); setSelectedPlay(null); setCoins(0); };

  if (loading || !data) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
      <div style={{ fontSize: 40, animation: 'bounce 1s ease infinite' }}>✏️</div>
      <div style={{ fontSize: 14, color: 'var(--text-light)', fontWeight: 700 }}>よみこみ中…</div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), #F4A0B5)',
        padding: '20px 20px 28px',
      }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>
          {data.child_name}ちゃんとあそぼう
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'white', marginTop: 4 }}>
          ✏️ きろくする
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          {[1,2,3].map(n => (
            <div key={n} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(255,255,255,0.25)', borderRadius: 20, padding: '4px 10px',
              opacity: (step === 'category' && n === 1) || (step === 'play' && n === 2) || (step === 'done' && n === 3) ? 1 : 0.5,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 900,
                color: n === 1 ? 'var(--primary)' : n === 2 ? '#F4A0B5' : 'var(--mint)',
              }}>{n === 3 ? '✓' : n}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>
                {n === 1 ? 'えらぶ' : n === 2 ? 'あそび' : 'かんりょう'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px', marginTop: -8 }}>

        {/* Step 1: Category stamps */}
        {step === 'category' && (
          <div style={{ animation: 'fadeUp 0.35s ease both' }}>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>どんなたいけんをしましたか？</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16, fontWeight: 600 }}>カテゴリをタップしてね ①</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {ALL_CATEGORIES.filter(cat => data.plays_by_cat[cat]).map(cat => {
                const c = CAT_COLORS[cat] || { bg: '#f5f5f5', border: '#ddd', shadow: '#ddd30' };
                return (
                  <button key={cat} onClick={() => handleCategory(cat)} style={{
                    background: pressing === cat ? c.border : c.bg,
                    borderRadius: 20, padding: '20px 12px', textAlign: 'center',
                    boxShadow: `0 4px 16px ${c.shadow}`,
                    border: `3px solid ${c.border}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                    transform: pressing === cat ? 'scale(0.95)' : 'scale(1)',
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>{CATEGORY_ICONS[cat]}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: pressing === cat ? 'white' : 'var(--text)' }}>{cat}</div>
                    <div style={{ fontSize: 11, color: pressing === cat ? 'rgba(255,255,255,0.85)' : 'var(--text-light)', marginTop: 3, fontWeight: 600 }}>{CAT_DESCS[cat]}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Play list */}
        {step === 'play' && (
          <div style={{ animation: 'fadeUp 0.35s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <button onClick={() => setStep('category')} style={{
                background: 'white', border: '2.5px solid var(--border)', borderRadius: '50%',
                width: 36, height: 36, cursor: 'pointer', fontSize: 18, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, color: 'var(--text-mid)',
              }}>‹</button>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{CATEGORY_ICONS[selectedCat]} {selectedCat}のあそび</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600 }}>どれをしましたか？② タップしてね</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(data.plays_by_cat[selectedCat] || []).map(play => {
                const c = CAT_COLORS[selectedCat] || { bg: '#f5f5f5', border: '#ddd', shadow: '#ddd30' };
                return (
                  <button key={play.id} onClick={() => handlePlay(play)} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: pressing === play.id ? c.bg : 'white',
                    borderRadius: 'var(--radius-sm)', padding: '14px 16px',
                    boxShadow: 'var(--shadow)', border: `2.5px solid ${pressing === play.id ? c.border : 'var(--border)'}`,
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                    transform: pressing === play.id ? 'scale(0.97)' : 'scale(1)',
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: c.bg, border: `2px solid ${c.border}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      {CATEGORY_ICONS[selectedCat]}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900 }}>{play.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 3, fontWeight: 600 }}>
                        {play.dev_categories.map(d => CATEGORY_ICONS[d] + d).join(' · ')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Coin celebration */}
        {step === 'done' && selectedPlay && (
          <div style={{ textAlign: 'center', padding: '16px 0', animation: 'fadeUp 0.4s ease both' }}>
            {/* Big celebration */}
            <div style={{
              background: 'linear-gradient(135deg, #FFF8EF, #FEE9E5)',
              borderRadius: 28, padding: '32px 20px',
              border: '3px solid var(--primary)',
              boxShadow: '0 6px 24px rgba(244,132,111,0.2)',
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 64, marginBottom: 12, animation: 'pop 0.6s ease both' }}>🎉</div>
              <div style={{
                fontSize: 24, fontWeight: 900, color: 'var(--primary)', marginBottom: 8,
                textShadow: '0 2px 4px rgba(244,132,111,0.2)',
              }}>やったね！きろくできたよ！</div>
              <div style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.7, fontWeight: 600, marginBottom: 20 }}>
                「{selectedPlay.name}」<br />すてきなたいけんでしたね 🌸
              </div>

              {/* Coin reward */}
              <div style={{
                background: 'white', borderRadius: 20, padding: '16px',
                border: '2.5px solid var(--yellow)', boxShadow: '0 3px 12px rgba(249,231,132,0.4)',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 10 }}>
                  コインをゲット！
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  {Array.from({ length: coins }).map((_, i) => (
                    <div key={i} style={{
                      fontSize: 32, animation: `coinFall 0.5s ease ${i * 0.15}s both`,
                    }}>🪙</div>
                  ))}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#D4A800' }}>× {coins}まい！</div>
              </div>

              {/* Category badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {selectedPlay.cats.map((c, i) => {
                  const colors = CAT_COLORS[c] || { bg: '#f5f5f5', border: '#ddd' };
                  return (
                    <div key={c} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: colors.bg, color: colors.border,
                      padding: '7px 14px', borderRadius: 20,
                      fontSize: 13, fontWeight: 900,
                      border: `2px solid ${colors.border}50`,
                      animation: `pop 0.4s ease ${i * 0.12}s both`,
                    }}>{CATEGORY_ICONS[c]} {c}</div>
                  );
                })}
              </div>
            </div>

            <button onClick={reset} style={{
              width: '100%', padding: 15, borderRadius: 'var(--radius-sm)',
              background: 'white', color: 'var(--primary)', border: '2.5px solid var(--primary)',
              fontSize: 15, fontWeight: 900, cursor: 'pointer',
            }}>もう1つきろくする ✏️</button>
          </div>
        )}
      </div>
    </div>
  );
}
