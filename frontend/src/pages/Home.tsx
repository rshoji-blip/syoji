import React, { useState, useEffect, useRef } from 'react';
import { useGet, apiPost } from '../hooks/useApi';
import { CATEGORY_ICONS } from '../types';

interface Play {
  id: string;
  name: string;
  dev_categories: string[];
  materials: string[];
  effects: string;
  steps_count: number;
  location_tags: string[];
}

interface HomeData {
  child_name: string;
  age_str: string;
  weather: { label: string; tag: string };
  plays: Play[];
  weak_cats: string[];
  monthly: Record<string, number>;
  is_weekend: boolean;
  users: Array<{ name: string; age_str: string }>;
}

interface Props {
  onNavigate: (page: 'home' | 'record' | 'growth' | 'coach') => void;
  onPlayDetail: (id: string) => void;
  onBrowse: (category?: string) => void;
}

const CAT_COLORS: Record<string, { bg: string; border: string; img: string }> = {
  探索: { bg: '#FFF3E0', border: '#FFB74D', img: '/static/images/icons/cat_explore.png' },
  創造: { bg: '#FCE4EC', border: '#F48FB1', img: '/static/images/icons/cat_create.png' },
  会話: { bg: '#E8F5E9', border: '#81C784', img: '/static/images/icons/cat_talk.png' },
  運動: { bg: '#E3F2FD', border: '#64B5F6', img: '/static/images/icons/cat_sport.png' },
  感覚: { bg: '#F3E5F5', border: '#CE93D8', img: '/static/images/icons/cat_sense.png' },
  協力: { bg: '#E0F7FA', border: '#4DD0E1', img: '/static/images/icons/cat_coop.png' },
  挑戦: { bg: '#FFF8E1', border: '#FFD54F', img: '/static/images/icons/cat_challenge.png' },
};

const WEATHER_EMOJI: Record<string, string> = {
  sunny: '☀️', cloudy: '☁️', rainy: '🌧️', snowy: '❄️',
};

type WeatherMode = '全天候' | '晴れ' | '雨';

const WEATHER_OPTIONS: { key: WeatherMode; emoji: string; label: string }[] = [
  { key: '全天候', emoji: '🌤️', label: 'すべて' },
  { key: '晴れ',  emoji: '☀️', label: 'そとあそび' },
  { key: '雨',    emoji: '🌧️', label: 'うちあそび' },
];

const WEATHER_THEME: Record<WeatherMode, {
  headerBg: string;
  pageBg: string;
  activeBtn: string;
  particle: string;
}> = {
  '全天候': {
    headerBg: 'linear-gradient(135deg, #7DCFB6 0%, #85C1E9 100%)',
    pageBg: '#F8FFFE',
    activeBtn: '#7DCFB6',
    particle: '',
  },
  '晴れ': {
    headerBg: 'linear-gradient(160deg, #FFD54F 0%, #FF8A65 60%, #FFB74D 100%)',
    pageBg: '#FFFDF0',
    activeBtn: '#FF8A65',
    particle: '☀️',
  },
  '雨': {
    headerBg: 'linear-gradient(160deg, #546E7A 0%, #78909C 50%, #90A4AE 100%)',
    pageBg: '#F0F4F8',
    activeBtn: '#78909C',
    particle: '🌧️',
  },
};

