import io
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ.setdefault("FLORENCE_SERVICE_TOKEN", "test-service-token")
os.environ.setdefault("FLORENCE_WARMUP", "false")

from app.main import app


def image_bytes():
    image = Image.new("RGB", (640, 480), (80, 95, 110))
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")
    image.close()
    return buffer.getvalue()


class ServiceTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health_does_not_expose_token(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("test-service-token", response.get_data(as_text=True))

    def test_analyze_requires_service_authentication(self):
        response = self.client.post("/v1/analyze", data={"image": (io.BytesIO(image_bytes()), "incident.jpg")})
        self.assertEqual(response.status_code, 401)

    def test_structured_observation_response(self):
        with patch("app.main.florence_runtime.analyze", return_value=("A fallen tree is blocking a damaged road.", 120)):
            response = self.client.post(
                "/v1/analyze",
                headers={
                    "X-Urban-Pulse-Vision-Token": "test-service-token",
                    "X-Request-ID": "trace-florence-request-12345",
                },
                data={"image": (io.BytesIO(image_bytes()), "incident.jpg")},
            )
        payload = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["schemaVersion"], "1.0")
        self.assertEqual(payload["provider"], "florence-cloud-run")
        self.assertEqual(payload["requestId"], "trace-florence-request-12345")
        self.assertTrue(payload["structuredObservations"]["visibleCivicIssues"])
        self.assertNotIn("category", payload)
        self.assertNotIn("severity", payload)
        self.assertNotIn("department", payload)

    def test_invalid_image_is_rejected_safely(self):
        response = self.client.post(
            "/v1/analyze",
            headers={"X-Urban-Pulse-Vision-Token": "test-service-token"},
            data={"image": (io.BytesIO(b"not-an-image"), "incident.jpg")},
        )
        self.assertEqual(response.status_code, 400)

    def test_non_ascii_token_is_rejected_without_crashing(self):
        response = self.client.post(
            "/v1/analyze",
            headers={"X-Urban-Pulse-Vision-Token": "invalid-\u00e9-token"},
            data={"image": (io.BytesIO(image_bytes()), "incident.jpg")},
        )
        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
