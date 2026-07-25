import io
import json
import socket
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))

from florence_remote_provider import FlorenceRemoteProvider
from test_gemini_vision import observation_payload
from vision_provider import VisionProviderChain


class FakeResponse:
    def __init__(self, payload):
        self.payload = json.dumps(payload).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self, _limit=-1):
        return self.payload


def florence_envelope():
    observations = observation_payload()
    return {
        "schemaVersion": "1.0",
        "status": "available",
        "provider": "florence-cloud-run",
        "model": "microsoft/Florence-2-base-ft",
        "description": observations["sceneDescription"],
        "structuredObservations": observations,
        "inferenceMs": 180,
    }


class FlorenceRemoteProviderTests(unittest.TestCase):
    def configured(self):
        return patch.multiple(
            "florence_remote_provider",
            FLORENCE_REMOTE_ENABLED=True,
            FLORENCE_SERVICE_URL="https://florence.example.run.app",
            FLORENCE_SERVICE_TOKEN="test-service-token",
            FLORENCE_MAX_RETRIES=0,
        )

    def test_success_is_sanitized_cached_and_authenticated(self):
        calls = []

        def opener(request, timeout):
            calls.append((request, timeout))
            return FakeResponse(florence_envelope())

        provider = FlorenceRemoteProvider(opener=opener)
        image = Image.new("RGB", (1800, 1200), (100, 110, 120))
        with self.configured():
            first = provider.analyze(image, "same-image-hash")
            second = provider.analyze(image, "same-image-hash")
        image.close()

        self.assertEqual(first["status"], "available")
        self.assertEqual(first["schemaVersion"], "1.0")
        self.assertTrue(second["cacheHit"])
        self.assertEqual(len(calls), 1)
        self.assertEqual(calls[0][0].headers["X-urban-pulse-vision-token"], "test-service-token")
        self.assertNotIn(b"test-service-token", calls[0][0].data)

    def test_timeout_opens_circuit_and_skips_following_call(self):
        calls = []

        def opener(_request, timeout):
            self.assertGreater(timeout, 0)
            calls.append(True)
            raise socket.timeout("timed out")

        provider = FlorenceRemoteProvider(opener=opener, sleep=lambda _seconds: None)
        image = Image.new("RGB", (320, 240))
        with self.configured(), patch("florence_remote_provider.FLORENCE_CIRCUIT_FAILURE_THRESHOLD", 1):
            first = provider.analyze(image, "timeout-one")
            second = provider.analyze(image, "timeout-two")
        image.close()
        self.assertEqual(first["status"], "timeout")
        self.assertEqual(second["status"], "circuit_open")
        self.assertEqual(len(calls), 1)

    def test_malformed_response_is_rejected(self):
        provider = FlorenceRemoteProvider(opener=lambda _request, timeout: FakeResponse({"status": "available"}))
        image = Image.new("RGB", (320, 240))
        with self.configured():
            result = provider.analyze(image, "bad-response")
        image.close()
        self.assertEqual(result["status"], "invalid_response")

    def test_untrusted_http_url_is_not_called(self):
        provider = FlorenceRemoteProvider(opener=lambda *_args: self.fail("Unexpected network call"))
        image = Image.new("RGB", (320, 240))
        with (
            self.configured(),
            patch("florence_remote_provider.FLORENCE_SERVICE_URL", "http://untrusted.example"),
            patch("florence_remote_provider.FLORENCE_ALLOW_HTTP", False),
        ):
            result = provider.analyze(image, "untrusted-url")
        image.close()
        self.assertEqual(result["status"], "unavailable")

    def test_remote_http_url_requires_explicit_opt_in(self):
        calls = []

        def opener(request, timeout):
            calls.append((request.full_url, timeout))
            return FakeResponse(florence_envelope())

        provider = FlorenceRemoteProvider(opener=opener)
        image = Image.new("RGB", (320, 240))
        with (
            self.configured(),
            patch("florence_remote_provider.FLORENCE_SERVICE_URL", "http://203.0.113.10:8080"),
            patch("florence_remote_provider.FLORENCE_ALLOW_HTTP", True),
        ):
            result = provider.analyze(image, "explicit-http-url")
        image.close()

        self.assertEqual(result["status"], "available")
        self.assertEqual(calls[0][0], "http://203.0.113.10:8080/v1/analyze")

    def test_gemini_activates_after_remote_florence_failure(self):
        chain = VisionProviderChain()
        image = Image.new("RGB", (320, 240))
        observations = observation_payload()
        with (
            patch("vision_provider.VISION_PROVIDER_ORDER", ["florence", "gemini"]),
            patch("vision_provider.VISION_FALLBACK_ENABLED", True),
            patch("vision_provider.florence_remote_provider.analyze", return_value={
                "status": "timeout", "provider": "florence-cloud-run", "reason": "timeout", "cacheHit": False
            }),
            patch("vision_provider.gemini_vision_provider.analyze", return_value={
                "status": "available",
                "provider": "gemini-vision",
                "model": "test-gemini",
                "description": observations["sceneDescription"],
                "structuredObservations": observations,
                "cacheHit": False,
            }),
        ):
            result = chain.analyze(image, "fallback-hash")
        image.close()
        self.assertEqual(result["provider"], "gemini-vision")
        self.assertTrue(result["fallbackUsed"])
        self.assertEqual(len(result["providerAttempts"]), 2)

    def test_gemini_activates_after_uncertain_florence_observation(self):
        chain = VisionProviderChain()
        image = Image.new("RGB", (320, 240))
        uncertain = observation_payload(
            sceneDescription="An unclear outdoor scene.",
            visibleCivicIssues=[],
            uncertainty={"present": True, "reason": "No specific issue is visible."},
            humanReviewRecommended=True,
        )
        confident = observation_payload()
        with (
            patch("vision_provider.VISION_PROVIDER_ORDER", ["florence", "gemini"]),
            patch("vision_provider.VISION_FALLBACK_ENABLED", True),
            patch("vision_provider.florence_remote_provider.analyze", return_value={
                "status": "available", "provider": "florence-cloud-run",
                "description": uncertain["sceneDescription"], "structuredObservations": uncertain,
            }),
            patch("vision_provider.gemini_vision_provider.analyze", return_value={
                "status": "available", "provider": "gemini-vision",
                "description": confident["sceneDescription"], "structuredObservations": confident,
            }),
        ):
            result = chain.analyze(image, "uncertain-fallback-hash")
        image.close()
        self.assertEqual(result["provider"], "gemini-vision")
        self.assertEqual(result["providerAttempts"][0]["status"], "uncertain")


if __name__ == "__main__":
    unittest.main()
