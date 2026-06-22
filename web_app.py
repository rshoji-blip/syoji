import json
import random
from datetime import datetime, date, timedelta
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from syoji.user import load_users, register_child, calc_age_months
from syoji.weather import fetch_weather
from syoji.play import suggest_plays, load_plays
from syoji.log import save_log, get_logs_for_child, get_favorites_for_child, get_play_ranking

app = Flask(__name__)
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

@app.route("/")
def index():
    users = load_users()
    if not users:
        return redirect(url_for("register"))
    if "child_name" not in session:
        child = users[0]
        session["child_name"] = child["name"]
        session["child_birthdate"] = child["birthdate"]
    child_name = session["child_name"]
    age_months = calc_age_months(session["child_birthdate"])
    age_str = get_age_str(age_months)
    weather = fetch_weather()
    plays = suggest_plays(age_months, weather["tag"], "まったり", count=3)
    category_counts = get_today_category_counts(child_name)
    total_today = sum(category_counts.values())
    for u in users:
        u["age_str"] = get_age_str(calc_age_months(u["birthdate"]))
    return render_template("home.html",
        child_name=child_name, age_str=age_str,
        weather=weather, plays=plays,
        category_counts=category_counts,
        total_today=total_today,
        all_categories=ALL_CATEGORIES,
        category_icons=CATEGORY_ICONS,
        users=users,
    )

@app.route("/switch_child", methods=["POST"])
def switch_child():
    idx = int(request.form["child_idx"])
    users = load_users()
    child = users[idx]
    session["child_name"] = child["name"]
    session["child_birthdate"] = child["birthdate"]
    return redirect(url_for("index"))

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form["name"]
        birthdate = request.form["birthdate"]
        register_child(name, birthdate)
        users = load_users()
        child = next(u for u in users if u["name"] == name)
        session["child_name"] = child["name"]
        session["child_birthdate"] = child["birthdate"]
        return redirect(url_for("index"))
    return render_template("register.html")

@app.route("/record")
def record():
    if "child_name" not in session:
        return redirect(url_for("index"))
    plays = load_plays()
    age_months = calc_age_months(session["child_birthdate"])
    plays_by_cat = {}
    for cat in ALL_CATEGORIES:
        matching = [p for p in plays
                    if cat in p.get("dev_categories", [])
                    and p["age_min_months"] <= age_months <= p["age_max_months"]]
        if matching:
            plays_by_cat[cat] = matching
    return render_template("record.html",
        child_name=session["child_name"],
        plays_by_cat=plays_by_cat,
        all_categories=ALL_CATEGORIES,
        category_icons=CATEGORY_ICONS,
    )

@app.route("/record/log", methods=["POST"])
def record_log():
    if "child_name" not in session:
        return jsonify({"ok": False})
    data = request.get_json()
    save_log(session["child_name"], data["play_id"], data["play_name"],
             favorite=data.get("favorite", False))
    return jsonify({"ok": True})

@app.route("/growth")
def growth():
    if "child_name" not in session:
        return redirect(url_for("index"))
    child_name = session["child_name"]
    age_months = calc_age_months(session["child_birthdate"])
    age_str = get_age_str(age_months)
    monthly = get_monthly_highlights(child_name)
    weekly = get_weekly_calendar(child_name)
    ranking_tuples = get_play_ranking(child_name, top_n=5)
    ranking = [{"play_name": name, "count": count} for name, count in ranking_tuples]
    total_month = sum(monthly.values())
    top_cats = sorted(monthly.items(), key=lambda x: -x[1])
    now = date.today()
    month_label = f"{now.month}月"
    return render_template("growth.html",
        child_name=child_name, age_str=age_str,
        monthly=monthly, weekly=weekly, ranking=ranking,
        total_month=total_month, top_cats=top_cats,
        all_categories=ALL_CATEGORIES, category_icons=CATEGORY_ICONS,
        month_label=month_label,
    )

@app.route("/coach")
def coach():
    if "child_name" not in session:
        return redirect(url_for("index"))
    child_name = session["child_name"]
    age_months = calc_age_months(session["child_birthdate"])
    age_str = get_age_str(age_months)
    initial_msg = generate_coach_message(child_name, age_months)
    return render_template("coach.html",
        child_name=child_name, age_str=age_str,
        initial_msg=initial_msg,
    )

@app.route("/coach/message", methods=["POST"])
def coach_message():
    if "child_name" not in session:
        return jsonify({"ok": False})
    child_name = session["child_name"]
    age_months = calc_age_months(session["child_birthdate"])
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
        "不安": f"育児に不安を感じることは、それだけ真剣に向き合っている証拠です😊\n{age_str}の時期は特に変化が大きいので、戸惑うのは自然なことですよ。毎日一緒にいてあげているだけで十分です。",
        "成長": f"{child_short}ちゃんはちゃんと成長していますよ🌱\nこの1週間だけでも{sum(counts.values())}回の発達経験ができています。焦らず、今の{child_short}ちゃんを楽しんであげてください。",
        "遅い": f"子どもの発達は一人ひとりペースが違います。比べなくて大丈夫ですよ✨\n{child_short}ちゃんはたくさんの経験を積み重ねています。",
        "おすすめ": f"今の{child_short}ちゃん（{age_str}）には、体を動かす遊びや、手先を使う工作がおすすめです🎨\n特に最近{top_cats[0][0] if top_cats else '探索'}が得意そうなので、そこを伸ばしてみても楽しいかも！",
        "疲れ": f"毎日の育児、本当にお疲れ様です🌸\n少し休んでも大丈夫ですよ。あなたが笑顔でいることが、{child_short}ちゃんにとっていちばんの栄養です。",
        "言葉": f"{age_str}の言葉の発達はとても個人差があります。\n絵本の読み聞かせや、日常の「実況中継」（「今から靴を履くよ」など）が自然な言語刺激になりますよ😊",
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

@app.route("/play/<play_id>")
def play_detail(play_id):
    if "child_name" not in session:
        return redirect(url_for("index"))
    plays = load_plays()
    play = next((p for p in plays if p["id"] == play_id), None)
    if not play:
        return redirect(url_for("index"))
    return render_template("play_detail.html", play=play, child_name=session["child_name"])

@app.route("/log", methods=["POST"])
def log_play():
    data = request.get_json()
    if "child_name" not in session:
        return jsonify({"ok": False})
    save_log(session["child_name"], data["play_id"], data["play_name"],
             favorite=data.get("favorite", False))
    return jsonify({"ok": True})

if __name__ == "__main__":
    print("🌟 そよじ を起動中...")
    print("ブラウザで http://localhost:5000 を開いてください")
    app.run(debug=False, port=5000)
