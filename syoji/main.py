#!/usr/bin/env python3
import sys
import webbrowser
from .user    import load_users, register_child, calc_age_months
from .weather import fetch_weather
from .play    import suggest_plays
from .log     import save_log, print_log_summary
from .ui      import banner, print_play_card, print_play_detail

STYLES = ["まったり", "アクティブ", "大冒険"]
STYLE_DESC = {
    "まったり": "ゆっくりのんびり遊ぼう",
    "アクティブ": "体を動かして楽しもう",
    "大冒険": "思いきり挑戦してみよう！",
}


def _input(msg: str) -> str:
    try:
        return input(msg).strip()
    except (KeyboardInterrupt, EOFError):
        print("\n終了します。またね！")
        sys.exit(0)


# ── ユーザー選択 ────────────────────────────────
def choose_child() -> dict:
    users = load_users()
    if not users:
        print("\nまだお子さんが登録されていません。")
        name  = _input("お子さんの名前を入力してください: ")
        bdate = _input("生年月日（例: 2023-09-15）: ")
        return register_child(name, bdate)

    print("\n登録済みのお子さん:")
    for i, u in enumerate(users):
        months = calc_age_months(u["birthdate"])
        years, m = divmod(months, 12)
        age_str = f"{years}歳{m}ヶ月" if years else f"{months}ヶ月"
        print(f"  {i+1}. {u['name']} （{age_str}）")
    print(f"  {len(users)+1}. 新しいお子さんを登録")

    while True:
        sel = _input("番号を選んでください: ")
        if sel.isdigit():
            idx = int(sel) - 1
            if 0 <= idx < len(users):
                return users[idx]
            if idx == len(users):
                name  = _input("お子さんの名前: ")
                bdate = _input("生年月日（例: 2023-09-15）: ")
                return register_child(name, bdate)
        print("正しい番号を入力してください。")


# ── スタイル選択 ────────────────────────────────
def choose_style() -> str:
    print("\n今日の気分はどれ？")
    for i, s in enumerate(STYLES, 1):
        print(f"  {i}. {s}  ─  {STYLE_DESC[s]}")
    while True:
        sel = _input("選択（1-3）: ")
        if sel.isdigit() and 1 <= int(sel) <= 3:
            return STYLES[int(sel) - 1]
        print("1〜3で入力してください。")


# ── 遊び詳細・アクション ─────────────────────────
def show_play_actions(play: dict, child_name: str):
    print_play_detail(play)
    print("[1] 動画を見る  [2] これやったよ！  [3] お気に入り登録  [0] 戻る")
    action = _input("選択: ")
    if action == "1":
        webbrowser.open(play["reference_url"])
        print("ブラウザで動画を開きました！")
    elif action == "2":
        save_log(child_name, play["id"], play["name"])
        print(f"「{play['name']}」をログに記録しました！")
    elif action == "3":
        save_log(child_name, play["id"], play["name"], favorite=True)
        print(f"「{play['name']}」をお気に入りに登録しました！")


# ── メインメニュー ──────────────────────────────
def main_menu(child: dict):
    name = child["name"]
    while True:
        print(f"\n─── メニュー（{name}ちゃん） ───")
        print("  [1] 今日の遊びを提案してもらう")
        print("  [2] 成長ログを見る")
        print("  [0] 終了")
        sel = _input("選択: ")
        if sel == "1":
            return "play"
        if sel == "2":
            return "log"
        if sel == "0":
            print("\nまたね！今日も楽しい時間を過ごしてね♪")
            sys.exit(0)
        print("0〜2で入力してください。")


# ── 遊び提案フロー ──────────────────────────────
def play_flow(child: dict, weather: dict):
    age_months = calc_age_months(child["birthdate"])
    style = choose_style()
    plays = suggest_plays(age_months, weather["tag"], style)

    if not plays:
        print("\n条件に合う遊びが見つかりませんでした。条件を変えて試してみてください。")
        return

    print(f"\n─── 今日のおすすめ遊び（{style}） ───")
    for i, p in enumerate(plays, 1):
        print_play_card(p, i)

    print("\n─────────────────────────────────────")
    while True:
        sel = _input("詳細を見る番号（0で戻る）: ")
        if sel == "0":
            break
        if sel.isdigit() and 1 <= int(sel) <= len(plays):
            show_play_actions(plays[int(sel) - 1], child["name"])
        else:
            print("正しい番号を入力してください。")


# ── メイン ──────────────────────────────────────
def main():
    banner()

    print("\n天気を取得中...")
    weather = fetch_weather()
    if weather["temp"] is not None:
        print(f"現在の天気 : {weather['label']} / {weather['temp']}°C")
    else:
        print("天気の取得に失敗しました。全天候モードで提案します。")

    child      = choose_child()
    age_months = calc_age_months(child["birthdate"])
    years, m   = divmod(age_months, 12)
    age_str    = f"{years}歳{m}ヶ月" if years else f"{age_months}ヶ月"
    print(f"\nこんにちは！{child['name']}ちゃん（{age_str}）")

    while True:
        action = main_menu(child)
        if action == "play":
            play_flow(child, weather)
        elif action == "log":
            print_log_summary(child["name"])


if __name__ == "__main__":
    main()
