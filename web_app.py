import json
import random
from datetime import datetime, date, timedelta
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, send_from_directory
from syoji.user import load_users, register_child, calc_age_months, update_child, delete_child
from syoji.weather import fetch_weather
from syoji.play import suggest_plays, load_plays
from syoji.log import save_log, get_logs_for_child, get_favorites_for_child, get_play_ranking
from syoji.push import get_or_create_vapid_keys, save_subscription, broadcast
from syoji.review import save_weekly_review, get_latest_review, generate_weekly_review

STATIC_APP = Path(__file__).parent / "static" / "app"
STATIC_ROOT = Path(__file__).parent / "static"
app = Flask(__name__, static_folder=str(STATIC_APP), static_url_path="/app")
app.secret_key = "syoji-secret-2024"

ALL_CATEGORIES = ["探索", "創造", "会話", "運動", "感覚", "協力", "挑戦"]
CATEGORY_ICONS = {
    "探索": "🔍", "創造": "🎨", "会話": "💬",
    "運動": "🏃", "感覚": "✨", "協力": "🤝", "挑戦": "🌟",
}

def get_age_str(months):
    years, m = divmod(months, 12)
    return f"{years}歳{m}ヶ月" if years else f"{months}ヶ月"

def get_today_category_counts(child_name):
    logs = get_logs_for_child(child_name)
    today = date.today().isoformat()
    today_logs = [l for l in logs if l.get("date", "")[:10] == today]
    plays = load_plays()
    play_map = {p["id"]: p for p in plays}
    counts = {cat: 0 for cat in ALL_CATEGORIES}
    for log in today_logs:
        play = play_map.get(log.get("play_id", ""))
        if play:
            for cat in play.get("dev_categories", []):
                if cat in counts:
                    counts[cat] += 1
    return counts

def get_monthly_highlights(child_name):
    logs = get_logs_for_child(child_name)
    now = date.today()
    month_start = date(now.year, now.month, 1).isoformat()
    month_logs = [l for l in logs if l.get("date", "")[:10] >= month_start]
    plays = load_plays()
    play_map = {p["id"]: p for p in plays}
    counts = {cat: 0 for cat in ALL_CATEGORIES}
    for log in month_logs:
        play = play_map.get(log.get("play_id", ""))
        if play:
            for cat in play.get("dev_categories", []):
                if cat in counts:
                    counts[cat] += 1
    return counts

def get_weekly_calendar(child_name):
    logs = get_logs_for_child(child_name)
    today = date.today()
    week = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        d_str = d.isoformat()
        day_logs = [l for l in logs if l.get("date", "")[:10] == d_str]
        week.append({
            "date": d_str,
            "weekday": ["月","火","水","木","金","土","日"][d.weekday()],
            "count": len(day_logs),
            "is_today": d == today,
        })
    return week

def generate_coach_message(child_name, age_months):
    logs = get_logs_for_child(child_name)
    plays = load_plays()
    play_map = {p["id"]: p for p in plays}
    today = date.today()
    week_ago = (today - timedelta(days=7)).isoformat()
    recent = [l for l in logs if l.get("date", "")[:10] >= week_ago]
    counts = {cat: 0 for cat in ALL_CATEGORIES}
    for log in recent:
        play = play_map.get(log.get("play_id", ""))
        if play:
            for cat in play.get("dev_categories", []):
                if cat in counts:
                    counts[cat] += 1
    top_cats = sorted(counts.items(), key=lambda x: -x[1])
    top_cat, top_count = top_cats[0] if top_cats else ("探索", 0)
    child_short = child_name[:3]
    age_str = get_age_str(age_months)
    if top_count == 0:
        messages = [
            f"{child_short}ちゃん、今日も元気に過ごせましたか？😊\n今日の遊びを記録してみましょう！どんな小さな遊びでも、成長につながっています。",
            f"こんにちは！{child_short}ちゃんの記録をつけてみませんか？\n毎日の遊びを振り返ることで、成長の軌跡が見えてきますよ✨",
        ]
    else:
        icon = CATEGORY_ICONS.get(top_cat, "🌟")
        messages = [
            f"最近の{child_short}ちゃんは{icon}{top_cat}の経験がとても豊富ですね！\n{age_str}の時期に{top_cat}をたくさん経験することは、とても大切なことです。素晴らしいですよ😊",
            f"{age_str}の{child_short}ちゃん、この1週間でたくさん遊べましたね！\n特に{icon}{top_cat}の体験が充実していて、お子さんの好奇心がよく伝わってきます✨",
            f"{child_short}ちゃんと{top_cat}の遊びを楽しんでいるんですね🌟\nお子さんはきっと、一緒に遊んでくれるあなたが大好きですよ。",
        ]
    return random.choice(messages)

