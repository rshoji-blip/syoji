import React, { useState } from 'react';
import { useGet, apiPost } from '../hooks/useApi';
import RadarChart from '../components/RadarChart';
import { CATEGORY_ICONS, ALL_CATEGORIES } from '../types';

interface HomeData {
  child_name: string;
  age_str: string;
  weather: { label: string; tag: string };
  plays: Array<{ id: string; name: string; dev_categories: string[]; style: string }>;
  category_counts: Record<string, number>;
  total_today: number;
  users: Array<{ name: string; age_str: string }>;
  weak_cats: string[];
  monthly: Record<string, number>;
  is_weekend: boolean;
}

interface Props {
  onNavigate: (page: 'home' | 'record' | 'growth' | 'coach') => void;
  onPlayDetail: (id: string) => void;
}

const CAT_COLORS: Record<string, { bg: string; border: string }> = {
  "探索": { bg: "#E8F4FD", border: "#85C1E9" },
  "創造": { bg: "#FDE8EF", border: "#F4A0B5" },
  "会話": { bg: "#E6F8F3", border: "#7DCFB6" },
  "運動": { bg: "#F4EBF8", border: "#C39BD3" },
  "感覚": { bg: "#FEFAE5", border: "#F9E784" },
  "協力": { bg: "#FEE9E5", border: "#F4846F" },
  "挑戦": { bg: "#EAFAF1", border: "#85D3A5" },
};

const PLAY_BG = ["#FEE9E5", "#E8F4FD", "#E6F8F3"];
const PLAY_BORDER = ["#F4846F", "#85C1E9", "#7DCFB6"];
const PLAY_ICONS = ["🎯", "🌈", "⭐"];

// 「伸ばせる経験」のポジティブな説明文
const GROW_REASON: Record<string, string> = {
  "探索": "新しいものへの好奇心をもっと育てるチャンスです！",
  "創造": "作ったり描いたりする力をぐんと伸ばせますよ",
  "会話": "言葉のやり取りや読み聞かせで表現力がアップします",
  "運動": "体を思いきり動かすと、心も体も元気になります",
  "感覚": "触ったり感じたりする体験で感受性が豊かになります",
  "協力": "一緒に何かをする経験で、社会性がぐんと育ちます",
  "挑戦": "少し難しいことにトライして、自信をつけましょう！",
};

