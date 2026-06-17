import json
from datetime import datetime
from .config import LOGS_FILE

def load_logs():
    if not LOGS_FILE.exists():
        return []
    with open(LOGS_FILE, encoding="utf-8") as f:
        return json.load(f)

def save_log(child_name, play_id, play_name, favorite=False):
    logs = load_logs()
    entry = {
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "child": child_name,
        "play_id": play_id,
        "play_name": play_name,
        "favorite": favorite,
    }
    logs.append(entry)
    LOGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOGS_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False, indent=2)
    return entry