# ── React SPA entry point ─────────────────────────────────────────────────
@app.route("/")
def spa():
    if STATIC_APP.exists():
        return send_from_directory(str(STATIC_APP), "index.html")
    return "<h2>静的ファイルが見つかりません。<code>npm run build</code> を実行してください。</h2>", 404

# ── API endpoints ─────────────────────────────────────────────────────────
def _ensure_child():
    users = load_users()
    if not users:
        return None, None
    if "child_name" not in session:
        child = users[0]
        session["child_name"] = child["name"]
        session["child_birthdate"] = child["birthdate"]
    return session["child_name"], session["child_birthdate"]

@app.route("/api/app_state")
def api_app_state():
    users = load_users()
    if not users:
        return jsonify({"has_users": False})
    child_name, _ = _ensure_child()
    return jsonify({"has_users": True, "child_name": child_name})

@app.route("/api/home")
def api_home():
    users = load_users()
    if not users:
        return jsonify({"error": "no users"}), 400
    child_name, birthdate = _ensure_child()
    age_months = calc_age_months(birthdate)
    weather = fetch_weather()
    plays = suggest_plays(age_months, weather["tag"], "まったり", count=3)
    category_counts = get_today_category_counts(child_name)
    total_today = sum(category_counts.values())
    for u in users:
        u["age_str"] = get_age_str(calc_age_months(u["birthdate"]))

    # 今月の経験から「足りていないカテゴリ」を算出
    monthly = get_monthly_highlights(child_name)
    weak_cats = [cat for cat in ALL_CATEGORIES if monthly.get(cat, 0) == 0]
    if not weak_cats:
        weak_cats = sorted(ALL_CATEGORIES, key=lambda c: monthly.get(c, 0))[:2]

    # 足りないカテゴリに合わせたおすすめ遊びを優先表示
    weak_plays = suggest_plays(age_months, weather["tag"], "まったり", count=5,
                               preferred_cats=weak_cats)

    # 今日が土日かどうか
    is_weekend = date.today().weekday() >= 5

    return jsonify({
        "child_name": child_name,
        "age_str": get_age_str(age_months),
        "weather": weather,
        "plays": weak_plays,
        "category_counts": category_counts,
        "total_today": total_today,
        "users": users,
        "weak_cats": weak_cats[:2],
        "monthly": monthly,
        "is_weekend": is_weekend,
    })

@app.route("/api/switch_child", methods=["POST"])
def api_switch_child():
    data = request.get_json()
    idx = int(data.get("child_idx", 0))
    users = load_users()
    child = users[idx]
    session["child_name"] = child["name"]
    session["child_birthdate"] = child["birthdate"]
    return jsonify({"ok": True})

@app.route("/api/register_child", methods=["POST"])
def api_register_child():
    data = request.get_json()
    name = data["name"]
    birthdate = data["birthdate"]
    result = register_child(name, birthdate)
    if result is None:
        return jsonify({"ok": False, "error": "duplicate"})
    users = load_users()
    child = next(u for u in users if u["name"] == name)
    session["child_name"] = child["name"]
    session["child_birthdate"] = child["birthdate"]
    return jsonify({"ok": True})

@app.route("/api/plays_by_category/<category>")
def api_plays_by_category(category):
    _, birthdate = _ensure_child()
    if not birthdate:
        return jsonify({"plays": []})
    age_months = calc_age_months(birthdate)
    plays = load_plays()
    filtered = [p for p in plays
                if category in p.get("dev_categories", [])
                and p["age_min_months"] <= age_months <= p["age_max_months"]]
    return jsonify({"plays": filtered, "category": category, "total": len(filtered)})

@app.route("/api/categories_summary")
def api_categories_summary():
    _, birthdate = _ensure_child()
    if not birthdate:
        return jsonify({"categories": []})
    age_months = calc_age_months(birthdate)
    plays = load_plays()
    result = []
    for cat in ALL_CATEGORIES:
        count = sum(1 for p in plays
                    if cat in p.get("dev_categories", [])
                    and p["age_min_months"] <= age_months <= p["age_max_months"])
        result.append({"name": cat, "icon": CATEGORY_ICONS[cat], "count": count})
    return jsonify({"categories": result})

