import React, { useState, useEffect } from 'react';
import './index.css';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Record from './pages/Record';
import Growth from './pages/Growth';
import Coach from './pages/Coach';
import PlayDetail from './pages/PlayDetail';
import Register from './pages/Register';
import { useGet } from './hooks/useApi';

type Page = 'home' | 'record' | 'growth' | 'coach';

interface AppState {
  has_users: boolean;
  child_name?: string;
}

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [playDetailId, setPlayDetailId] = useState<string | null>(null);
  const { data, loading, refetch } = useGet<AppState>('/app_state');

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🌱</div>
      <div style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg, #5B8EF0, #BB6BD9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>そよじ</div>
      <div style={{ fontSize: 14, color: 'var(--text-light)' }}>読み込み中…</div>
    </div>
  );

  if (!data?.has_users) {
    return <Register onDone={() => refetch()} />;
  }

  if (playDetailId) {
    return (
      <>
        <div style={{ position: 'sticky', top: 0, background: 'white', padding: '16px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', zIndex: 100 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg, #5B8EF0, #BB6BD9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🌱 そよじ</div>
          </div>
          <button onClick={() => setPlayDetailId(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-mid)' }}>‹ 戻る</button>
        </div>
        <PlayDetail playId={playDetailId} childName={data.child_name || ''} onBack={() => setPlayDetailId(null)} />
        <BottomNav active={page} onNavigate={p => { setPlayDetailId(null); setPage(p); }} />
      </>
    );
  }

  const pageNames: Record<Page, string> = {
    home: 'ホーム', record: '今日の記録', growth: '成長の記録', coach: 'AI保育コーチ',
  };

  return (
    <>
      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, background: 'white', padding: '14px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg, #5B8EF0, #BB6BD9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🌱 そよじ</div>
          <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{pageNames[page]}</div>
        </div>
        <button onClick={() => { setPage('home'); refetch(); }} style={{ background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', color: 'var(--text-light)' }}>
          {data.child_name}
        </button>
      </div>

      {/* Pages */}
      {page === 'home' && <Home onNavigate={setPage} onPlayDetail={id => setPlayDetailId(id)} />}
      {page === 'record' && <Record />}
      {page === 'growth' && <Growth />}
      {page === 'coach' && <Coach />}

      <BottomNav active={page} onNavigate={setPage} />
    </>
  );
}
