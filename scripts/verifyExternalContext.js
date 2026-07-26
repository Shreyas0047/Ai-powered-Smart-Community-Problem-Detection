const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  inferWeatherCategory,
  normalizePreviewInput,
  publicWeatherSnapshot
} = require("../src/controllers/contextController");
const {
  buildWeatherCacheKey,
  isWeatherRelevant
} = require("../src/services/weatherService");
const { isOfficialLooking } = require("../src/services/civicEvidenceService");

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

assert.strictEqual(isOfficialLooking({ url: "https://site.bbmp.gov.in/department" }), true);
assert.strictEqual(isOfficialLooking({ url: "https://bbmp.gov.in.example.com/not-official" }), false);
assert.strictEqual(isOfficialLooking({ url: "https://example.com/bengaluru-news" }), false);

const routes = read("src/routes/api.js");
const app = read("src/app.js");
const frontend = read("public/app.js");
const markup = read("public/index.html");
const weatherService = read("src/services/weatherService.js");
const civicEvidenceService = read("src/services/civicEvidenceService.js");

assert.match(routes, /\/context\/weather-preview/);
assert.match(routes, /\/context\/usage/);
assert.match(routes, /requirePermission\("view_dashboard"\), getExternalContextUsage/);
assert.match(app, /keyPrefix: "weather-preview"/);
assert.match(weatherService, /getCachedExternalContext/);
assert.match(weatherService, /setCachedExternalContext/);
assert.ok(
  weatherService.indexOf("getCachedExternalContext") < weatherService.indexOf("reserveMonthlyQuota({"),
  "Weather cache must be checked before monthly quota is reserved."
);
assert.match(civicEvidenceService, /zenserpOfficialCacheHours/);
assert.match(civicEvidenceService, /zenserpPublicCacheHours/);
assert.match(markup, /id="weatherPreviewPanel"/);
assert.match(markup, /id="checkWeatherBtn"/);
assert.match(markup, /id="locationPreviewOverlay"[\s\S]*role="dialog"/);
assert.match(markup, /id="closeLocationPreviewBtn"/);
assert.match(markup, /id="externalContextUsagePanel"/);
assert.match(frontend, /Checking official civic references/);
assert.match(frontend, /Related public context/);
assert.match(frontend, /checkWeatherBtn\?\.addEventListener\("click", requestWeatherPreview\)/);
assert.doesNotMatch(frontend, /reportLocationInput\.addEventListener\("blur"[\s\S]{0,240}requestWeatherPreview/);
const mapPreviewStart = frontend.indexOf("function showTypedLocationOnMap()");
const mapPreviewEnd = frontend.indexOf("function closeLocationPreview()", mapPreviewStart);
const mapPreviewFunction = frontend.slice(mapPreviewStart, mapPreviewEnd);
assert.match(mapPreviewFunction, /locationPreviewOverlay\.hidden = false/);
assert.doesNotMatch(mapPreviewFunction, /activateAppView\("map"\)/);

console.log(JSON.stringify({
  passed: true,
  weatherPreview: true,
  cacheReuse: true,
  bengaluruValidation: true,
  officialDomainValidation: true,
  quotaVisibility: "admin-only"
}, null, 2));
