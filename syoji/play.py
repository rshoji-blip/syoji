import json
import random
from .config import PLAYS_FILE

def load_plays():
    with open(PLAYS_FILE, encoding="utf-8") as f:
        return json.load(f)

def suggest_plays(age_months, weather_tag, style, count=3):
    plays = load_plays()
    matched = [
        p for p in plays
        if p["age_min_months"] <= age_months <= p["age_max_months"]
        and (weather_tag in p["weather_tags"] or "全天候" in p["weather_tags"])
        and p["style"] == style
    ]
    if len(matched) < count:
        # fallback: relax style constraint
        matched = [
            p for p in plays
            if p["age_min_months"] <= age_months <= p["age_max_months"]
            and (weather_tag in p["weather_tags"] or "全天候" in p["weather_tags"])
        ]
    random.shuffle(matched)
    return matched[:count]
