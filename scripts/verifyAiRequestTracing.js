const assert = require("assert");
const {
  analyzeComplaint,
  getAiServiceConnectionStatus,
  probeAiService
} = require("../src/services/aiClient");

async function main() {
  const originalFetch = global.fetch;
  const originalWarn = console.warn;
  const originalInfo = console.info;
  const capturedRequests = [];
  console.warn = () => {};
  console.info = () => {};

  try {
    global.fetch = async (_url, options) => {
      capturedRequests.push(options);
      return {
        ok: false,
        status: 401,
        text: async () => JSON.stringify({
          error: "Service authentication required.",
          failureStage: "ai_service_auth"
        })
      };
    };

    const requestId = "trace-test-request-12345";
    const fallback = await analyzeComplaint(
      {
        textComplaint: "Pothole blocking the road",
        location: "Bengaluru",
        imageBase64: "",
        imageFeatures: null
      },
      { requestId }
    );
    assert.equal(capturedRequests[0].headers["X-Request-ID"], requestId);
    assert.equal(fallback.aiMeta.requestId, requestId);
    assert.equal(fallback.aiMeta.upstreamStatus, "authentication_failed");
    assert.equal(fallback.aiMeta.upstreamStage, "ai_service_auth");
    assert.equal(getAiServiceConnectionStatus().failureStage, "ai_service_auth");

    global.fetch = async (_url, options) => {
      capturedRequests.push(options);
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ status: "ok", authenticated: true })
      };
    };
    const probe = await probeAiService();
    assert.equal(probe.status, "ok");
    assert.equal(probe.authenticated, true);
    assert.match(capturedRequests[1].headers["X-Request-ID"], /^[0-9a-f-]{36}$/);
    assert.ok(Number.isFinite(probe.latencyMs));
  } finally {
    global.fetch = originalFetch;
    console.warn = originalWarn;
    console.info = originalInfo;
  }

  console.log(JSON.stringify({
    passed: true,
    correlationIdForwarded: true,
    failureStagePreserved: true,
    fallbackRemainsNonBlocking: true,
    liveProbeStatusRecorded: true
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