@app.route("/api/children")
def api_children():
    users = load_users()
    child_name, _ = _ensure_child()
    return jsonify({"children": users, "active": child_name})

@app.route("/api/update_child", methods=["POST"])
def api_update_child():
    data = request.get_json()
    old_name = data["old_name"]
    new_name = data["new_name"]
    new_birthdate = data["new_birthdate"]
    ok = update_child(old_name, new_name, new_birthdate)
    if ok and session.get("child_name") == old_name:
        session["child_name"] = new_name
        session["child_birthdate"] = new_birthdate
    return jsonify({"ok": ok})

@app.route("/api/delete_child", methods=["POST"])
def api_delete_child():
    data = request.get_json()
    name = data["name"]
    ok = delete_child(name)
    if ok and session.get("child_name") == name:
        users = load_users()
        if users:
            session["child_name"] = users[0]["name"]
            session["child_birthdate"] = users[0]["birthdate"]
        else:
            session.pop("child_name", None)
            session.pop("child_birthdate", None)
    return jsonify({"ok": ok})

@app.route("/api/record_data")
def api_record_data():
    child_name, birthdate = _ensure_child()
    if not child_name:
        return jsonify({"error": "no child"}), 400
    plays = load_plays()
    age_months = calc_age_months(birthdate)
    plays_by_cat = {}
    for cat in ALL_CATEGORIES:
        matching = [p for p in plays
                    if cat in p.get("dev_categories", [])
                    and p["age_min_months"] <= age_months <= p["age_max_months"]]
        if matching:
            plays_by_cat[cat] = matching
    return jsonify({"child_name": child_name, "plays_by_cat": plays_by_cat})

@app.route("/api/record_log", methods=["POST"])
def api_record_log():
    child_name, _ = _ensure_child()
    if not child_name:
        return jsonify({"ok": False})
    data = request.get_json()
    save_log(child_name, data["play_id"], data["play_name"], favorite=data.get("favorite", False))
    return jsonify({"ok": True})

@app.route("/api/growth_data")
def api_growth_data():
    child_name, birthdate = _ensure_child()
    if not child_name:
        return jsonify({"error": "no child"}), 400
    age_months = calc_age_months(birthdate)
    monthly = get_monthly_highlights(child_name)
    weekly = get_weekly_calendar(child_name)
    ranking_tuples = get_play_ranking(child_name, top_n=5)
    ranking = [{"play_name": name, "count": count} for name, count in ranking_tuples]
    total_month = sum(monthly.values())
    top_cats = sorted(monthly.items(), key=lambda x: -x[1])
    now = date.today()
    return jsonify({
        "child_name": child_name,
        "age_str": get_age_str(age_months),
        "monthly": monthly,
        "weekly": weekly,
        "ranking": ranking,
        "total_month": total_month,
        "top_cats": top_cats,
        "month_label": f"{now.month}月",
    })

@app.route("/api/coach_data")
def api_coach_data():
    child_name, birthdate = _ensure_child()
    if not child_name:
        return jsonify({"error": "no child"}), 400
    age_months = calc_age_months(birthdate)
    return jsonify({
        "child_name": child_name,
        "age_str": get_age_str(age_months),
        "initial_msg": generate_coach_message(child_name, age_months),
    })

