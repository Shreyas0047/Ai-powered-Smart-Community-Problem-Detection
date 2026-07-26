const BENGALURU = require("../config/bengaluru");
const env = require("../config/env");
const { geocodeLocation, isWithinCityEnvelope } = require("../services/complaintService");
const { getMonthlyQuotaUsage } = require("../services/monthlyQuotaService");
const { fetchWeatherSnapshot } = require("../services/weatherService");

const MAX_LOCATION_LENGTH = 240;

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizePreviewInput(body = {}) {
  const location = String(body.location || "").replace(/\s+/g, " ").trim();
  const lat = Number(body.mapLocation?.lat);
  const lng = Number(body.mapLocation?.lng);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  if (!location && !hasCoordinates) {
    throw createHttpError("Add a Bengaluru location before checking local conditions.");
  }
  if (location.length > MAX_LOCATION_LENGTH) {
    throw createHttpError(`Location must be ${MAX_LOCATION_LENGTH} characters or fewer.`);
  }

  const mapLocation = hasCoordinates ? { lat, lng } : null;
  if (mapLocation && !isWithinCityEnvelope(BENGALURU, mapLocation, 0.02)) {
    throw createHttpError("Local conditions are currently available only for Bengaluru locations.");
  }

  const scopedLocation =
    location && !/\b(bengaluru|bangalore)\b/i.test(location)
      ? `${location}, Bengaluru`
      : location;

  return {
    location: scopedLocation,
    mapLocation
  };
}

function inferWeatherCategory(value) {
  const text = String(value || "").toLowerCase();
  if (/\b(short circuit|electric|electrical|wire|cable|transformer|streetlight|power)\b/.test(text)) return "utility_fault";
  if (/\b(fire|flame|smoke|gas leak|burning)\b/.test(text)) return "safety_fire";
  if (/\b(sewage|sewer|manhole|wastewater)\b/.test(text)) return "sewage_overflow";
  if (/\b(flood|flooding|waterlog|drain|drainage|storm water)\b/.test(text)) return "water_drainage";
  if (/\b(water leak|pipe leak|burst pipe|leaking pipe)\b/.test(text)) return "water_leakage";
  if (/\b(tree|branch|trunk)\b/.test(text)) return "tree_obstruction";
  if (/\b(pothole|road damage|road crack|damaged road|accident|vehicle obstruction)\b/.test(text)) return "road_damage";
  return "general";
}

function publicWeatherSnapshot(weather) {
  const rawReason = String(weather.reason || "");
  const reason =
    /monthly weatherstack quota/i.test(rawReason)
      ? "Monthly weather allowance reached. The complaint can still be submitted."
      : /api key|disabled|weatherstack/i.test(rawReason)
        ? "Local conditions are temporarily unavailable."
        : rawReason;
  return {
    status: weather.status,
    reason,
    observedAt: weather.observedAt,
    locationName: weather.locationName,
    temperatureC: weather.temperatureC,
    condition: weather.condition,
    precipitationMm: weather.precipitationMm,
    humidity: weather.humidity,
    windKph: weather.windKph,
    note: weather.note,
    cached: Boolean(weather.cached)
  };
}

async function previewWeather(req, res, next) {
  try {
    const input = normalizePreviewInput(req.body);
    if (!input.mapLocation) {
      const geocoded = await geocodeLocation(input.location, BENGALURU.center);
      if (geocoded.source === "nominatim" && !isWithinCityEnvelope(BENGALURU, geocoded, 0.02)) {
        throw createHttpError("Local conditions are currently available only for Bengaluru locations.");
      }
      if (geocoded.source === "nominatim") {
        input.mapLocation = { lat: geocoded.lat, lng: geocoded.lng };
      }
    }
    const categoryId = inferWeatherCategory(req.body.issueContext);
    const weather = await fetchWeatherSnapshot({
      ...input,
      analysis: { aiMeta: { categoryId } },
      force: true
    });

    res.json({
      weather: publicWeatherSnapshot(weather)
    });
  } catch (error) {
    next(error);
  }
}

async function getExternalContextUsage(req, res, next) {
  try {
    const [weather, civicSearch] = await Promise.all([
      getMonthlyQuotaUsage({ provider: "weatherstack", limit: env.weatherstackMonthlyLimit }),
      getMonthlyQuotaUsage({ provider: "zenserp", limit: env.zenserpMonthlyLimit })
    ]);

    res.json({
      month: weather.month,
      integrations: {
        weather: {
          enabled: env.weatherstackEnabled && Boolean(env.weatherstackApiKey),
          ...weather
        },
        civicSearch: {
          enabled: env.zenserpEnabled && Boolean(env.zenserpApiKey),
          ...civicSearch
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getExternalContextUsage,
  inferWeatherCategory,
  normalizePreviewInput,
  previewWeather,
  publicWeatherSnapshot
};
