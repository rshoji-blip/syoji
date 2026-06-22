import React, { useState } from 'react';
import { useGet, apiPost } from '../hooks/useApi';

interface Child { name: string; birthdate: string; }
interface ChildrenData { children: Child[]; active: string; }

interface Props {
  onBack: () => void;
  onSwitch: () => void;
}

function calcAgeStr(birthdate: string): string {
  const birth = new Date(birthdate);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months--;
  months = Math.max(0, months);
  const years = Math.floor(months / 12);
  const m = months % 12;
  return years > 0 ? `${years}歳${m}ヶ月` : `${months}ヶ月`;
}

export default function Children({ onBack, onSwitch }: Props) {
  const { data, refetch } = useGet<ChildrenData>('/children');
  const [editTarget, setEditTarget] = useState<Child | null>(null);
  const [editName, setEditName] = useState('');
  const [editBirthdate, setEditBirthdate] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBirthdate, setNewBirthdate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSwitch = async (idx: number) => {
    await apiPost('/switch_child', { child_idx: idx });
    onSwitch();
  };

  const handleEdit = (child: Child) => {
    setEditTarget(child);
    setEditName(child.name);
    setEditBirthdate(child.birthdate);
    setError('');
  };

  const handleUpdate = async () => {
    if (!editTarget || !editName || !editBirthdate) return;
    setSaving(true);
    await apiPost('/update_child', { old_name: editTarget.name, new_name: editName, new_birthdate: editBirthdate });
    setSaving(false);
    setEditTarget(null);
    refetch();
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm(`「${name}」を削除しますか？`)) return;
    await apiPost('/delete_child', { name });
    refetch();
    onSwitch();
  };

  const handleAdd = async () => {
    if (!newName || !newBirthdate) return;
    setSaving(true);
    setError('');
    const res = await apiPost<{ ok: boolean; error?: string }>('/register_child', { name: newName, birthdate: newBirthdate });
    setSaving(false);
    if (!res.ok && res.error === 'duplicate') {
      setError(`「${newName}」はすでに登録されています`);
      return;
    }
    setNewName('');
    setNewBirthdate('');
    setShowAdd(false);
    refetch();
    onSwitch();
  };

  const children = data?.children || [];
  const active = data?.active || '';

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', fontSize: 16,
    border: '2px solid var(--border)', borderRadius: 12,
    outline: 'none', fontFamily: 'inherit', fontWeight: 700,
    background: 'var(--bg)', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ヘッダー */}
      <div style={{
        background: 'white', padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '2px solid var(--border)',
        boxShadow: '0 2px 10px rgba(200,150,100,0.08)',
      }}>
        <button onClick={onBack} style={{
          background: 'var(--bg)', border: '2px solid var(--border)', borderRadius: 20,
          padding: '6px 14px', fontSize: 13, fontWeight: 800, cursor: 'pointer', color: 'var(--text-mid)',
        }}>‹ もどる</button>
        <div style={{ fontSize: 16, fontWeight: 900 }}>👶 こどもの管理</div>
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        {/* 子供一覧 */}
        {children.map((child, idx) => (
          <div key={child.name} style={{
            background: 'white', borderRadius: 'var(--radius)', padding: 20,
            marginBottom: 12, boxShadow: 'var(--shadow)',
            border: child.name === active ? '2.5px solid var(--primary)' : '2px solid var(--border)',
          }}>
            {editTarget?.name === child.name ? (
              /* 編集フォーム */
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>✏️ 情報を編集</div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 5 }}>名前</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 5 }}>生年月日</label>
                  <input type="date" value={editBirthdate} onChange={e => setEditBirthdate(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleUpdate} disabled={saving} style={{
                    flex: 1, padding: '10px', borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--primary), #F4A0B5)',
                    color: 'white', border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                  }}>保存</button>
                  <button onClick={() => setEditTarget(null)} style={{
                    flex: 1, padding: '10px', borderRadius: 10,
                    background: 'var(--bg)', border: '2px solid var(--border)',
                    fontSize: 14, fontWeight: 800, cursor: 'pointer', color: 'var(--text-mid)',
                  }}>キャンセル</button>
                </div>
              </div>
            ) : (
              /* 通常表示 */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 28 }}>👶</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900 }}>{child.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600 }}>
                        {calcAgeStr(child.birthdate)} · {child.birthdate}
                      </div>
                    </div>
                  </div>
                  {child.name === active && (
                    <div style={{
                      background: 'var(--primary-light)', color: 'var(--primary)',
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                      border: '1.5px solid var(--primary)',
                    }}>表示中</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {child.name !== active && (
                    <button onClick={() => handleSwitch(idx)} style={{
                      flex: 1, padding: '8px', borderRadius: 10,
                      background: 'linear-gradient(135deg, var(--primary), #F4A0B5)',
                      color: 'white', border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                    }}>切り替え</button>
                  )}
                  <button onClick={() => handleEdit(child)} style={{
                    flex: 1, padding: '8px', borderRadius: 10,
                    background: 'var(--bg)', border: '2px solid var(--border)',
                    fontSize: 13, fontWeight: 800, cursor: 'pointer', color: 'var(--text-mid)',
                  }}>✏️ 編集</button>
                  {children.length > 1 && (
                    <button onClick={() => handleDelete(child.name)} style={{
                      padding: '8px 14px', borderRadius: 10,
                      background: '#FEE9E5', border: '2px solid #F4846F',
                      fontSize: 13, fontWeight: 800, cursor: 'pointer', color: '#E74C3C',
                    }}>削除</button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 子供を追加 */}
        {showAdd ? (
          <div style={{
            background: 'white', borderRadius: 'var(--radius)', padding: 20,
            boxShadow: 'var(--shadow)', border: '2px solid var(--border)',
          }}>
            <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 14 }}>🌱 新しいお子さんを追加</div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 5 }}>名前</label>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="はなこ" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 5 }}>生年月日</label>
              <input type="date" value={newBirthdate} onChange={e => setNewBirthdate(e.target.value)} style={inputStyle} />
            </div>
            {error && (
              <div style={{
                background: '#FEE9E5', border: '2px solid var(--primary)',
                borderRadius: 10, padding: '8px 12px', marginBottom: 12,
                fontSize: 13, fontWeight: 700, color: 'var(--primary)',
              }}>⚠️ {error}</div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleAdd} disabled={saving || !newName || !newBirthdate} style={{
                flex: 1, padding: '10px', borderRadius: 10,
                background: 'linear-gradient(135deg, var(--primary), #F4A0B5)',
                color: 'white', border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer',
              }}>追加する</button>
              <button onClick={() => { setShowAdd(false); setError(''); }} style={{
                flex: 1, padding: '10px', borderRadius: 10,
                background: 'var(--bg)', border: '2px solid var(--border)',
                fontSize: 14, fontWeight: 800, cursor: 'pointer', color: 'var(--text-mid)',
              }}>キャンセル</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)} style={{
            width: '100%', padding: 16, borderRadius: 'var(--radius)',
            background: 'white', border: '2.5px dashed var(--primary)',
            color: 'var(--primary)', fontSize: 15, fontWeight: 900, cursor: 'pointer',
          }}>＋ お子さんを追加する</button>
        )}
      </div>
    </div>
  );
}
