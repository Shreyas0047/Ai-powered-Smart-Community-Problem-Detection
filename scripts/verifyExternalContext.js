const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  inferWeatherCategory,
  normalizePreviewInput,
  publicCivicEvidence,
  publicWeatherSnapshot
} = require("../src/controllers/contextController");
const { locationFingerprint } = require("../src/services/draftContextService");
const {
  buildWeatherCacheKey,
  isWeatherRelevant
} = require("../src/services/weatherService");
const {
  buildPreviewQuery,
  extractVisualSearchContext,
  isOfficialLooking
} = require("../src/services/civicEvidenceService");

const root = path.join(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

assert.strictEqual(inferWeatherCategory("sparks from a short circuit near a pole"), "utility_fault");
assert.strictEqual(inferWeatherCategory("road flooded beside a blocked drain"), "water_drainage");
assert.strictEqual(inferWeatherCategory("ordinary cleanliness complaint"), "general");

assert.strictEqual(
  buildWeatherCacheKey({ location: "Whitefield, Bengaluru" }),
  buildWeatherCacheKey({ location: "Whitefield, Bengaluru, Karnataka, India" }),
  "Equivalent Bengaluru locations should share the same weather cache key."
);
assert.strictEqual(
  buildWeatherCacheKey({ mapLocation: { lat: 12.97161, lng: 77.59461 } }),
  buildWeatherCacheKey({ mapLocation: { lat: 12.97164, lng: 77.59464 } }),
  "Nearby coordinates should share a rounded weather cache key."
);

assert.strictEqual(isWeatherRelevant({ aiMeta: { categoryId: "utility_fault" } }), true);
assert.strictEqual(isWeatherRelevant({ aiMeta: { categoryId: "garbage" } }), false);

assert.doesNotThrow(() => normalizePreviewInput({ location: "Indiranagar" }));
assert.throws(
  () => normalizePreviewInput({ location: "Outside", mapLocation: { lat: 19.076, lng: 72.8777 } }),
  /only for Bengaluru/
);

const publicSnapshot = publicWeatherSnapshot({
  status: "available",
  provider: "weatherstack",
  quota: { remaining: 1 },
  condition: "Rain",
  cached: true
});
assert.strictEqual(publicSnapshot.provider, undefined);
assert.strictEqual(publicSnapshot.quota, undefined);
assert.strictEqual(publicSnapshot.cached, true);
assert.strictEqual(
  locationFingerprint("Indiranagar, Bengaluru", null),
  locationFingerprint("Indiranagar, Bengaluru, Karnataka, India", null),
  "Draft context must remain valid when the backend adds the Bengaluru location suffix."
);
assert.strictEqual(
  publicCivicEvidence({ status: "quota_exceeded", reason: "Monthly Zenserp quota reached." }).reason,
  "Monthly civic-search allowance reached. The complaint can still be submitted."
);

assert.strictEqual(isOfficialLooking({ url: "https://site.bbmp.gov.in/department" }), true);
assert.strictEqual(isOfficialLooking({ url: "https://bbmp.gov.in.example.com/not-official" }), false);
assert.strictEqual(isOfficialLooking({ url: "https://example.com/bengaluru-news" }), false);

const visualAnalysis = {
  nlp: { issueType: "Utility Fault" },
  cv: {
    detected: "Electrical fault",
    observations: {
      detectedIssues: [
        { issue: "Exposed electrical cable" },
        { issue: "Short circuit with visible sparks" }
      ],
      hazards: ["Electric shock risk"],
      affectedInfrastructure: ["Power distribution pole"]
    }
  }
};
assert.deepStrictEqual(extractVisualSearchContext(visualAnalysis), {
  primaryIssue: "Exposed electrical cable",
  relatedIssues: ["Short circuit with visible sparks", "Electrical fault"],
  hazards: ["Electric shock risk"],
  infrastructure: ["Power distribution pole"]
});
const visualQuery = buildPreviewQuery({ analysis: visualAnalysis, location: "Indiranagar, Bengaluru" });
assert.match(visualQuery, /"Indiranagar, Bengaluru"/);
assert.match(visualQuery, /"Exposed electrical cable"/);
assert.match(visualQuery, /"Electric shock risk"/);
assert.doesNotMatch(visualQuery, /Utility Fault/, "The broad NLP label must not replace specific image observations.");
assert.doesNotMatch(
  buildPreviewQuery({ analysis: visualAnalysis, location: "Indiranagar\" site:example.com" }),
  /site:example\.com/,
  "Search operators must be removed from preview input."
);

const routes = read("src/routes/api.js");
const app = read("src/app.js");
const frontend = read("public/app.js");
const markup = read("public/index.html");
const weatherService = read("src/services/weatherService.js");
const civicEvidenceService = read("src/services/civicEvidenceService.js");

assert.match(routes, /\/context\/weather-preview/);
assert.match(routes, /\/context\/civic-preview/);
assert.match(routes, /\/context\/usage/);
assert.match(routes, /requirePermission\("view_dashboard"\), getExternalContextUsage/);
assert.match(app, /keyPrefix: "weather-preview"/);
assert.match(app, /keyPrefix: "civic-preview"/);
assert.match(weatherService, /getCachedExternalContext/);
assert.match(weatherService, /setCachedExternalContext/);
assert.ok(
  weatherService.indexOf("getCachedExternalContext") < weatherService.indexOf("reserveMonthlyQuota({"),
  "Weather cache must be checked before monthly quota is reserved."
);
assert.match(civicEvidenceService, /zenserpPublicCacheHours/);
assert.match(civicEvidenceService, /fetchCivicEvidencePreview/);
assert.match(markup, /id="weatherPreviewPanel"/);
assert.match(markup, /id="checkWeatherBtn"/);
assert.match(markup, /id="checkCivicContextBtn"[\s\S]*disabled/);
assert.match(markup, /id="civicContextPanel"/);
assert.match(markup, /id="locationPreviewOverlay"[\s\S]*role="dialog"/);
assert.match(markup, /id="closeLocationPreviewBtn"/);
assert.match(markup, /id="externalContextUsagePanel"/);
assert.match(frontend, /Checking civic context/);
assert.match(frontend, /Area updates/);
assert.match(frontend, /checkWeatherBtn\?\.addEventListener\("click", requestWeatherPreview\)/);
assert.match(frontend, /checkCivicContextBtn\?\.addEventListener\("click", requestCivicContextPreview\)/);
assert.match(frontend, /imageAnalysisToken: currentImageAnalysisToken/);
assert.match(frontend, /payload\.weatherContextToken = currentWeatherContextToken/);
assert.match(frontend, /payload\.civicContextToken = currentCivicContextToken/);
assert.doesNotMatch(frontend, /reportLocationInput\.addEventListener\("blur"[\s\S]{0,240}requestWeatherPreview/);
const mapPreviewStart = frontend.indexOf("function showTypedLocationOnMap()");
const mapPreviewEnd = frontend.indexOf("function closeLocationPreview()", mapPreviewStart);
const mapPreviewFunction = frontend.slice(mapPreviewStart, mapPreviewEnd);
assert.match(mapPreviewFunction, /locationPreviewOverlay\.hidden = false/);
assert.doesNotMatch(mapPreviewFunction, /activateAppView\("map"\)/);
const complaintService = read("src/services/complaintService.js");
assert.doesNotMatch(complaintService, /fetchWeatherSnapshot/);
assert.doesNotMatch(complaintService, /fetchCivicEvidence/);
assert.match(complaintService, /Weather was not checked before submission/);
assert.match(complaintService, /Civic context was not checked before submission/);

console.log(JSON.stringify({
  passed: true,
  weatherPreview: true,
  civicPreviewAfterImageAnalysis: true,
  submissionProviderCalls: false,
  serverOwnedDraftSnapshots: true,
  cacheReuse: true,
  bengaluruValidation: true,
  officialDomainValidation: true,
  quotaVisibility: "admin-only"
}, null, 2));
