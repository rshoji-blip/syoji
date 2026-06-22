import React, { useState, useRef, useEffect } from 'react';
import { useGet, apiPost } from '../hooks/useApi';

interface CoachData {
  child_name: string;
  age_str: string;
  initial_msg: string;
}

interface Message { role: 'coach' | 'user'; text: string; }

const QUICK_QUESTIONS = [
  { label: '🎯 何して遊ぶ？', text: '今日何して遊べばいいですか？' },
  { label: '🌧️ 雨の日の遊び', text: '雨の日にできる室内遊びを教えて' },
  { label: '🌳 外遊びのアイデア', text: '外でできる遊びを教えて' },
  { label: '📊 成長が心配', text: '子どもの成長で気になることがあります' },
  { label: '⏱️ 短時間で遊べる', text: '10〜15分でできる遊びはありますか？' },
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
    setInput(''); setShowQuick(false);
    setMessages(m => [...m, { role: 'user', text }]);
    setSending(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 700));
    const res = await apiPost<{ ok: boolean; reply: string }>('/coach_message', { message: text });
    setSending(false);
    if (res.ok) setMessages(m => [...m, { role: 'coach', text: res.reply }]);
  };

  if (loading || !data) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
      <div style={{ fontSize: 40, animation: 'bounce 1s ease infinite' }}>🌸</div>
      <div style={{ fontSize: 14, color: 'var(--text-light)', fontWeight: 700 }}>よみこみ中…</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', paddingBottom: 0 }}>
      {/* Coach header */}
      <div style={{ background: 'linear-gradient(135deg, #F4A0B5, #C39BD3)', padding: '18px 20px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, border: '3px solid rgba(255,255,255,0.6)',
            boxShadow: '0 4px 16px rgba(195,155,211,0.4)',
          }}>🌸</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>AI保育コーチ</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#A8E6C8', animation: 'pulse 2s infinite' }} />
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>
                {data.child_name}ちゃん（{data.age_str}）たんとう
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', animation: 'fadeUp 0.3s ease both' }}>
            {msg.role === 'coach' && (
              <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #F4A0B5, #C39BD3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 2px 8px rgba(195,155,211,0.35)' }}>🌸</div>
            )}
            <div style={{
              maxWidth: '80%', padding: '12px 16px',
              borderRadius: msg.role === 'coach' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
              fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', fontWeight: 600,
              background: msg.role === 'coach' ? 'white' : 'linear-gradient(135deg, #F4846F, #F4A0B5)',
              color: msg.role === 'coach' ? 'var(--text)' : 'white',
              boxShadow: msg.role === 'coach' ? 'var(--shadow)' : '0 3px 12px rgba(244,132,111,0.35)',
              border: msg.role === 'coach' ? '2px solid var(--border)' : 'none',
            }}>{msg.text}</div>
          </div>
        ))}

        {sending && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #F4A0B5, #C39BD3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌸</div>
            <div style={{ background: 'white', borderRadius: '18px 18px 18px 4px', padding: '14px 18px', boxShadow: 'var(--shadow)', border: '2px solid var(--border)', display: 'flex', gap: 6, alignItems: 'center' }}>
              {[0, 0.25, 0.5].map((d, i) => (
                <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: '#F4A0B5', animation: `pulse 1.2s ease ${d}s infinite` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick questions */}
      {showQuick && (
        <div style={{ flexShrink: 0, display: 'flex', gap: 7, overflowX: 'auto', padding: '8px 16px' }}>
          {QUICK_QUESTIONS.map(q => (
            <button key={q.text} onClick={() => send(q.text)} style={{
              flexShrink: 0, padding: '8px 14px',
              background: 'white', border: '2px solid var(--border)',
              borderRadius: 20, fontSize: 12, fontWeight: 800,
              color: 'var(--text-mid)', cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow)',
            }}>{q.label}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        flexShrink: 0, display: 'flex', gap: 10, alignItems: 'center',
        background: 'white', borderTop: '2px solid var(--border)',
        padding: '12px 16px 20px',
      }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="ほいくコーチにそうだんする…" maxLength={200}
          style={{
            flex: 1, border: '2.5px solid var(--border)', outline: 'none', fontSize: 14,
            background: 'var(--bg)', borderRadius: 20, padding: '10px 16px',
            fontFamily: 'inherit', fontWeight: 600, color: 'var(--text)',
          }}
        />
        <button onClick={() => send(input)} style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), #F4A0B5)',
          border: 'none', cursor: 'pointer', fontSize: 18, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 3px 10px rgba(244,132,111,0.4)', flexShrink: 0,
        }}>➤</button>
      </div>
    </div>
  );
}
