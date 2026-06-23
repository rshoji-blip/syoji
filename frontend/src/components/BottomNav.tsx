import React from 'react';

type Page = 'home' | 'browse' | 'record' | 'growth';

interface Props {
  active: Page;
  onNavigate: (page: Page) => void;
}

const items: { key: Page; icon: string; label: string }[] = [
  { key: 'home',   icon: '🏡', label: 'ホーム' },
  { key: 'browse', icon: '🔍', label: 'さがす' },
  { key: 'record', icon: '✏️', label: 'きろく' },
  { key: 'growth', icon: '🌿', label: 'せいちょう' },
];

export default function BottomNav({ active, onNavigate }: Props) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480,
      background: 'white',
      borderTop: '3px solid var(--border)',
      display: 'flex',
      padding: '10px 0 14px',
      zIndex: 200,
      borderRadius: '24px 24px 0 0',
      boxShadow: '0 -4px 20px rgba(200,150,100,0.10)',
    }}>
      {items.map(item => (
        <button key={item.key}
          onClick={() => onNavigate(item.key)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
          }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
            background: active === item.key ? 'var(--primary)' : 'transparent',
            boxShadow: active === item.key ? '0 3px 10px rgba(244,132,111,0.4)' : 'none',
            transform: active === item.key ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.2s',
          }}>{item.icon}</div>
          <span style={{
            fontSize: 10, fontWeight: 800,
            color: active === item.key ? 'var(--primary)' : 'var(--text-light)',
          }}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
