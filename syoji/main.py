#!/usr/bin/env python3
import sys
import webbrowser
from .user import load_users, register_child, calc_age_months
from .weather import fetch_weather
from .play import suggest_plays
from .log import save_log
from .ui import banner, print_play_card, print_play_detail

STYLES = ["まったり", "アクティブ", "大冒険"]

def input_prompt(msg):
    try:
        return input(msg).strip()
    except (KeyboardInterrupt, EOFError):
        print("\n終了します。")
        sys.exit(0)

def choose_child():
    users = load_users()
    if not users:
        print("\nまだお子さんが登録されていません。")
        name = input_prompt("お子さんの名前を入力してください: ")
        bdate = input_prompt("生年月日（例: 2023-09-15）: ")
        child = register_child(name, bdate)
        return child
    print("\n登録済みのお子さん:")
    for i, u in enumerate(users):
        months = calc_age_months(u["birthdate"])
        print(f"  {i+1}. {u['name']} ({months}ヶ月)")
    print(f"  {len(users)+1}. 新しいお子さんを登録")
    while True:
        sel = input_prompt("選択してください: ")
        if sel.isdigit():
            idx = int(sel) - 1
            if 0 <= idx < len(users):
                return users[idx]
            if idx == len(users):
                name = input_prompt("お子さんの名前: ")
                bdate = input_prompt("生年月日（例: 2023-09-15）: ")
                return register_child(name, bdate)
        print("正しい番号を入力してください。")

def choose_style():
    print("\n今日のプレイスタイルを選んでね！")
    for i, s in enumerate(STYLES, 1):
        print(f"  {i}. {s}")
    while True:
        sel = input_prompt("選択（1-3）: ")
        if sel.isdigit() and 1 <= int(sel) <= 3:
            return STYLES[int(sel) - 1]
        print("1〜3で入力してください。")

def main():
    banner()
    print("\n天気を取得中...")
    weather = fetch_weather()
    if weather["temp"] is not None:
        print(f"現在の天気: {weather['label']} / {weather['temp']}°C")
    else:
        print("天気の取得に失敗しました。全天候モードで提案します。")

    child = choose_child()
    age_months = calc_age_months(child["birthdate"])
    print(f"\nこんにちは！{child['name']}ちゃん（{age_months}ヶ月）")

    style = choose_style()
    plays = suggest_plays(age_months, weather["tag"], style)

    if not plays:
        print("\n条件に合う遊びが見つかりませんでした。条件を変えて試してみてください。")
        return

    print(f"\n--- 今日のおすすめ遊び ({style}) ---")
    for i, p in enumerate(plays, 1):
        print_play_card(p, i)

    while True:
        sel = input_prompt("\n詳細を見る遊びの番号（または 0 で終了）: ")
        if sel == "0":
            print("\nまたね！楽しい時間を過ごしてね♪")
            break
        if sel.isdigit() and 1 <= int(sel) <= len(plays):
            play = plays[int(sel) - 1]
            print_play_detail(play)
            print("\n[1] 動画を見る  [2] これやったよ！  [3] お気に入り  [0] 戻る")
            action = input_prompt("選択: ")
            if action == "1":
                webbrowser.open(play["reference_url"])
                print("ブラウザで動画を開きました！")
            elif action == "2":
                save_log(child["name"], play["id"], play["name"])
                print(f"「{play['name']}」をログに記録しました！")
            elif action == "3":
                save_log(child["name"], play["id"], play["name"], favorite=True)
                print(f"「{play['name']}」をお気に入りに追加しました！")
        else:
            print("正しい番号を入力してください。")

if __name__ == "__main__":
    main()