@app.route("/api/coach_message", methods=["POST"])
def api_coach_message():
    child_name, birthdate = _ensure_child()
    if not child_name:
        return jsonify({"ok": False})
    age_months = calc_age_months(birthdate)
    user_msg = request.get_json().get("message", "")
    logs = get_logs_for_child(child_name)
    plays = load_plays()
    play_map = {p["id"]: p for p in plays}
    counts = {cat: 0 for cat in ALL_CATEGORIES}
    today = date.today()
    week_ago = (today - timedelta(days=7)).isoformat()
    recent = [l for l in logs if l.get("date", "")[:10] >= week_ago]
    for log in recent:
        play = play_map.get(log.get("play_id", ""))
        if play:
            for cat in play.get("dev_categories", []):
                if cat in counts:
                    counts[cat] += 1
    top_cats = sorted(counts.items(), key=lambda x: -x[1])
    age_str = get_age_str(age_months)
    child_short = child_name[:3]
    keyword_responses = {
        "何して遊": f"今の{child_short}ちゃん（{age_str}）にぴったりの遊びを3つ提案しますね！\n\n① 段ボール積み木→崩す（探索・挑戦）\n② 親子でお絵かき（創造）\n③ 一緒にお買い物ごっこ（会話・協力）\n\nどれも家でできて、道具もほとんど不要です😊",
        "室内": f"雨の日の室内遊び、{age_str}向けにおすすめです！\n\n① 新聞紙びりびり→ボール作り（感覚・創造）\n② 絵本の読み聞かせ（会話）\n③ ダンボールハウス作り（創造・探索）\n\n後片付けも一緒にやると「協力」の経験にもなりますよ✨",
        "外": f"外遊びは子どもの発達に最高です！{age_str}の{child_short}ちゃんには：\n\n① 公園で砂遊び（感覚・創造）\n② 虫や花を観察しながらお散歩（探索）\n③ ボール蹴り（運動・協力）\n\n「何を見つけた？」と声かけするだけで探索力がぐんと伸びます🌿",
        "心配": f"{child_short}ちゃんの成長、気になるところがあるんですね。\n具体的にどんなことが気になりますか？言葉の発達・運動・社会性など、もう少し教えていただけると詳しくお答えできます😊",
        "10分": f"短時間でできる遊び、{age_str}向けにご提案します！\n\n① 「なんだろな？」ゲーム（袋に物を入れて触って当てる）\n② 積み木タワー対決\n③ まねっこ体操\n\nどれも10〜15分で完結。就寝前の少しの時間でも十分です⭐",
        "不安": f"お子さんのことを真剣に考えているから不安になるんですよね。それ自体がすでにすごいことです。\n{age_str}の時期はとても個人差が大きいので、他の子と比べなくて大丈夫です😊\n具体的に気になることがあればいつでも相談してください。",
        "成長": f"{child_short}ちゃんはちゃんと成長していますよ🌱\nこの1週間だけでも{sum(counts.values())}回の経験ができています。休日に少し一緒に遊ぶだけで、それが立派な発達への投資になっています。",
        "言葉": f"{age_str}の言葉の発達はとても個人差があります。\n一番効果的なのは「実況中継」です。「今、靴を履いてるね」「わあ、犬がいるよ」と日常のことを言葉にするだけでOK。難しい教育は不要です😊",
    }
    reply = None
    for kw, resp in keyword_responses.items():
        if kw in user_msg:
            reply = resp
            break
    if not reply:
        top_cat = top_cats[0][0] if top_cats and top_cats[0][1] > 0 else "探索"
        icon = CATEGORY_ICONS.get(top_cat, "🌟")
        generic = [
            f"なるほど、教えてくれてありがとうございます😊\nこの1週間、{child_short}ちゃんは{icon}{top_cat}の経験をたくさん積めていますよ。",
            f"{age_str}の子育て、毎日お疲れ様です🌸\n{child_short}ちゃんと一緒に遊んでいるだけで、たくさんの良い刺激になっています。",
            f"そうなんですね✨ {child_short}ちゃんにとって、あなたと過ごす時間がいちばんの宝物ですよ。",
        ]
        reply = random.choice(generic)
    return jsonify({"ok": True, "reply": reply})

@app.route("/api/play_data/<play_id>")
def api_play_data(play_id):
    child_name, _ = _ensure_child()
    plays = load_plays()
    play = next((p for p in plays if p["id"] == play_id), None)
    if not play:
        return jsonify({"error": "not found"}), 404
    return jsonify({"play": play, "child_name": child_name})

@app.route("/api/log", methods=["POST"])
def api_log():
    child_name, _ = _ensure_child()
    if not child_name:
        return jsonify({"ok": False})
    data = request.get_json()
    save_log(child_name, data["play_id"], data["play_name"], favorite=data.get("favorite", False))
    return jsonify({"ok": True})

# Serve React static assets
@app.route("/app/<path:path>")
def serve_app_static(path):
    return send_from_directory(str(STATIC_APP), path)

# PWA: manifest / sw
@app.route("/manifest.json")
@app.route("/app/manifest.json")
def pwa_manifest():
    return send_from_directory(str(STATIC_ROOT), "manifest.json")

@app.route("/sw.js")
def pwa_sw():
    return send_from_directory(str(STATIC_ROOT), "sw.js",
                               mimetype="application/javascript")

@app.route("/static/images/<path:filename>")
def serve_image(filename):
    return send_from_directory(str(STATIC_ROOT / "images"), filename)

