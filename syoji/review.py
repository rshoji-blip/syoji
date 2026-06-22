import json
from datetime import date, timedelta
from pathlib import Path
from .log import get_logs_for_child
from .play import load_plays

DATA_DIR = Path(__file__).parent.parent / "data"
REVIEWS_FILE = DATA_DIR / "weekly_reviews.json"

ALL_CATEGORIES = ["探索", "創造", "会話", "運動", "感覚", "協力", "挑戦"]
CATEGORY_ICONS = {
    "探索": "🔍", "創造": "🎨", "会話": "💬",
    "運動": "🏃", "感覚": "✨", "協力": "🤝", "挑戦": "🌟",
}
GROW_MESSAGES = {
    "探索": "新しいものへの好奇心をもっと育てるチャンスです！",
    "創造": "作ったり描いたりする力をぐんと伸ばせますよ",
    "会話": "言葉のやり取りや読み聞かせで表現力がアップします",
    "運動": "体を思いきり動かすと、心も体も元気になります",
    "感覚": "触ったり感じたりする体験で感受性が豊かになります",
    "協力": "一緒に何かをする経験で、社会性がぐんと育ちます",
    "挑戦": "少し難しいことにトライして、自信をつけましょう！",
}


def load_reviews() -> list:
    if not REVIEWS_FILE.exists():
        return []
    return json.loads(REVIEWS_FILE.read_text())


def get_week_range(ref_date: date = None):
    today = ref_date or date.today()
    # 直近月曜〜日曜
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    return monday, sunday


def generate_weekly_review(child_name: str, ref_date: date = None) -> dict:
    today = ref_date or date.today()
    monday, sunday = get_week_range(today)
    week_start = monday.isoformat()
    week_end = sunday.isoformat()

    logs = get_logs_for_child(child_name)
    plays = load_plays()
    play_map = {p["id"]: p for p in plays}

    week_logs = [
        l for l in logs
        if week_start <= l.get("date", "")[:10] <= week_end
    ]

    counts = {cat: 0 for cat in ALL_CATEGORIES}
    for log in week_logs:
        play = play_map.get(log.get("play_id", ""))
        if play:
            for cat in play.get("dev_categories", []):
                if cat in counts:
                    counts[cat] += 1

    total = len(week_logs)
    active_days = len({l.get("date", "")[:10] for l in week_logs})
    best_cats = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    top_cat = best_cats[0][0] if best_cats[0][1] > 0 else None
    weak_cats = [c for c, n in sorted(counts.items(), key=lambda x: x[1])[:3]]

    # コメント生成
    if total == 0:
        comment = "今週はまだ記録がありません。週末に一緒に遊んで記録してみましょう！🌱"
        next_challenge = weak_cats[0] if weak_cats else "探索"
    elif total >= 5:
        comment = f"今週は{total}回も遊びを記録できました！素晴らしい週でしたね 🎉"
        next_challenge = weak_cats[0]
    elif total >= 2:
        comment = f"今週は{total}回遊びを記録しました。いい調子です！"
        next_challenge = weak_cats[0]
    else:
        comment = f"今週は{total}回の記録でした。来週はもう少し増やしてみましょう。"
        next_challenge = weak_cats[0]

    return {
        "child_name": child_name,
        "week_start": week_start,
        "week_end": week_end,
        "total_plays": total,
        "active_days": active_days,
        "category_counts": counts,
        "top_cat": top_cat,
        "next_challenge": next_challenge,
        "comment": comment,
        "generated_at": today.isoformat(),
    }


def save_weekly_review(child_name: str, ref_date: date = None) -> dict:
    review = generate_weekly_review(child_name, ref_date)
    reviews = load_reviews()
    # 同じ週の同じ子の記録は上書き
    reviews = [
        r for r in reviews
        if not (r["child_name"] == child_name and r["week_start"] == review["week_start"])
    ]
    reviews.append(review)
    # 最新12週分だけ保持
    reviews.sort(key=lambda r: r["week_start"], reverse=True)
    reviews = reviews[:12 * 5]
    REVIEWS_FILE.write_text(json.dumps(reviews, ensure_ascii=False, indent=2))
    return review


def get_latest_review(child_name: str) -> dict | None:
    reviews = [r for r in load_reviews() if r["child_name"] == child_name]
    if not reviews:
        return None
    return sorted(reviews, key=lambda r: r["week_start"], reverse=True)[0]
