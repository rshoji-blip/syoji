import json
import sys
from pathlib import Path
from flask import Flask, render_template, request, redirect, url_for, session, jsonify

sys.path.insert(0, str(Path(__file__).parent))
from syoji.user import load_users, register_child, calc_age_months
from syoji.weather import fetch_weather
from syoji.play import suggest_plays, load_plays
from syoji.log import save_log, print_log_summary, get_logs_for_child, get_favorites_for_child, get_play_ranking

app = Flask(__name__)
app.secret_key = "syoji-secret-2024"

def get_age_str(months):
    years, m = divmod(months, 12)
    return f"{years}歳{m}ヶ月" if years else f"{months}ヶ月"

@app.route("/")
def index():
    weather = fetch_weather()
    users = load_users()
    for u in users:
        months = calc_age_months(u["birthdate"])
        u["age_months"] = months
        u["age_str"] = get_age_str(months)
    return render_template("index.html", weather=weather, users=users)

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form["name"]
        birthdate = request.form["birthdate"]
        register_child(name, birthdate)
        return redirect(url_for("index"))
    return render_template("register.html")

@app.route("/select_child", methods=["POST"])
def select_child():
    idx = int(request.form["child_idx"])
    users = load_users()
    child = users[idx]
    session["child_name"] = child["name"]
    session["child_birthdate"] = child["birthdate"]
    return redirect(url_for("suggest"))

@app.route("/suggest", methods=["GET", "POST"])
def suggest():
    if "child_name" not in session:
        return redirect(url_for("index"))

    child_name = session["child_name"]
    age_months = calc_age_months(session["child_birthdate"])
    age_str = get_age_str(age_months)

    if request.method == "POST":
        style = request.form["style"]
        weather = fetch_weather()
        plays = suggest_plays(age_months, weather["tag"], style)
        session["suggested_plays"] = plays
        session["weather_tag"] = weather["tag"]
        return render_template("plays.html", plays=plays, style=style, child_name=child_name, age_str=age_str)

    return render_template("suggest.html", child_name=child_name, age_str=age_str)

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
    save_log(session["child_name"], data["play_id"], data["play_name"], favorite=data.get("favorite", False))
    return jsonify({"ok": True})

@app.route("/logs")
def logs():
    if "child_name" not in session:
        return redirect(url_for("index"))
    child_name = session["child_name"]
    log_entries = get_logs_for_child(child_name)
    favorites = get_favorites_for_child(child_name)
    # get_play_ranking returns list of (play_name, count) tuples
    ranking_tuples = get_play_ranking(child_name)
    ranking = [{"play_name": name, "count": count} for name, count in ranking_tuples]
    recent = list(reversed(log_entries[-10:]))
    fav_names = list(dict.fromkeys(e["play_name"] for e in favorites))
    return render_template("logs.html", child_name=child_name, recent=recent, fav_names=fav_names, ranking=ranking)

if __name__ == "__main__":
    print("🌟 そよじ を起動中...")
    print("ブラウザで http://localhost:5000 を開いてください")
    app.run(debug=False, port=5000)