export default function Home({ onNavigate, onPlayDetail }: Props) {
  const { data, loading, refetch } = useGet<HomeData>('/home');

  const switchChild = async (idx: number) => {
    await apiPost('/switch_child', { child_idx: idx });
    await refetch();
  };

  if (loading || !data) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
      <div style={{ fontSize: 40, animation: 'bounce 1s ease infinite' }}>🌱</div>
      <div style={{ fontSize: 14, color: 'var(--text-light)', fontWeight: 700 }}>読み込み中…</div>
    </div>
  );

  const today = new Date();
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][today.getDay()];
  const dateStr = `${today.getMonth()+1}月${today.getDate()}日（${weekday}）`;
  const greeting = data.is_weekend
    ? `${weekday}曜日！${data.child_name}ちゃんと遊ぼう 🎉`
    : `今日は${weekday}曜日。週末の準備を 🗓️`;

  const topGrowCat = data.weak_cats[0];

  return (
    <div style={{ paddingBottom: 100 }}>

      {/* ヘッダー */}
      <div style={{
        background: 'linear-gradient(135deg, #7DCFB6, #85C1E9)',
        padding: '18px 20px 22px',
      }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>{dateStr} · {data.weather.label}</div>
        <div style={{ fontSize: 21, fontWeight: 900, color: 'white', marginTop: 4, lineHeight: 1.3 }}>
          {greeting}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: 600 }}>
          {data.child_name}ちゃん {data.age_str}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* 子ども切り替え */}
        {data.users.length > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: '12px 0 4px', overflowX: 'auto' }}>
            {data.users.map((u, i) => (
              <button key={u.name} onClick={() => switchChild(i)} style={{
                flexShrink: 0, padding: '7px 16px', borderRadius: 20,
                border: `2.5px solid ${u.name === data.child_name ? 'var(--primary)' : 'var(--border)'}`,
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
                background: u.name === data.child_name ? 'var(--primary)' : 'white',
                color: u.name === data.child_name ? 'white' : 'var(--text-light)',
                boxShadow: u.name === data.child_name ? '0 3px 10px rgba(244,132,111,0.35)' : 'none',
              }}>{u.name} {u.age_str}</button>
            ))}
          </div>
        )}

        {/* ★ 核心カード：今週チャレンジしてみよう */}
        {topGrowCat && (
          <div style={{
            background: 'linear-gradient(135deg, #FFF8EF, #FEE9E5)',
            borderRadius: 'var(--radius)', padding: 20,
            margin: '12px 0',
            border: '2.5px solid var(--primary)',
            boxShadow: '0 4px 16px rgba(244,132,111,0.18)',
            animation: 'fadeUp 0.4s ease both',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: 8 }}>
              🌱 今週チャレンジしてみよう！
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                background: (CAT_COLORS[topGrowCat] || { bg: '#f5f5f5' }).bg,
                border: `3px solid ${(CAT_COLORS[topGrowCat] || { border: '#ddd' }).border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
              }}>{CATEGORY_ICONS[topGrowCat]}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>
                  「{topGrowCat}」を伸ばそう
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 2, fontWeight: 600, lineHeight: 1.5 }}>
                  {GROW_REASON[topGrowCat]}
                </div>
              </div>
            </div>

            {/* もっと伸ばせるカテゴリ */}
            {data.weak_cats.length > 1 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {data.weak_cats.slice(1).map(cat => (
                  <span key={cat} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: (CAT_COLORS[cat] || { bg: '#f5f5f5' }).bg,
                    border: `1.5px solid ${(CAT_COLORS[cat] || { border: '#ddd' }).border}50`,
                    color: (CAT_COLORS[cat] || { border: '#999' }).border,
                    padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  }}>{CATEGORY_ICONS[cat]} {cat}も伸ばせます</span>
                ))}
              </div>
            )}

            <button onClick={() => onNavigate('growth')} style={{
              width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)',
              background: 'white', color: 'var(--primary)',
              border: '2px solid var(--primary)',
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
            }}>📊 成長バランスを詳しく見る →</button>
          </div>
        )}

        {/* おすすめ遊び：理由付きで表示 */}
        <div style={{ animation: 'fadeUp 0.4s ease 0.1s both' }}>
          <div style={{
            fontSize: 14, fontWeight: 900, color: 'var(--text)', margin: '20px 0 6px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <span>今日試してほしい遊び</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600, marginBottom: 10 }}>
            {data.child_name}ちゃんの成長をもっと伸ばせる遊びをピックアップしました
          </div>

          {data.plays.map((play, i) => {
            const growCat = play.dev_categories.find(c => data.weak_cats.includes(c)) || play.dev_categories[0];
            return (
              <button key={play.id} onClick={() => onPlayDetail(play.id)} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'white', borderRadius: 'var(--radius-sm)',
                padding: '14px 16px', margin: '8px 0',
                boxShadow: 'var(--shadow)', border: `2px solid ${PLAY_BORDER[i]}30`,
                cursor: 'pointer', width: '100%', textAlign: 'left',
              }}>
                <div style={{
                  width: 54, height: 54, borderRadius: 16, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, background: PLAY_BG[i],
                  border: `2.5px solid ${PLAY_BORDER[i]}50`,
                }}>{PLAY_ICONS[i]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)' }}>{play.name}</div>
                  {/* なぜこの遊びか */}
                  {growCat && data.weak_cats.includes(growCat) && (
                    <div style={{
                      fontSize: 11, color: 'var(--primary)', fontWeight: 800, marginTop: 3,
                      display: 'flex', alignItems: 'center', gap: 3,
                    }}>
                      🌱 {growCat}の力を伸ばせます
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    {play.dev_categories.slice(0, 2).map(c => (
                      <span key={c} style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                        background: (CAT_COLORS[c] || { bg: '#f5f5f5' }).bg,
                        color: (CAT_COLORS[c] || { border: '#999' }).border,
                        border: `1.5px solid ${(CAT_COLORS[c] || { border: '#ddd' }).border}40`,
                      }}>{CATEGORY_ICONS[c]}{c}</span>
                    ))}
                  </div>
                </div>
                <div style={{ color: 'var(--text-light)', fontSize: 22 }}>›</div>
              </button>
            );
          })}
        </div>

        {/* 今月の経験バランス（ミニ） */}
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 20, margin: '16px 0', boxShadow: 'var(--shadow)', border: '2px solid var(--border)', animation: 'fadeUp 0.4s ease 0.2s both' }}>
          <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            🕸️ <span>今月の経験バランス</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <RadarChart counts={data.monthly} />
          </div>
          <button onClick={() => onNavigate('record')} style={{
            width: '100%', padding: 14, borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, var(--primary), #F4A0B5)',
            color: 'white', border: 'none', fontSize: 15, fontWeight: 900,
            cursor: 'pointer', marginTop: 14,
            boxShadow: '0 4px 14px rgba(244,132,111,0.4)',
          }}>✏️ 一緒に遊んだことを記録する</button>
        </div>

      </div>
    </div>
  );
}
