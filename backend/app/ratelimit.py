"""In-memory sliding-window rate limit per client IP. No persistence: resets on restart."""
import os
import time
from collections import deque

from fastapi import HTTPException, Request

WINDOW_SECONDS = 3600
_MAX_TRACKED_CLIENTS = 10_000


def limit_per_hour() -> int:
    """RATE_LIMIT_PER_HOUR analyses per IP; 0 disables the limit."""
    try:
        return int(os.environ.get("RATE_LIMIT_PER_HOUR", "20"))
    except ValueError:
        return 20


class RateLimiter:
    def __init__(self, clock=time.monotonic):
        self._clock = clock
        self._hits: dict[str, deque[float]] = {}

    def allow(self, key: str, limit: int) -> bool:
        if limit <= 0:
            return True
        now = self._clock()
        hits = self._hits.setdefault(key, deque())
        while hits and now - hits[0] >= WINDOW_SECONDS:
            hits.popleft()
        if len(hits) >= limit:
            return False
        hits.append(now)
        if len(self._hits) > _MAX_TRACKED_CLIENTS:
            self._prune(now)
        return True

    def retry_after(self, key: str) -> int:
        hits = self._hits.get(key)
        if not hits:
            return 1
        return max(1, int(WINDOW_SECONDS - (self._clock() - hits[0])))

    def clear(self) -> None:
        self._hits.clear()

    def _prune(self, now: float) -> None:
        for key in [k for k, h in self._hits.items() if not h or now - h[-1] >= WINDOW_SECONDS]:
            del self._hits[key]


limiter = RateLimiter()


def client_key(request: Request) -> str:
    """Client IP. Behind our own nginx (TRUST_PROXY=1) use the address it forwards."""
    if os.environ.get("TRUST_PROXY") == "1":
        forwarded = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        if forwarded:
            return forwarded
    return request.client.host if request.client else "unknown"


def enforce_rate_limit(request: Request) -> None:
    key = client_key(request)
    if not limiter.allow(key, limit_per_hour()):
        raise HTTPException(
            status_code=429,
            detail="rate_limited",
            headers={"Retry-After": str(limiter.retry_after(key))},
        )
