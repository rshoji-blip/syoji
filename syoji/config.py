from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
PLAYS_FILE = DATA_DIR / "plays.json"
USERS_FILE = DATA_DIR / "users.json"
LOGS_FILE = DATA_DIR / "logs.json"

# Open-Meteo API (no API key needed)
WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast"
# Default location: Tokyo
DEFAULT_LATITUDE = 35.6762
DEFAULT_LONGITUDE = 139.6503
