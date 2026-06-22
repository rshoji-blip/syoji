import json
import random
from .config import PLAYS_FILE

def load_plays():
    with open(PLAYS_FILE, encoding="utf-8") as f:
        return json.load(f)

def suggest_plays(age_months, weather_tag, style, count=3, preferred_cats=None):
    plays = load_plays()
    matched = [
        p for p in plays
        if p["age_min_months"] <= age_months <= p["age_max_months"]
        and (weather_tag in p["weather_tags"] or "全天候" in p["weather_tags"])
    ]
    if not matched:
        matched = [p for p in plays if p["age_min_months"] <= age_months <= p["age_max_months"]]

    # 足りないカテゴリを含む遊びを優先
    if preferred_cats:
        preferred = [p for p in matched if any(c in p.get("dev_categories", []) for c in preferred_cats)]
        others = [p for p in matched if p not in preferred]
        random.shuffle(preferred)
        random.shuffle(others)
        result = (preferred + others)[:count]
    else:
        random.shuffle(matched)
        result = matched[:count]

    return result
