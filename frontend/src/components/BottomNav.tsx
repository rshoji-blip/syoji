import React from 'react';

interface Props {
  active: 'home' | 'record' | 'growth' | 'coach';
  onNavigate: (page: 'home' | 'record' | 'growth' | 'coach') => void;
}

const items = [
  { key: 'home', icon: '🏠', label: 'ホーム' },
  { key: 'record', icon: '✏️', label: '記録' },
  { key: 'growth', icon: '📊', label: '成長' },
  { key: 'coach', icon: '💭', label: '相談' },
] as const;

export default function BottomNav({ active, onNavigate }: Props) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480,
      background: '#fff', borderTop: '1px solid #F0EDE8',
      display: 'flex', padding: '8px 0',
      zIndex: 200,
    }}>
      {items.map(item => (
        <button key={item.key}
          onClick={() => onNavigate(item.key)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
          }}>
          <span style={{ fontSize: 22 }}>{item.icon}</span>
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: active === item.key ? 'var(--primary)' : 'var(--text-light)',
          }}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
