import json
from datetime import datetime
from collections import Counter
from .config import LOGS_FILE


def load_logs() -> list:
    if not LOGS_FILE.exists():
        return []
    with open(LOGS_FILE, encoding="utf-8") as f:
        return json.load(f)


def save_log(child_name: str, play_id: str, play_name: str, favorite=False) -> dict:
    logs = load_logs()
    entry = {
        "date":      datetime.now().strftime("%Y-%m-%d %H:%M"),
        "child":     child_name,
        "play_id":   play_id,
        "play_name": play_name,
        "favorite":  favorite,
    }
    logs.append(entry)
    LOGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOGS_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False, indent=2)
    return entry


def get_logs_for_child(child_name: str) -> list:
    return [e for e in load_logs() if e["child"] == child_name]


def get_favorites_for_child(child_name: str) -> list:
    return [e for e in get_logs_for_child(child_name) if e.get("favorite")]


def get_play_ranking(child_name: str, top_n=5) -> list:
    """よく遊んだ遊びランキングを返す (play_name, count) のリスト"""
    logs = get_logs_for_child(child_name)
    counter = Counter(e["play_name"] for e in logs)
    return counter.most_common(top_n)


def print_log_summary(child_name: str):
    logs = get_logs_for_child(child_name)
    favorites = get_favorites_for_child(child_name)
    ranking = get_play_ranking(child_name)

    print(f"\n{'='*50}")
    print(f"  📓 {child_name}ちゃんの成長ログ")
    print(f"{'='*50}")

    if not logs:
        print("\nまだログがありません。\n「これやったよ！」を押して記録してみよう！")
        return

    # ── 直近10件 ──────────────────────────────
    print(f"\n【最近の遊び】（全{len(logs)}件）")
    for entry in reversed(logs[-10:]):
        fav_mark = " ⭐" if entry.get("favorite") else ""
        print(f"  {entry['date']}  {entry['play_name']}{fav_mark}")

    # ── お気に入り ─────────────────────────────
    print(f"\n【お気に入り】（{len(favorites)}件）")
    if favorites:
        seen = set()
        for entry in favorites:
            if entry["play_name"] not in seen:
                print(f"  ⭐ {entry['play_name']}")
                seen.add(entry["play_name"])
    else:
        print("  まだありません")

    # ── よく遊んだランキング ──────────────────────
    print(f"\n【よく遊んだ遊び TOP5】")
    for i, (name, count) in enumerate(ranking, 1):
        print(f"  {i}位  {name}（{count}回）")

    print()
