const env = require("../config/env");
const {
  buildExternalCacheKey,
  getCachedExternalContext,
  normalizeCachePart,
  setCachedExternalContext
} = require("./externalContextCacheService");
const { reserveMonthlyQuota } = require("./monthlyQuotaService");

const ZENSERP_TIMEOUT_MS = 9000;
const OFFICIAL_DOMAIN_SUFFIXES = [
  "bbmp.gov.in",
  "site.bbmp.gov.in",
  "karnataka.gov.in",
  "karunadu.karnataka.gov.in",
  "bescom.karnataka.gov.in",
  "bwssb.karnataka.gov.in",
  "bengaluruurban.nic.in",
  "bengalurutrafficpolice.gov.in",
  "nammabengaluru.org.in"
];

function unavailableEvidence(status, reason, quota = null) {
  return {
    status,
    provider: "zenserp",
    reason,
    officialSources: [],
    publicContext: [],
    quota
  };
}

function normalizeSearchValue(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeSearchTerm(value) {
  return normalizeSearchValue(value)
    .replace(/["`]/g, " ")
    .replace(/\b(?:site|inurl|intitle|filetype):/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function uniqueSearchValues(values, limit = 3) {
  const seen = new Set();
  return values
    .map(normalizeSearchTerm)
    .filter((value) => {
      const key = value.toLowerCase();
      if (!value || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

function extractVisualSearchContext(analysis = {}) {
  const observations = analysis?.cv?.observations || {};
  const detectedIssues = Array.isArray(observations.detectedIssues) ? observations.detectedIssues : [];
  const issues = uniqueSearchValues([
    ...detectedIssues.map((item) => item?.issue || item?.categoryLabel),
    ...(Array.isArray(observations.visibleCivicIssues) ? observations.visibleCivicIssues : []),
    analysis?.cv?.detected,
    analysis?.nlp?.issueType
  ], 3);
  const hazards = uniqueSearchValues(
    Array.isArray(observations.hazards) ? observations.hazards : [],
    2
  );
  const infrastructure = uniqueSearchValues([
    ...(Array.isArray(observations.affectedInfrastructure) ? observations.affectedInfrastructure : []),
    ...(Array.isArray(observations.damagedInfrastructure) ? observations.damagedInfrastructure : [])
  ], 2);

  return {
    primaryIssue: issues[0] || "civic issue",
    relatedIssues: issues.slice(1),
    hazards,
    infrastructure
  };
}

function buildPreviewQuery({ analysis, location }) {
  const visual = extractVisualSearchContext(analysis);
  const area = normalizeSearchTerm(location || "Bengaluru");
  const problemTerms = uniqueSearchValues([
    visual.primaryIssue,
    ...visual.relatedIssues,
    ...visual.infrastructure,
    ...visual.hazards
  ], 6);
  return [
    `"${area}"`,
    ...problemTerms.map((term) => `"${term}"`),
    "Bengaluru recent incident complaint official update"
  ].join(" ").slice(0, 420);
}

function extractHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch (_error) {
    return "";
  }
}

function isOfficialLooking(result) {
  const host = extractHost(result.url);
  return Boolean(host) && OFFICIAL_DOMAIN_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

function normalizeResult(item, query, sourceType) {
  const title = normalizeSearchValue(item.title || item.name || "");
  const url = normalizeSearchValue(item.url || item.link || item.href || "");
  const snippet = normalizeSearchValue(item.description || item.snippet || item.content || "");

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (_error) {
    return null;
  }

  if (!title || !["http:", "https:"].includes(parsedUrl.protocol)) {
    return null;
  }

  return {
    title: title.slice(0, 180),
    url,
    snippet: snippet.slice(0, 320),
    sourceType,
    query,
    domain: extractHost(url),
    official: sourceType === "official" ? false : undefined
  };
}

function extractOrganicResults(data) {
  const candidates = [
    data?.organic,
    data?.organic_results,
    data?.results,
    data?.web_results
  ];
  return candidates.find(Array.isArray) || [];
}

function extractProviderError(data) {
  const error = data?.error || data?.errors;
  if (!error) return "";
  if (typeof error === "string") return error;
  if (Array.isArray(error)) {
    return error
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.message || item?.detail || item?.title || "";
      })
      .filter(Boolean)
      .join("; ");
  }
  return error.message || error.detail || error.title || "";
}

async function callZenserp(query, sourceType, cacheOptions = {}) {
  const cacheKey = cacheOptions.cacheKey || buildExternalCacheKey(["zenserp", sourceType, query]);
  const cached = await getCachedExternalContext({ provider: "zenserp", cacheKey });
  if (cached?.payload?.results) {
    return {
      status: "available",
      reason: "",
      results: cached.payload.results,
      quota: null,
      cached: true
    };
  }

  const quotaReservation = await reserveMonthlyQuota({
    provider: "zenserp",
    limit: env.zenserpMonthlyLimit
  });

  if (!quotaReservation.allowed) {
    const quotaReached = quotaReservation.reason === "Monthly quota reached.";
    return {
      status: quotaReached ? "quota_exceeded" : "unavailable",
      reason: quotaReached ? "Monthly Zenserp quota reached." : quotaReservation.reason,
      results: [],
      quota: quotaReservation.quota
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ZENSERP_TIMEOUT_MS);

  try {
    const url = new URL(env.zenserpBaseUrl);
    url.searchParams.set("q", query);
    url.searchParams.set("num", "8");
    url.searchParams.set("gl", "in");
    url.searchParams.set("hl", "en");

    const response = await fetch(url, {
      headers: {
        apikey: env.zenserpApiKey
      },
      signal: controller.signal
    });

    const data = await response.json();
    const providerError = extractProviderError(data);
    if (!response.ok || providerError) {
      throw new Error(providerError || `Zenserp returned HTTP ${response.status}.`);
    }

    const results = extractOrganicResults(data)
      .map((item) => normalizeResult(item, query, sourceType))
      .filter(Boolean);

    console.info(JSON.stringify({ event: "zenserp_search_success", sourceType, resultCount: results.length }));
    if (results.length) {
      await setCachedExternalContext({
        provider: "zenserp",
        cacheKey,
        payload: { results },
        ttlMs: Number(cacheOptions.ttlMs || env.zenserpPublicCacheHours * 60 * 60 * 1000)
      });
    }
    return {
      status: "available",
      reason: "",
      results,
      quota: quotaReservation.quota,
      cached: false
    };
  } catch (error) {
    console.warn(
      JSON.stringify({
        event: "zenserp_search_unavailable",
        sourceType,
        reason: error.name === "AbortError" ? "timeout" : error.message || "unknown zenserp error"
      })
    );
    return {
      status: "unavailable",
      reason: "Zenserp civic search could not be fetched.",
      results: [],
      quota: quotaReservation.quota
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchCivicEvidencePreview({ analysis, location }) {
  if (!env.zenserpEnabled) {
    return unavailableEvidence("unavailable", "Civic context is disabled.");
  }
  if (!env.zenserpApiKey) {
    return unavailableEvidence("unavailable", "Civic context is not configured.");
  }

  const visualContext = extractVisualSearchContext(analysis);
  const query = buildPreviewQuery({ analysis, location });
  const cacheKey = buildExternalCacheKey([
    "zenserp",
    "civic_preview",
    visualContext.primaryIssue,
    ...visualContext.relatedIssues,
    ...visualContext.infrastructure,
    normalizeCachePart(location),
    new Date().toISOString().slice(0, 10)
  ]);
  const result = await callZenserp(query, "civic_context", {
    cacheKey,
    ttlMs: env.zenserpPublicCacheHours * 60 * 60 * 1000
  });
  const normalized = result.results.slice(0, 8);
  const officialSources = normalized
    .filter(isOfficialLooking)
    .map((item) => ({ ...item, sourceType: "official", official: true }))
    .slice(0, 3);
  const publicContext = normalized
    .filter((item) => !isOfficialLooking(item))
    .map((item) => ({ ...item, sourceType: "public_context", official: undefined }))
    .slice(0, 3);

  return {
    status: officialSources.length || publicContext.length ? "available" : result.status,
    provider: "zenserp",
    reason: officialSources.length || publicContext.length ? "" : result.reason,
    incidentSummary: visualContext.primaryIssue,
    searchArea: normalizeSearchValue(location || "Bengaluru"),
    basedOnImageAnalysis: true,
    officialSources,
    publicContext,
    quota: result.quota
  };
}

module.exports = {
  buildPreviewQuery,
  extractVisualSearchContext,
  fetchCivicEvidencePreview,
  isOfficialLooking
};
