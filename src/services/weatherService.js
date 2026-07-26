const env = require("../config/env");
const {
  buildExternalCacheKey,
  getCachedExternalContext,
  setCachedExternalContext
} = require("./externalContextCacheService");
const { reserveMonthlyQuota } = require("./monthlyQuotaService");

const WEATHER_TIMEOUT_MS = 3500;
const WEATHER_RELEVANT_CATEGORY_IDS = new Set([
  "water_drainage",
  "sewage_overflow",
  "water_leakage",
  "tree_obstruction",
  "road_damage",
  "utility_fault",
  "safety_fire",
  "vehicle_obstruction"
]);

function unavailableWeather(reason) {
  return {
    status: "unavailable",
    provider: "weatherstack",
    reason,
    observedAt: null,
    locationName: "",
    temperatureC: null,
    condition: "",
    precipitationMm: null,
    humidity: null,
    windKph: null,
    note: "",
    cached: false,
    quota: null
  };
}

function isWeatherRelevant(analysis) {
  const categoryId = analysis?.aiMeta?.categoryId || "general";
  return WEATHER_RELEVANT_CATEGORY_IDS.has(categoryId);
}

function buildWeatherQuery({ location, mapLocation }) {
  const lat = Number(mapLocation?.lat);
  const lng = Number(mapLocation?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `${lat},${lng}`;
  }

  return String(location || "").trim();
}

function buildWeatherCacheKey({ location, mapLocation }) {
  const lat = Number(mapLocation?.lat);
  const lng = Number(mapLocation?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return buildExternalCacheKey(["weather", lat.toFixed(3), lng.toFixed(3), "metric"]);
  }
  const area = String(location || "")
    .replace(/\b(bengaluru|bangalore|karnataka|india)\b/gi, " ")
    .replace(/[,\s]+/g, " ")
    .trim();
  return buildExternalCacheKey(["weather", area, "bengaluru", "metric"]);
}

function normalizeWeatherResponse(data) {
  const current = data?.current || {};
  const location = data?.location || {};
  const condition = Array.isArray(current.weather_descriptions) ? current.weather_descriptions[0] : "";

  return {
    status: "available",
    provider: "weatherstack",
    reason: "",
    observedAt: current.observation_time || location.localtime || null,
    locationName: [location.name, location.region, location.country].filter(Boolean).join(", "),
    temperatureC: Number.isFinite(Number(current.temperature)) ? Number(current.temperature) : null,
    condition: String(condition || "").trim(),
    precipitationMm: Number.isFinite(Number(current.precip)) ? Number(current.precip) : null,
    humidity: Number.isFinite(Number(current.humidity)) ? Number(current.humidity) : null,
    windKph: Number.isFinite(Number(current.wind_speed)) ? Number(current.wind_speed) : null,
    note: ""
  };
}

function weatherLooksRainy(weather) {
  const condition = String(weather.condition || "").toLowerCase();
  const precipitation = Number(weather.precipitationMm || 0);
  return precipitation > 0 || /\b(rain|drizzle|shower|storm|thunder|mist|fog|overcast)\b/.test(condition);
}

function weatherLooksWindy(weather) {
  return Number(weather.windKph || 0) >= 28;
}

function buildWeatherImpactNote(weather, analysis) {
  if (weather.status !== "available") {
    return "";
  }

  const categoryId = analysis?.aiMeta?.categoryId || "general";
  if (!WEATHER_RELEVANT_CATEGORY_IDS.has(categoryId)) {
    return "";
  }

  const rainy = weatherLooksRainy(weather);
  const windy = weatherLooksWindy(weather);

  if (["water_drainage", "sewage_overflow", "water_leakage"].includes(categoryId) && rainy) {
    return "Rain or wet conditions may be contributing to the reported drainage or water issue.";
  }

  if (categoryId === "tree_obstruction" && (windy || rainy)) {
    return "Wind or rain conditions may be related to the reported tree or road obstruction.";
  }

  if (["road_damage", "vehicle_obstruction"].includes(categoryId) && rainy) {
    return "Wet conditions may increase road safety risk for this complaint.";
  }

  if (["utility_fault", "safety_fire"].includes(categoryId) && rainy) {
    return "Wet conditions can increase electrical or public safety risk for this complaint.";
  }

  return "";
}

async function fetchWeatherSnapshot({ location, mapLocation, analysis, force = false }) {
  if (!env.weatherstackEnabled) {
    return unavailableWeather("Weather context is disabled.");
  }

  if (!env.weatherstackApiKey) {
    return unavailableWeather("Weatherstack API key is not configured.");
  }

  const query = buildWeatherQuery({ location, mapLocation });
  if (!query) {
    return unavailableWeather("Location is missing.");
  }

  const cacheKey = buildWeatherCacheKey({ location, mapLocation });
  const cached = await getCachedExternalContext({ provider: "weatherstack", cacheKey });
  if (cached?.payload?.status === "available") {
    const weather = {
      ...cached.payload,
      cached: true,
      quota: null
    };
    weather.note = buildWeatherImpactNote(weather, analysis);
    return weather;
  }

  if (!force && !isWeatherRelevant(analysis)) {
    return unavailableWeather("Current weather was not required for this complaint type.");
  }

  const quotaReservation = await reserveMonthlyQuota({
    provider: "weatherstack",
    limit: env.weatherstackMonthlyLimit
  });
  if (!quotaReservation.allowed) {
    const weather = unavailableWeather(
      quotaReservation.reason === "Monthly quota reached."
        ? "Monthly Weatherstack quota reached."
        : quotaReservation.reason
    );
    weather.quota = quotaReservation.quota;
    return weather;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEATHER_TIMEOUT_MS);

  try {
    const url = new URL("/current", env.weatherstackBaseUrl);
    url.searchParams.set("access_key", env.weatherstackApiKey);
    url.searchParams.set("query", query);
    url.searchParams.set("units", "m");

    const response = await fetch(url, {
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Weatherstack returned HTTP ${response.status}.`);
    }

    const data = await response.json();
    if (data?.success === false || data?.error) {
      throw new Error(data?.error?.info || "Weatherstack returned an error.");
    }

    const weather = normalizeWeatherResponse(data);
    weather.note = buildWeatherImpactNote(weather, analysis);
    weather.cached = false;
    weather.quota = quotaReservation.quota;
    await setCachedExternalContext({
      provider: "weatherstack",
      cacheKey,
      payload: {
        ...weather,
        quota: null
      },
      ttlMs: env.weatherCacheTtlMinutes * 60 * 1000
    });
    return weather;
  } catch (error) {
    console.warn(
      JSON.stringify({
        event: "weather_context_unavailable",
        provider: "weatherstack",
        reason: error.name === "AbortError" ? "timeout" : error.message || "unknown weather error"
      })
    );
    const weather = unavailableWeather("Weather context could not be fetched.");
    weather.quota = quotaReservation.quota;
    return weather;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  buildWeatherCacheKey,
  buildWeatherImpactNote,
  fetchWeatherSnapshot,
  isWeatherRelevant,
  unavailableWeather
};
