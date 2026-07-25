#!/usr/bin/env python3
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "ai_service"))

import app as ai_app  # noqa: E402


def main():
    original_required = ai_app.AI_SERVICE_REQUIRE_TOKEN
    original_token = ai_app.AI_SERVICE_TOKEN
    token = "production-test-service-token-32-characters"
    try:
        ai_app.AI_SERVICE_REQUIRE_TOKEN = True
        ai_app.AI_SERVICE_TOKEN = token
        client = ai_app.app.test_client()

        health = client.get("/health")
        assert health.status_code == 200, "Health probe must remain public"

        unauthorized = client.post("/transcript/process", json={"transcript": "fallen tree"})
        assert unauthorized.status_code == 401, "AI POST endpoint must reject a missing service token"

        unauthorized_probe = client.post("/auth/probe", json={})
        assert unauthorized_probe.status_code == 401, "Auth probe must reject a missing service token"

        malformed_token_probe = client.post(
            "/auth/probe",
            json={},
            headers={"X-Urban-Pulse-Service-Token": "invalid-token-\u00e9-with-hidden-character-123456"},
        )
        assert malformed_token_probe.status_code == 401, "Non-ASCII tokens must be rejected without crashing"

        authorized_probe = client.post(
            "/auth/probe",
            json={},
            headers={
                "X-Urban-Pulse-Service-Token": token,
                "X-Request-ID": "trace-auth-probe-12345",
            },
        )
        assert authorized_probe.status_code == 200, "Auth probe must accept the configured service token"
        assert authorized_probe.get_json().get("authenticated") is True
        assert authorized_probe.get_json().get("requestId") == "trace-auth-probe-12345"
        assert authorized_probe.headers.get("X-Request-ID") == "trace-auth-probe-12345"

        authorized = client.post(
            "/transcript/process",
            json={"transcript": "fallen tree blocking the road"},
            headers={"X-Urban-Pulse-Service-Token": token},
        )
        assert authorized.status_code == 200, "AI POST endpoint must accept the configured service token"

        oversized = client.post(
            "/transcript/process",
            data=json.dumps({"transcript": "x" * (4 * 1024 * 1024)}),
            content_type="application/json",
            headers={"X-Urban-Pulse-Service-Token": token},
        )
        assert oversized.status_code == 413, "AI service must reject oversized requests"

        print(json.dumps({
            "passed": True,
            "publicHealthProbe": True,
            "missingTokenRejected": True,
            "malformedTokenRejected": True,
            "validTokenAccepted": True,
            "authenticatedProbe": True,
            "correlationIdPreserved": True,
            "requestSizeBounded": True,
        }, indent=2))
    finally:
        ai_app.AI_SERVICE_REQUIRE_TOKEN = original_required
        ai_app.AI_SERVICE_TOKEN = original_token


if __name__ == "__main__":
    main()
