'use client';

import { GameState, GameAction, SkillId } from '@/lib/memory-kingdom-game/types';
import { SET_DEFS } from '@/lib/memory-kingdom-game/constants';
import CardGrid from '../game/CardGrid';
import PlayerPanel from '../game/PlayerPanel';
import SetProgressBar from '../game/SetProgressBar';
import SkillBar from '../game/SkillBar';
import KingdomDisplay from '../game/KingdomDisplay';

interface Props {
  state: GameState;
  dispatch: (a: GameAction) => void;
  /**
   * オンラインモード用。
   * - myPlayerIdx: 自分の playerIdx（自分を常に下に表示する）
   * - isMyTurn: 自分のターンかどうか（false のとき操作を無効化）
   * - opponentName: 接続中の相手名
   */
  myPlayerIdx?: import('@/lib/memory-kingdom-game/types').PlayerIdx;
  isMyTurn?: boolean;
  opponentName?: string;
}

export default function GameScreen({ state, dispatch, myPlayerIdx, isMyTurn, opponentName }: Props) {
  const { phase, players, currentPlayer, pendingBonus, consecutiveMatches, log } = state;
  const cp = currentPlayer;

  // オンライン時: 自分は常に下、相手は常に上
  // ローカル時 : P0 が常に下
  const bottomIdx = myPlayerIdx ?? 0;
  const topIdx    = bottomIdx === 0 ? 1 : 0;

  // オンラインモードかどうか
  const isOnline = myPlayerIdx !== undefined;

  // カード操作が有効か（ローカルは常にtrue、オンラインは自分のターンのみ）
  const interactive = isOnline ? (isMyTurn ?? false) : true;

  function handleSkill(skillId: SkillId) {
    dispatch({ type: 'USE_SKILL', skillId });
  }

  // ── フェーズ別ヒントメッセージ ────────────────────────────────────────────
  function getHint(): { text: string; color: string } {
    if (isOnline && !isMyTurn) {
      return { text: `${players[cp].name} のターン中...`, color: '#64748b' };
    }
    switch (phase) {
      case 'playing':
        return {
          text: `${players[cp].name} のターン：カードを1枚選んでください`,
          color: cp === 0 ? '#f97316' : '#3b82f6',
        };
      case 'awaiting':
        return {
          text: '2枚目のカードを選んでください',
          color: cp === 0 ? '#f97316' : '#3b82f6',
        };
      case 'resolving':
        return { text: '判定中...', color: '#94a3b8' };
      case 'scout_target':
        return { text: '👁 偵察：確認したいカードをタップ', color: '#fbbf24' };
      case 'steal_target':
        return { text: '💀 強奪：相手の取得カードを選択', color: '#ef4444' };
      case 'mage_reveal':
        return { text: '🔮 呪文の嵐：4枚を一時公開！（3秒）', color: '#a855f7' };
      default:
        return { text: '', color: '#94a3b8' };
    }
  }

  const hint = getHint();

  // ── セットボーナスポップアップ ────────────────────────────────────────────
  const SetBonusPopup = () => {
    if (!pendingBonus) return null;
    const setDef = SET_DEFS.find(s => s.type === pendingBonus.setType)!;
    const bonusPlayer = players[pendingBonus.player];
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
        <div
          className="mx-8 rounded-3xl p-6 text-center"
          style={{
            background: `linear-gradient(145deg, ${setDef.color}33, ${setDef.color}11)`,
            border: `2px solid ${setDef.color}88`,
            boxShadow: `0 0 40px ${setDef.color}44`,
          }}
        >
          <div className="text-6xl mb-2">{setDef.icon}</div>
          <p className="text-white font-bold text-base mb-1">{setDef.name} コンプリート！</p>
          <p
            className="font-black text-2xl mb-1"
            style={{ color: setDef.color }}
          >
            {setDef.bonusName}
          </p>
          <p className="text-gray-300 text-sm mb-1">{setDef.bonusDesc}</p>
          <p className="text-gray-400 text-xs mb-4">{bonusPlayer.name} に適用</p>
          <button
            onClick={() => dispatch({ type: 'CLOSE_BONUS' })}
            className="px-8 py-3 rounded-2xl font-black text-white text-lg active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${setDef.color}, ${setDef.color}aa)`,
              boxShadow: `0 4px 20px ${setDef.color}66`,
            }}
          >
            OK！
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden relative"
      style={{ background: 'linear-gradient(180deg, #0b0f1a 0%, #131929 60%, #0d1117 100%)' }}
    >
      {/* 上のプレイヤー（オンライン：相手 / ローカル：P2） */}
      <PlayerPanel player={players[topIdx]} isActive={cp === topIdx} side="top" />

      {/* ターンヒント + 通信インジケーター */}
      <div className="px-3 py-1 flex items-center gap-2">
        {isOnline && (
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}
          />
        )}
        <div
          className="flex-1 py-1.5 px-3 rounded-xl text-center text-xs font-bold"
          style={{ background: 'rgba(255,255,255,0.04)', color: hint.color }}
        >
          {hint.text}
        </div>
        {consecutiveMatches > 0 && (
          <div
            className="px-2 py-1 rounded-lg text-xs font-black"
            style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}
          >
            {consecutiveMatches}連続！
          </div>
        )}
      </div>

      {/* セット進捗バー */}
      <SetProgressBar cards={state.cards} players={players} />

      {/* カードグリッド */}
      <div className="flex-1 flex items-center">
        <div className="w-full">
          <CardGrid state={state} dispatch={dispatch} isInteractive={interactive} />
        </div>
      </div>

      {/* 下のプレイヤーのスキルバー */}
      <div
        className="transition-all"
        style={{ opacity: interactive || cp === bottomIdx ? 1 : 0.4 }}
      >
        <div className="px-3 py-1">
          <p className="text-gray-500 text-[10px] text-center">
            {isOnline
              ? (isMyTurn ? '↑ あなたのスキル' : '相手のターン中...')
              : (cp === bottomIdx ? `↑ スキル（P${bottomIdx + 1}）` : `P${topIdx + 1}のターン中`)}
          </p>
        </div>
        <SkillBar
          player={players[bottomIdx]}
          phase={interactive ? phase : 'game_over'}
          onUseSkill={handleSkill}
        />
      </div>

      {/* 下のプレイヤー（オンライン：自分 / ローカル：P1） */}
      <PlayerPanel player={players[bottomIdx]} isActive={cp === bottomIdx} side="bottom" />

      {/* ローカルモードのみ：上のプレイヤーがアクティブなら下にもスキルバー表示 */}
      {!isOnline && cp === topIdx && (
        <div className="px-3 pb-1">
          <p className="text-gray-500 text-[10px] text-center mb-1">↑ スキル（P{topIdx + 1}）</p>
          <SkillBar player={players[topIdx]} phase={phase} onUseSkill={handleSkill} />
        </div>
      )}

      {/* 王国表示 */}
      <KingdomDisplay players={players} />

      {/* ゲームログ（最新3件） */}
      <div className="px-3 pb-2">
        {log.slice(0, 3).map((entry, i) => (
          <p
            key={entry.id}
            className="text-[10px] leading-5 truncate"
            style={{
              color: entry.type === 'match' ? '#86efac'
                : entry.type === 'miss' ? '#fca5a5'
                  : entry.type === 'skill' ? '#fde68a'
                    : entry.type === 'bonus' ? '#c4b5fd'
                      : '#64748b',
              opacity: 1 - i * 0.3,
            }}
          >
            {entry.text}
          </p>
        ))}
      </div>

      {/* セットボーナスオーバーレイ */}
      {phase === 'set_bonus' && <SetBonusPopup />}
    </div>
  );
}
