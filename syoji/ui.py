def clear():
    import os
    os.system("clear" if os.name != "nt" else "cls")

def banner():
    print("=" * 50)
    print("  🌟 そよじ - 親子あそび提案ツール 🌟")
    print("=" * 50)

def print_play_card(play, index):
    print(f"\n[{index}] {play['name']}")
    print(f"    スタイル: {play['style']} | 場所: {', '.join(play['location_tags'])}")
    print(f"    準備物: {', '.join(play['materials'])}")

def print_play_detail(play):
    print(f"\n{'='*50}")
    print(f"  {play['name']}")
    print(f"{'='*50}")
    print(f"スタイル: {play['style']} | 場所: {', '.join(play['location_tags'])}")
    print(f"準備物: {', '.join(play['materials'])}")
    print("\n【遊び方の手順】")
    for i, step in enumerate(play["steps"], 1):
        print(f"  {i}. {step}")
    print(f"\n【子供への効果】")
    for effect in play["effects"]:
        print(f"  ・{effect}")