# ── Push notification endpoints ───────────────────────────────────────────
@app.route("/api/milestones")
def api_milestones():
    child_name, birthdate = _ensure_child()
    if not child_name:
        return jsonify({"error": "no child"}), 400
    age_months = calc_age_months(birthdate)
    milestones_file = Path(__file__).parent / "data" / "milestones.json"
    all_groups = json.loads(milestones_file.read_text(encoding="utf-8"))
    # 現在の月齢グループ
    current = next(
        (g for g in all_groups if g["age_min_months"] <= age_months <= g["age_max_months"]),
        all_groups[-1]
    )
    # 前後のグループも渡す
    idx = all_groups.index(current)
    prev_group = all_groups[idx - 1] if idx > 0 else None
    next_group = all_groups[idx + 1] if idx < len(all_groups) - 1 else None
    return jsonify({
        "child_name": child_name,
        "age_str": get_age_str(age_months),
        "age_months": age_months,
        "current": current,
        "prev": prev_group,
        "next": next_group,
        "all_groups": all_groups,
    })



def api_vapid_public_key():
    keys = get_or_create_vapid_keys()
    return jsonify({"public_key": keys["public_key"]})

@app.route("/api/push/subscribe", methods=["POST"])
def api_push_subscribe():
    sub = request.get_json()
    if not sub or "endpoint" not in sub:
        return jsonify({"ok": False}), 400
    save_subscription(sub)
    return jsonify({"ok": True})

@app.route("/api/push/test", methods=["POST"])
def api_push_test():
    child_name, birthdate = _ensure_child()
    if not child_name:
        return jsonify({"ok": False})
    age_months = calc_age_months(birthdate)
    from syoji.review import generate_weekly_review
    review = generate_weekly_review(child_name)
    payload = {
        "title": f"🌱 {child_name}ちゃんと遊ぼう！",
        "body": f"今週は{review['total_plays']}回遊びを記録しました。今日もおすすめの遊びをチェック！",
        "url": "/",
    }
    broadcast(payload)
    return jsonify({"ok": True})

# ── Weekly review endpoints ────────────────────────────────────────────────
@app.route("/api/weekly_review")
def api_weekly_review():
    child_name, _ = _ensure_child()
    if not child_name:
        return jsonify({"error": "no child"}), 400
    review = get_latest_review(child_name)
    if not review:
        review = generate_weekly_review(child_name)
    return jsonify(review)

@app.route("/api/weekly_review/generate", methods=["POST"])
def api_weekly_review_generate():
    child_name, _ = _ensure_child()
    if not child_name:
        return jsonify({"ok": False})
    review = save_weekly_review(child_name)
    return jsonify({"ok": True, "review": review})


# ── APScheduler: weekend push + weekly review ─────────────────────────────
def _setup_scheduler():
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        import pytz

        scheduler = BackgroundScheduler(timezone=pytz.timezone("Asia/Tokyo"))

        def weekend_push():
            today = date.today()
            if today.weekday() < 5:
                return
            users = load_users()
            if not users:
                return
            child_name = users[0]["name"]
            weekday = ["月","火","水","木","金","土","日"][today.weekday()]
            review = generate_weekly_review(child_name)
            payload = {
                "title": f"🌱 {child_name}ちゃんと遊ぼう！",
                "body": f"{weekday}曜日！今日のおすすめ遊びをチェックしよう",
                "url": "/",
            }
            broadcast(payload)

        def sunday_review():
            today = date.today()
            if today.weekday() != 6:  # 日曜のみ
                return
            users = load_users()
            for user in users:
                save_weekly_review(user["name"])

        # 土日 9:00 に通知
        scheduler.add_job(weekend_push, "cron", day_of_week="sat,sun", hour=9, minute=0)
        # 日曜 21:00 に振り返り自動生成
        scheduler.add_job(sunday_review, "cron", day_of_week="sun", hour=21, minute=0)

        scheduler.start()
        print("📅 スケジューラ起動: 土日9:00通知 / 日曜21:00振り返り自動生成")
    except ImportError:
        print("⚠️  apscheduler not installed. Scheduler disabled.")
    except Exception as e:
        print(f"⚠️  Scheduler error: {e}")


if __name__ == "__main__":
    import socket
    hostname = socket.gethostname()
    try:
        lan_ip = socket.gethostbyname(hostname)
    except Exception:
        lan_ip = "確認できませんでした"

    _setup_scheduler()

    print("🌟 あそぼ を起動中...")
    if not STATIC_APP.exists():
        print("⚠️  React ビルドが見つかりません: cd frontend && npm run build")
    print(f"📱 このMacで開く  → http://localhost:5000")
    print(f"📱 スマホで開く   → http://{lan_ip}:5000")
    print("   ※ スマホとMacが同じWi-Fiに接続している必要があります")
    app.run(debug=False, host="0.0.0.0", port=5000)
