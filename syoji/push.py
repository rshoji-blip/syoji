import json, base64, time, os
from pathlib import Path
import ecdsa
import jwt as pyjwt

DATA_DIR = Path(__file__).parent.parent / "data"
VAPID_FILE = DATA_DIR / "vapid_keys.json"
SUBS_FILE = DATA_DIR / "push_subscriptions.json"


def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()


def b64url_decode(s: str) -> bytes:
    padding = 4 - len(s) % 4
    if padding != 4:
        s += '=' * padding
    return base64.urlsafe_b64decode(s)


def get_or_create_vapid_keys():
    if VAPID_FILE.exists():
        return json.loads(VAPID_FILE.read_text())
    private_key = ecdsa.SigningKey.generate(curve=ecdsa.NIST256p)
    public_key = private_key.get_verifying_key()
    pub_bytes = b'\x04' + public_key.to_string()
    keys = {
        "private_key": b64url_encode(private_key.to_string()),
        "public_key": b64url_encode(pub_bytes),
    }
    VAPID_FILE.write_text(json.dumps(keys))
    return keys


def get_vapid_headers(audience: str) -> dict:
    keys = get_or_create_vapid_keys()
    priv_bytes = b64url_decode(keys["private_key"])
    private_key = ecdsa.SigningKey.from_string(priv_bytes, curve=ecdsa.NIST256p)
    payload = {
        "sub": "mailto:syoji@example.com",
        "aud": audience,
        "exp": int(time.time()) + 86400,
    }
    token = pyjwt.encode(payload, private_key.to_pem(), algorithm="ES256")
    return {
        "Authorization": f"vapid t={token},k={keys['public_key']}",
        "Content-Type": "application/octet-stream",
        "TTL": "86400",
    }


def load_subscriptions() -> list:
    if not SUBS_FILE.exists():
        return []
    return json.loads(SUBS_FILE.read_text())


def save_subscription(subscription: dict):
    subs = load_subscriptions()
    # 同じendpointがあれば上書き
    subs = [s for s in subs if s.get("endpoint") != subscription.get("endpoint")]
    subs.append(subscription)
    SUBS_FILE.write_text(json.dumps(subs, ensure_ascii=False, indent=2))


def remove_subscription(endpoint: str):
    subs = [s for s in load_subscriptions() if s.get("endpoint") != endpoint]
    SUBS_FILE.write_text(json.dumps(subs, ensure_ascii=False, indent=2))


def send_push_notification(subscription: dict, payload: dict) -> bool:
    import urllib.request, urllib.error
    from urllib.parse import urlparse

    endpoint = subscription["endpoint"]
    parsed = urlparse(endpoint)
    audience = f"{parsed.scheme}://{parsed.netloc}"
    headers = get_vapid_headers(audience)

    body = json.dumps(payload, ensure_ascii=False).encode()
    req = urllib.request.Request(endpoint, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status in (200, 201)
    except urllib.error.HTTPError as e:
        if e.code == 410:  # Gone: subscription expired
            remove_subscription(endpoint)
        return False
    except Exception:
        return False


def broadcast(payload: dict):
    for sub in load_subscriptions():
        send_push_notification(sub, payload)
