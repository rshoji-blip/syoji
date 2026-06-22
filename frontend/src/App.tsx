import React, { useState } from 'react';
import './index.css';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Record from './pages/Record';
import Growth from './pages/Growth';
import Coach from './pages/Coach';
import PlayDetail from './pages/PlayDetail';
import Register from './pages/Register';
import Children from './pages/Children';
import { useGet } from './hooks/useApi';

type Page = 'home' | 'record' | 'growth' | 'coach';

interface AppState { has_users: boolean; child_name?: string; }

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [playDetailId, setPlayDetailId] = useState<string | null>(null);
  const [showChildren, setShowChildren] = useState(false);
  const { data, loading, refetch } = useGet<AppState>('/app_state');

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16, background: 'var(--bg)' }}>
      <div style={{ fontSize: 56, animation: 'bounce 1s ease infinite' }}>🌱</div>
      <div style={{ fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), #C39BD3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>あそぼ</div>
      <div style={{ fontSize: 13, color: 'var(--text-light)', fontWeight: 700 }}>よみこみ中…</div>
    </div>
  );

  if (!data?.has_users) return <Register onDone={() => refetch()} />;

  if (showChildren) return (
    <Children
      onBack={() => setShowChildren(false)}
      onSwitch={() => { refetch(); setShowChildren(false); }}
    />
  );

  if (playDetailId) return (
    <>
      <div style={{
        position: 'sticky', top: 0, background: 'white', padding: '14px 20px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '2px solid var(--border)', zIndex: 100,
        boxShadow: '0 2px 10px rgba(200,150,100,0.08)',
      }}>
        <div style={{ fontSize: 18, fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), #C39BD3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🌱 あそぼ</div>
        <button onClick={() => setPlayDetailId(null)} style={{
          background: 'var(--bg)', border: '2px solid var(--border)', borderRadius: 20,
          padding: '6px 14px', fontSize: 13, fontWeight: 800, cursor: 'pointer', color: 'var(--text-mid)',
        }}>‹ もどる</button>
      </div>
      <PlayDetail playId={playDetailId} childName={data.child_name || ''} onBack={() => setPlayDetailId(null)} />
      <BottomNav active={page} onNavigate={p => { setPlayDetailId(null); setPage(p); }} />
    </>
  );

  return (
    <>
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, background: 'white', padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '2px solid var(--border)', zIndex: 100,
        boxShadow: '0 2px 10px rgba(200,150,100,0.08)',
      }}>
        <div style={{ fontSize: 18, fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), #C39BD3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🌱 あそぼ
        </div>
        <button
          onClick={() => setShowChildren(true)}
          style={{
            background: 'var(--primary-light)', color: 'var(--primary)',
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800,
            border: '1.5px solid var(--primary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {data.child_name}ちゃん ▾
        </button>
      </div>

      {/* Pages */}
      <div style={{ minHeight: 'calc(100vh - 130px)' }}>
        {page === 'home' && <Home onNavigate={setPage} onPlayDetail={id => setPlayDetailId(id)} />}
        {page === 'record' && <Record />}
        {page === 'growth' && <Growth />}
        {page === 'coach' && <Coach />}
      </div>

      <BottomNav active={page} onNavigate={setPage} />
    </>
  );
}
