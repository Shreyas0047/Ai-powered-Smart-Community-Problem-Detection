const { spawnSync } = require("child_process");

const checks = [
  ["project-syntax", "node", ["scripts/verifyProjectSyntax.js"]],
  ["bengaluru-scope", "node", ["scripts/verifyBengaluruScope.js"]],
  ["bengaluru-routing", "node", ["scripts/verifyBengaluruRouting.js"]],
  ["community-verification", "node", ["scripts/verifyCommunityVerification.js"]],
  ["image-reasoning", "node", ["scripts/verifyImageReasoning.js"]],
  ["scene-understanding", "python3", ["-m", "unittest", "ai_service/test_scene_understanding.py"]],
  ["gemini-vision", "python3", ["-m", "unittest", "ai_service/test_gemini_vision.py"]],
  ["florence-remote", "python3", ["-m", "unittest", "ai_service/test_florence_remote_provider.py"]],
  ["florence-service", "python3", ["-m", "unittest", "discover", "-s", "urban-pulse-florence/tests", "-v"]],
  ["ai-service-auth", "python3", ["scripts/verifyAiServiceAuth.py"]],
  ["ai-request-tracing", "node", ["scripts/verifyAiRequestTracing.js"]],
  ["human-review", "node", ["scripts/verifyHumanReview.js"]],
  ["decision-audit", "node", ["scripts/verifyDecisionAudit.js"]],
  ["observability", "node", ["scripts/verifyAiObservability.js"]],
  ["benchmark-comparison", "python3", ["scripts/verifyBenchmarkComparison.py"]],
  ["authority-tickets", "node", ["scripts/verifyAuthorityTickets.js"]],
  ["accessibility", "node", ["scripts/verifyAccessibility.js"]],
  ["resilience", "node", ["scripts/verifyResilience.js"]],
  ["load", "node", ["scripts/verifyLoad.js"]],
  ["resolution", "node", ["scripts/verifyResolutionLoop.js"]],
  ["civic-intelligence", "node", ["scripts/verifyCivicIntelligence.js"]],
  ["dataset", "python3", ["scripts/verifyBenchmarkDataset.py"]],
  ["metrics", "python3", ["scripts/verifyBenchmarkMetrics.py"]],
  ["ai-service", "python3", ["scripts/evaluateAiService.py"]],
  ["python-syntax", "python3", ["-m", "compileall", "-q", "ai_service", "scripts"]]
];

const results = [];
for (const [name, command, args] of checks) {
  const result = spawnSync(command, args, { cwd: process.cwd(), encoding: "utf8", env: process.env });
  results.push({ name, passed: result.status === 0 });
  if (result.status !== 0) {
    process.stderr.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
    console.error(JSON.stringify({ passed: false, failedCheck: name, results }, null, 2));
    process.exit(1);
  }
}

console.log(JSON.stringify({ passed: true, checks: results, benchmarkClaim: "Real-world benchmark readiness is reported separately and remains gated by adjudicated data." }, null, 2));
