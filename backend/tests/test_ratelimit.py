from app.ratelimit import WINDOW_SECONDS, RateLimiter
from tests.conftest import image_bytes


def post(client, headers=None):
    files = [("files", ("p.png", image_bytes(size=(20, 20)), "image/png"))]
    return client.post("/api/analyze", files=files, headers=headers or {})


def test_limiter_blocks_after_limit_and_recovers_after_window():
    now = [0.0]
    rl = RateLimiter(clock=lambda: now[0])
    assert all(rl.allow("a", 3) for _ in range(3))
    assert not rl.allow("a", 3)
    assert rl.allow("b", 3)  # other clients are unaffected
    now[0] = WINDOW_SECONDS + 1
    assert rl.allow("a", 3)


def test_limit_zero_disables():
    rl = RateLimiter()
    assert all(rl.allow("a", 0) for _ in range(100))


def test_endpoint_returns_429_with_retry_after(client, fake_claude, monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_PER_HOUR", "2")
    assert post(client).status_code == 200
    assert post(client).status_code == 200
    r = post(client)
    assert r.status_code == 429 and r.json() == {"detail": "rate_limited"}
    assert int(r.headers["retry-after"]) > 0
    assert len(fake_claude.calls) == 2  # the blocked request never reached the model


def test_health_is_not_limited(client, monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_PER_HOUR", "1")
    assert all(client.get("/api/health").status_code == 200 for _ in range(5))


def test_forwarded_ip_only_trusted_when_enabled(client, fake_claude, monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_PER_HOUR", "1")
    # Not trusted: different X-Forwarded-For values are the same client, so the 2nd call is blocked.
    assert post(client, {"x-forwarded-for": "1.1.1.1"}).status_code == 200
    assert post(client, {"x-forwarded-for": "2.2.2.2"}).status_code == 429

    from app import ratelimit

    ratelimit.limiter.clear()
    monkeypatch.setenv("TRUST_PROXY", "1")
    assert post(client, {"x-forwarded-for": "1.1.1.1"}).status_code == 200
    assert post(client, {"x-forwarded-for": "2.2.2.2"}).status_code == 200  # distinct clients
    assert post(client, {"x-forwarded-for": "1.1.1.1"}).status_code == 429
