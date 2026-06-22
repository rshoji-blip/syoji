import React, { useState, useRef, useEffect } from 'react';
import { useGet, apiPost } from '../hooks/useApi';

interface CoachData {
  child_name: string;
  age_str: string;
  initial_msg: string;
}

interface Message {
  role: 'coach' | 'user';
  text: string;
}

const QUICK_QUESTIONS = [
  { label: '📈 成長について', text: '成長について教えて' },
  { label: '🎮 おすすめ遊び', text: 'おすすめの遊びは？' },
  { label: '😟 不安がある', text: '育児が不安です' },
  { label: '💬 言葉の発達', text: '言葉の発達が心配' },
  { label: '😪 疲れています', text: '最近疲れています' },
];

export default function Coach() {
  const { data, loading } = useGet<CoachData>('/coach_data');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data) setMessages([{ role: 'coach', text: data.initial_msg }]);
  }, [data]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async (text: string) => {
    if (!text.trim() || sending) return;
    setInput('');
    setShowQuick(false);
    setMessages(m => [...m, { role: 'user', text }]);
    setSending(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    const res = await apiPost<{ ok: boolean; reply: string }>('/coach_message', { message: text });
    setSending(false);
    if (res.ok) setMessages(m => [...m, { role: 'coach', text: res.reply }]);
  };

  if (loading || !data) return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-light)' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>💭</div>
      <div>読み込み中…</div>
    </div>
  );

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      {/* Coach header */}
      <div style={{ padding: '16px 0 8px', animation: 'fadeUp 0.4s ease both', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #5B8EF0, #BB6BD9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, boxShadow: '0 4px 16px rgba(91,142,240,0.3)',
          }}>🌸</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>AI保育コーチ</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }} />
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{data.child_name}ちゃん（{data.age_str}）担当</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            {msg.role === 'coach' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌸</div>
            )}
            <div style={{
              maxWidth: '80%', padding: '12px 14px', borderRadius: 16,
              fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap',
              background: msg.role === 'coach' ? 'white' : 'var(--primary)',
              color: msg.role === 'coach' ? 'var(--text)' : 'white',
              boxShadow: msg.role === 'coach' ? 'var(--shadow)' : 'none',
              borderBottomLeftRadius: msg.role === 'coach' ? 4 : 16,
              borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
            }}>{msg.text}</div>
          </div>
        ))}
        {sending && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌸</div>
            <div style={{ background: 'white', borderRadius: '16px 16px 16px 4px', padding: '14px 18px', boxShadow: 'var(--shadow)', display: 'flex', gap: 5 }}>
              {[0, 0.2, 0.4].map((d, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-light)', animation: `pulse 1s ease ${d}s infinite` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick questions */}
      {showQuick && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '8px 0', flexShrink: 0 }}>
          {QUICK_QUESTIONS.map(q => (
            <button key={q.text} onClick={() => send(q.text)} style={{
              flexShrink: 0, padding: '8px 14px',
              background: 'white', border: '1.5px solid var(--border)',
              borderRadius: 20, fontSize: 12, fontWeight: 600,
              color: 'var(--text-mid)', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>{q.label}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        background: 'white', borderRadius: 24, padding: '8px 8px 8px 16px',
        boxShadow: 'var(--shadow)', marginBottom: 16, flexShrink: 0,
      }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="保育コーチに相談する…" maxLength={200}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }}
        />
        <button onClick={() => send(input)} style={{
          width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)',
          border: 'none', cursor: 'pointer', fontSize: 18, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>➤</button>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}
