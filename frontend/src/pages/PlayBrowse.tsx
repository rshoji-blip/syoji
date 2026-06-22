import React, { useState } from 'react';
import { useGet } from '../hooks/useApi';

interface Play {
  id: string; name: string; materials: string[]; steps: string[];
  effects: string; dev_categories: string[]; age_min_months: number; age_max_months: number;
  reference_url?: string;
}

interface CategorySummary { name: string; icon: string; count: number; }

interface Props {
  initialCategory?: string;
  onBack: () => void;
  onPlayDetail: (id: string) => void;
}

const CAT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  探索: { bg: '#FFF3E0', border: '#FFB74D', text: '#E65100' },
  創造: { bg: '#FCE4EC', border: '#F48FB1', text: '#880E4F' },
  会話: { bg: '#E8F5E9', border: '#81C784', text: '#1B5E20' },
  運動: { bg: '#E3F2FD', border: '#64B5F6', text: '#0D47A1' },
  感覚: { bg: '#F3E5F5', border: '#CE93D8', text: '#4A148C' },
  協力: { bg: '#E0F7FA', border: '#4DD0E1', text: '#006064' },
  挑戦: { bg: '#FFF8E1', border: '#FFD54F', text: '#FF6F00' },
};

function ageStr(min: number, max: number) {
  const fmt = (m: number) => m >= 12 ? `${Math.floor(m/12)}歳${m%12 ? m%12+'ヶ月' : ''}` : `${m}ヶ月`;
  return `${fmt(min)}〜${fmt(max)}`;
}

export default function PlayBrowse({ initialCategory, onBack, onPlayDetail }: Props) {
  const [selectedCat, setSelectedCat] = useState<string | null>(initialCategory || null);
  const { data: catData } = useGet<{ categories: CategorySummary[] }>('/categories_summary');
  const { data: playsData, loading } = useGet<{ plays: Play[]; total: number }>(
    selectedCat ? `/plays_by_category/${encodeURIComponent(selectedCat)}` : '/categories_summary',
    [selectedCat]
  );

  const categories = catData?.categories || [];
  const plays = selectedCat ? (playsData as any)?.plays || [] : [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ヘッダー */}
      <div style={{
        background: 'white', padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '2px solid var(--border)',
        boxShadow: '0 2px 10px rgba(200,150,100,0.08)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={selectedCat ? () => setSelectedCat(null) : onBack} style={{
          background: 'var(--bg)', border: '2px solid var(--border)', borderRadius: 20,
          padding: '6px 14px', fontSize: 13, fontWeight: 800, cursor: 'pointer', color: 'var(--text-mid)',
        }}>‹ もどる</button>
        <div style={{ fontSize: 16, fontWeight: 900 }}>
          {selectedCat ? `${CAT_COLORS[selectedCat] ? selectedCat : ''}の遊び一覧` : '🎮 カテゴリから探す'}
        </div>
      </div>

      {!selectedCat ? (
        /* カテゴリ一覧 */
        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: 13, color: 'var(--text-light)', fontWeight: 700, marginBottom: 16 }}>
            今の月齢で体験できる遊びをカテゴリから探せます
          </div>
          {categories.map(cat => {
            const color = CAT_COLORS[cat.name] || { bg: '#F5F5F5', border: '#DDD', text: '#333' };
            return (
              <button key={cat.name} onClick={() => setSelectedCat(cat.name)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: color.bg, border: `2px solid ${color.border}`,
                borderRadius: 'var(--radius-sm)', padding: '16px 18px',
                marginBottom: 10, cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 28 }}>{cat.icon}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: color.text }}>{cat.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600, marginTop: 2 }}>
                      {cat.count}種類の遊びがあります
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 18, color: color.text }}>›</div>
              </button>
            );
          })}
        </div>
      ) : (
        /* 遊び一覧 */
        <div style={{ padding: '16px 20px 40px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)', fontWeight: 700 }}>読み込み中…</div>
          ) : plays.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)', fontWeight: 700 }}>
              今の月齢に合う遊びが見つかりませんでした
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, color: 'var(--text-light)', fontWeight: 700, marginBottom: 14 }}>
                {plays.length}種類の遊びが見つかりました
              </div>
              {plays.map((play: Play) => {
                const color = CAT_COLORS[selectedCat] || { bg: '#F5F5F5', border: '#DDD', text: '#333' };
                return (
                  <button key={play.id} onClick={() => onPlayDetail(play.id)} style={{
                    width: '100%', background: 'white', borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${color.border}`, padding: '16px',
                    marginBottom: 10, cursor: 'pointer', textAlign: 'left',
                    boxShadow: 'var(--shadow)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: color.text, marginBottom: 4 }}>
                          {play.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600, marginBottom: 6 }}>
                          {ageStr(play.age_min_months, play.age_max_months)}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600, lineHeight: 1.5 }}>
                          {play.effects}
                        </div>
                        {play.materials && play.materials.length > 0 && play.materials[0] !== 'なし' && (
                          <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 6, fontWeight: 600 }}>
                            🧰 {play.materials.slice(0, 3).join('・')}
                            {play.materials.length > 3 ? '…' : ''}
                          </div>
                        )}
                        {play.reference_url && (
                          <div style={{ fontSize: 11, color: '#E53935', marginTop: 4, fontWeight: 700 }}>
                            ▶ 動画あり
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 20, color: color.text, flexShrink: 0 }}>›</div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                      {play.dev_categories.map(c => {
                        const cc = CAT_COLORS[c] || { bg: '#F5F5F5', border: '#DDD', text: '#333' };
                        return (
                          <span key={c} style={{
                            fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10,
                            background: cc.bg, border: `1px solid ${cc.border}`, color: cc.text,
                          }}>{c}</span>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
