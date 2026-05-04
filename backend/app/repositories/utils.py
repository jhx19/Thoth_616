from nanoid import generate

def new_id(prefix: str) -> str:
    return f"{prefix}_{generate(size=10)}"

def now_iso() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")