export default function Home({ onNavigate, onPlayDetail, onBrowse }: Props) {
  const [weather, setWeather] = useState<WeatherMode>('全天候');
  const [visible, setVisible] = useState(true);
  const { data, loading, refetch } = useGet<HomeData>(`/home?weather=${encodeURIComponent(weather)}`, [weather]);
  const theme = WEATHER_THEME[weather];

  // 天気切り替え時にフェードアウト→データ更新→フェードイン
  const handleWeatherChange = (next: WeatherMode) => {
    if (next === weather) return;
    setVisible(false);
    setTimeout(() => {
      setWeather(next);
      setVisible(true);
    }, 220);
  };

  const switchChild = async (idx: number) => {
    await apiPost('/switch_child', { child_idx: idx });
    await refetch();
  };

  const today = new Date();
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][today.getDay()];
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日（${weekday}）`;

  return (
    <div style={{
      paddingBottom: 100,
      background: theme.pageBg,
      transition: 'background 0.5s ease',
      minHeight: '100vh',
    }}>

      {/* ヘッダー */}
      <div style={{
        background: theme.headerBg,
        padding: '20px 20px 28px',
        transition: 'background 0.5s ease',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 天気パーティクル装飾 */}
        {weather === '晴れ' && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {['10%','30%','55%','75%','90%'].map((left, i) => (
              <div key={i} style={{
                position: 'absolute', left, top: `${10 + i * 15}%`,
                fontSize: 18, opacity: 0.18,
                animation: `float ${2.5 + i * 0.4}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.3}s`,
              }}>✨</div>
            ))}
          </div>
        )}
        {weather === '雨' && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {['5%','20%','40%','60%','80%','95%'].map((left, i) => (
              <div key={i} style={{
                position: 'absolute', left, top: '-10px',
                width: 2, background: 'rgba(255,255,255,0.3)',
                height: `${30 + i * 8}px`, borderRadius: 2,
                animation: `rain ${0.8 + i * 0.15}s linear infinite`,
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
        )}

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 700, marginBottom: 6, position: 'relative' }}>
          {dateStr}
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'white', lineHeight: 1.3, position: 'relative' }}>
          {data ? `${data.child_name}ちゃんと` : ''}<br />今日何して遊ぼう？
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 6, fontWeight: 600, position: 'relative' }}>
          {data?.age_str} · 成長に合わせた遊びをピックアップしました
        </div>

        {/* 天気トグル */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14, position: 'relative' }}>
          {WEATHER_OPTIONS.map(opt => (
            <button key={opt.key} onClick={() => handleWeatherChange(opt.key)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800,
              cursor: 'pointer', transition: 'all 0.25s ease',
              border: weather === opt.key ? '2px solid white' : '2px solid rgba(255,255,255,0.4)',
              background: weather === opt.key ? 'white' : 'rgba(255,255,255,0.15)',
              color: weather === opt.key ? theme.activeBtn : 'white',
              transform: weather === opt.key ? 'scale(1.05)' : 'scale(1)',
              boxShadow: weather === opt.key ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
            }}>
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>

        {/* 子ども切り替え */}
        {data && data.users.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', position: 'relative' }}>
            {data.users.map((u, i) => (
              <button key={u.name} onClick={() => switchChild(i)} style={{
                flexShrink: 0, padding: '5px 14px', borderRadius: 20,
                border: `2px solid ${u.name === data.child_name ? 'white' : 'rgba(255,255,255,0.5)'}`,
                fontSize: 12, fontWeight: 800, cursor: 'pointer',
                background: u.name === data.child_name ? 'white' : 'transparent',
                color: u.name === data.child_name ? theme.activeBtn : 'white',
              }}>{u.name}</button>
            ))}
          </div>
        )}
      </div>

      {/* カードエリア：フェードイン */}
      <div style={{
        padding: '0 16px',
        opacity: visible && !loading ? 1 : 0,
        transform: visible && !loading ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}>

        {/* おすすめ遊び */}
        <div style={{ margin: '20px 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            💡 今日のおすすめ遊び
            {weather === '晴れ' && <span style={{ fontSize: 11, fontWeight: 700, color: '#FF8A65', background: '#FFF3E0', padding: '2px 8px', borderRadius: 10 }}>そとあそび向け</span>}
            {weather === '雨' && <span style={{ fontSize: 11, fontWeight: 700, color: '#78909C', background: '#ECEFF1', padding: '2px 8px', borderRadius: 10 }}>うちあそび向け</span>}
          </div>
          <button onClick={() => onBrowse()} style={{
            fontSize: 12, fontWeight: 800, color: 'var(--primary)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>もっと見る →</button>
        </div>

        {(data?.plays ?? []).map((play) => {
          const mainCat = play.dev_categories.find(c => data?.weak_cats.includes(c)) || play.dev_categories[0];
          const color = CAT_COLORS[mainCat] || { bg: '#F5F5F5', border: '#DDD', img: '' };
          const materials = play.materials.filter(m => m !== 'なし').slice(0, 2);

          return (
            <button key={play.id} onClick={() => onPlayDetail(play.id)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'white', borderRadius: 16,
              padding: '14px 14px 14px 10px', margin: '8px 0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              border: `2px solid ${color.border}40`,
              cursor: 'pointer', width: '100%', textAlign: 'left',
            }}>
              {/* カテゴリイラスト */}
              <div style={{
                width: 70, height: 70, borderRadius: 14, flexShrink: 0,
                background: color.bg, border: `2px solid ${color.border}60`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              }}>
                {color.img ? (
                  <img src={color.img} alt={mainCat}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: 30 }}>{CATEGORY_ICONS[mainCat]}</span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* 遊び名 + 場所タグ */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', lineHeight: 1.3 }}>
                    {play.name}
                  </div>
                  {play.location_tags?.slice(0, 1).map(tag => {
                    const tagMap: Record<string, { emoji: string; color: string }> = {
                      '室内': { emoji: '🏠', color: '#64B5F6' },
                      '屋外': { emoji: '🌳', color: '#81C784' },
                      '室外': { emoji: '🌳', color: '#81C784' },
                    };
                    const t = tagMap[tag] || { emoji: '📍', color: '#AAA' };
                    return (
                      <span key={tag} style={{
                        fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 10,
                        background: `${t.color}22`, color: t.color,
                        border: `1.5px solid ${t.color}66`, whiteSpace: 'nowrap',
                      }}>{t.emoji} {tag}</span>
                    );
                  })}
                </div>
                {/* 一言効果：最重要情報として大きく */}
                {play.effects && (
                  <div style={{
                    fontSize: 12, color: '#555', fontWeight: 700, marginBottom: 7, lineHeight: 1.5,
                    borderLeft: `3px solid ${color.border}`,
                    paddingLeft: 8,
                  }}>
                    {play.effects.length > 48 ? play.effects.slice(0, 48) + '…' : play.effects}
                  </div>
                )}
                {/* カテゴリバッジ + ステップ数（補助情報として小さく） */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                  {play.dev_categories.slice(0, 2).map(c => (
                    <span key={c} style={{
                      fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 8,
                      background: (CAT_COLORS[c] || { bg: '#f5f5f5' }).bg,
                      color: (CAT_COLORS[c] || { border: '#999' }).border,
                      border: `1px solid ${(CAT_COLORS[c] || { border: '#ddd' }).border}50`,
                    }}>{CATEGORY_ICONS[c]}{c}</span>
                  ))}
                  {play.steps_count > 0 && (
                    <span style={{ fontSize: 10, color: 'var(--text-light)', fontWeight: 600 }}>
                      {play.steps_count}ステップ
                    </span>
                  )}
                </div>
              </div>
              <div style={{ color: '#CCC', fontSize: 20, flexShrink: 0 }}>›</div>
            </button>
          );
        })}

        {/* もっと探すボタン */}
        <button onClick={() => onBrowse()} style={{
          width: '100%', padding: 14, borderRadius: 14, marginTop: 8, marginBottom: 16,
          background: 'white', color: 'var(--primary)',
          border: '2px solid var(--primary)', fontSize: 14, fontWeight: 900,
          cursor: 'pointer',
        }}>🔍 さがすタブでもっと見つける →</button>

        {/* きろくボタン */}
        <button onClick={() => onNavigate('record')} style={{
          width: '100%', padding: 16, borderRadius: 16,
          background: 'linear-gradient(135deg, var(--primary), #F4A0B5)',
          color: 'white', border: 'none', fontSize: 15, fontWeight: 900,
          cursor: 'pointer', marginBottom: 16,
          boxShadow: '0 4px 14px rgba(244,132,111,0.35)',
        }}>✏️ 今日の遊びを記録する</button>

      </div>
    </div>
  );
}
