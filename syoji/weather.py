import json
import urllib.request
from .config import WEATHER_API_URL, DEFAULT_LATITUDE, DEFAULT_LONGITUDE

# WMO気象コード → (日本語ラベル, 天候タグ)
WMO_MAP = {
    0:  ("快晴",         "晴れ"),
    1:  ("晴れ",         "晴れ"),
    2:  ("晴れ時々曇り", "晴れ"),
    3:  ("曇り",         "全天候"),
    45: ("霧",           "全天候"),
    48: ("霧",           "全天候"),
    51: ("小雨",         "雨"),
    53: ("雨",           "雨"),
    55: ("強い雨",       "雨"),
    61: ("雨",           "雨"),
    63: ("雨",           "雨"),
    65: ("強い雨",       "雨"),
    71: ("雪",           "雨"),
    73: ("雪",           "雨"),
    75: ("大雪",         "雨"),
    80: ("にわか雨",     "雨"),
    81: ("にわか雨",     "雨"),
    82: ("激しいにわか雨","雨"),
    95: ("雷雨",         "雨"),
    96: ("雷雨",         "雨"),
    99: ("激しい雷雨",   "雨"),
}


def fetch_weather(lat=DEFAULT_LATITUDE, lon=DEFAULT_LONGITUDE) -> dict:
    url = f"{WEATHER_API_URL}?latitude={lat}&longitude={lon}&current_weather=true"
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            data = json.loads(resp.read())
        code = data["current_weather"]["weathercode"]
        temp = data["current_weather"]["temperature"]
        label, tag = WMO_MAP.get(code, ("不明", "全天候"))
        return {"label": label, "tag": tag, "temp": temp}
    except Exception:
        return {"label": "取得失敗", "tag": "全天候", "temp": None}
