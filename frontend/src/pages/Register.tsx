import React, { useState } from 'react';
import { apiPost } from '../hooks/useApi';

interface Props { onDone: () => void; }

export default function Register({ onDone }: Props) {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthdate) return;
    setSaving(true);
    await apiPost('/register_child', { name, birthdate });
    onDone();
  };

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <div style={{ textAlign: 'center', padding: '32px 0 16px', animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>👶</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>お子さんを登録</div>
        <div style={{ fontSize: 14, color: 'var(--text-mid)' }}>一緒に成長を記録しましょう</div>
      </div>

      <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow)', animation: 'fadeUp 0.4s ease 0.1s both' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>お名前</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="はなこ" required
              style={{ width: '100%', padding: '14px 16px', fontSize: 16, border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>生年月日</label>
            <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', fontSize: 16, border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <button type="submit" disabled={saving} style={{
            width: '100%', padding: 15, borderRadius: 'var(--radius-sm)',
            background: 'var(--primary)', color: 'white', border: 'none',
            fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8,
          }}>🌱 登録して始める</button>
        </form>
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
