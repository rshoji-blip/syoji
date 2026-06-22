import React, { useState } from 'react';

interface Props { onDone: () => void; }

const slides = [
  {
    img: '/static/images/icons/cat_explore.png',
    title: '月齢に合った遊びを\nすぐ見つけられます',
    desc: '今日何して遊ぼう…と悩む時間ゼロ。お子さんの月齢・成長バランスから、今日ぴったりの遊びを自動でピックアップします。',
    color: '#FFF3E0',
    border: '#FFB74D',
  },
  {
    img: '/static/images/icons/cat_create.png',
    title: 'やり方・用意するものも\nひと目でわかります',
    desc: '遊びをタップするとステップごとのやり方と、必要なものがすぐわかります。動画リンクがある遊びもあります。',
    color: '#FCE4EC',
    border: '#F48FB1',
  },
  {
    img: '/static/images/icons/cat_coop.png',
    title: '7つのカテゴリから\n新しい遊びを発見できます',
    desc: '探索・創造・会話・運動・感覚・協力・挑戦。いつもと違う遊びも「カテゴリから探す」でかんたんに見つかります。',
    color: '#E0F7FA',
    border: '#4DD0E1',
  },
  {
    img: '/static/images/icons/cat_mascot.png',
    title: 'さあ、今日も\n一緒に遊ぼう！',
    desc: '遊んだら「きろく」に残してみましょう。どんな経験を積んできたか、成長のあしあとが見えてきます。',
    color: '#F3E5F5',
    border: '#CE93D8',
  },
];

export default function Onboarding({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div style={{
      minHeight: '100vh', background: slide.color,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 28px', transition: 'background 0.4s ease',
    }}>
      <img src={slide.img} alt=""
        style={{ width: 180, height: 180, objectFit: 'contain', marginBottom: 32 }} />

      <div style={{ fontSize: 22, fontWeight: 900, color: '#333', textAlign: 'center', lineHeight: 1.5, marginBottom: 16, whiteSpace: 'pre-line' }}>
        {slide.title}
      </div>
      <div style={{ fontSize: 14, color: '#666', fontWeight: 600, textAlign: 'center', lineHeight: 1.8, marginBottom: 40 }}>
        {slide.desc}
      </div>

      {/* ドットインジケーター */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8, height: 8, borderRadius: 4,
            background: i === step ? slide.border : '#DDD',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      <button onClick={() => isLast ? onDone() : setStep(s => s + 1)} style={{
        width: '100%', maxWidth: 320, padding: 16, borderRadius: 16,
        background: `linear-gradient(135deg, ${slide.border}, ${slide.border}99)`,
        color: 'white', border: 'none', fontSize: 16, fontWeight: 900,
        cursor: 'pointer', boxShadow: `0 4px 16px ${slide.border}60`,
      }}>
        {isLast ? '🌱 はじめる' : '次へ →'}
      </button>

      {!isLast && (
        <button onClick={onDone} style={{
          marginTop: 14, background: 'none', border: 'none',
          fontSize: 13, color: '#AAA', fontWeight: 700, cursor: 'pointer',
        }}>スキップ</button>
      )}
    </div>
  );
}
