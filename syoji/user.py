import json
from datetime import date, datetime
from pathlib import Path
from .config import USERS_FILE

def load_users():
    if not USERS_FILE.exists():
        return []
    with open(USERS_FILE, encoding="utf-8") as f:
        return json.load(f)

def save_users(users):
    USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)

def calc_age_months(birthdate_str):
    birth = datetime.strptime(birthdate_str, "%Y-%m-%d").date()
    today = date.today()
    months = (today.year - birth.year) * 12 + (today.month - birth.month)
    if today.day < birth.day:
        months -= 1
    return max(0, months)

def register_child(name, birthdate_str):
    users = load_users()
    # 同じ名前・生年月日の重複を防ぐ
    if any(u["name"] == name and u["birthdate"] == birthdate_str for u in users):
        return None  # 既存
    child = {"name": name, "birthdate": birthdate_str}
    users.append(child)
    save_users(users)
    return child

def select_child(users):
    # returns (name, age_months) tuple
    pass
