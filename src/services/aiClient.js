const crypto = require("crypto");
const env = require("../config/env");
const { buildThreatAssessment } = require("./threatAssessment");
const aiCategories = require("../../shared/aiCategories.json");

const CATEGORY_ID_BY_ISSUE_TYPE = new Map(aiCategories.map((category) => [category.label, category.id]));
const AI_EVALUATION_VERSION = "urban-pulse-threat-v1";
let aiServiceConnectionStatus = {
  status: "not_checked",
  failureType: "",
  failureStage: "",
  httpStatus: null,
  checkedAt: null,
  lastSuccessAt: null,
  latencyMs: null,
  requestId: ""
};
let aiServiceProbePromise = null;

const ISSUE_PROFILES = [
  {
    id: "safety_fire",
    category: "Safety",
    issueType: "Gas Leak / Fire Risk",
    team: "Emergency Response",
    cvLabel: "Potential fire, smoke, or gas hazard",
    textTerms: [
      ["gas", 0.95],
      ["gas leak", 1.05],
      ["leak", 0.5],
      ["smoke", 0.9],
      ["smoke smell", 0.86],
      ["fire", 1.0],
      ["flame", 0.9],
      ["burn", 0.62],
      ["burning", 0.68],
      ["spark", 0.58],
      ["sparking", 0.66],
      ["short circuit", 0.98],
      ["burning wire", 0.96],
      ["transformer blast", 1.0],
      ["explosion", 1.0],
      ["emergency", 0.8]
    ],
    locationTerms: [
      ["kitchen", 0.55],
      ["basement", 0.4],
      ["electrical room", 0.7],
      ["transformer", 0.72],
      ["generator", 0.48],
      ["parking", 0.24]
    ],
    visualTerms: [
      ["fire", 1.0],
      ["smoke", 0.95],
      ["burn", 0.72],
      ["flame", 0.92],
      ["gas", 0.52]
    ],
    imageSignal(features) {
      return clamp01(
        features.redHeatRatio * 0.58 +
          features.smokeLikeRatio * 0.92 +
          features.hotspotRatio * 0.28 +
          features.darkRatio * 0.12 +
          features.neutralRatio * 0.08
      );
    },
    basePriority: 0.82
  },
  {
    id: "road_damage",
    category: "Infrastructure",
    issueType: "Road Damage",
    team: "Maintenance Team",
    cvLabel: "Road damage, pothole, or crack-like structure",
    textTerms: [
      ["pothole", 1.0],
      ["road", 0.42],
      ["broken road", 0.95],
      ["road crack", 0.92],
      ["crack", 0.72],
      ["damaged road", 0.9],
      ["sinkhole", 0.98],
      ["cave in", 0.92],
      ["cave-in", 0.92],
      ["crater", 0.72],
      ["surface damage", 0.65],
      ["pavement", 0.38],
      ["manhole", 0.45]
    ],
    locationTerms: [
      ["road", 0.45],
      ["street", 0.35],
      ["main road", 0.55],
      ["junction", 0.28],
      ["lane", 0.22],
      ["bridge", 0.36],
      ["gate", 0.18]
    ],
    visualTerms: [
      ["pothole", 1.0],
      ["crack", 0.74],
      ["broken", 0.62],
      ["road", 0.32],
      ["surface", 0.26],
      ["damage", 0.44]
    ],
    imageSignal(features) {
      return clamp01(
        features.edgeDensity * 0.55 +
          features.contrast * 0.4 +
          features.darkRatio * 0.1 +
          (1 - features.averageBrightness) * 0.08 +
          features.neutralRatio * 0.06
      );
    },
    basePriority: 0.58
  },
  {
    id: "tree_obstruction",
    category: "Infrastructure",
    issueType: "Tree / Obstruction on Road",
    team: "Horticulture and Maintenance Team",
    cvLabel: "Tree, branch, or vegetation obstruction on the roadway",
    textTerms: [
      ["tree", 1.0],
      ["fallen tree", 1.08],
      ["tree fallen", 1.02],
      ["tree on road", 1.05],
      ["branch", 0.84],
      ["log", 0.55],
      ["fallen", 0.58],
      ["uprooted", 0.88],
      ["road blocked", 1.0],
      ["blocked road", 0.96],
      ["blocked by tree", 1.04],
      ["roadblock", 0.7],
      ["obstruction", 0.86],
      ["fallen branch", 0.98],
      ["plant", 0.34],
      ["vegetation", 0.6]
    ],
    locationTerms: [
      ["road", 0.5],
      ["street", 0.34],
      ["main road", 0.42],
      ["junction", 0.22],
      ["lane", 0.16],
      ["avenue", 0.18]
    ],
    visualTerms: [
      ["tree", 1.0],
      ["branch", 0.86],
      ["fallen", 0.62],
      ["vegetation", 0.58],
      ["leaves", 0.52],
      ["obstruction", 0.68]
    ],
    imageSignal(features) {
      return clamp01(
        features.greenRatio * 1.24 +
          features.averageSaturation * 0.18 +
          features.edgeDensity * 0.2 +
          features.contrast * 0.16 +
          (1 - features.blueRatio) * 0.08
      );
    },
    basePriority: 0.64
  },
  {
    id: "garbage",
    category: "Sanitation",
    issueType: "Garbage Overflow",
    team: "Sanitation Team",
    cvLabel: "Garbage, waste, or clutter accumulation",
    textTerms: [
      ["garbage", 1.0],
      ["waste", 0.72],
      ["trash", 0.8],
      ["dustbin", 0.7],
      ["overflow", 0.55],
      ["litter", 0.65],
      ["dump", 0.82],
      ["dirty common area", 0.92],
      ["common area", 0.52],
      ["dirty", 0.48],
      ["unclean", 0.44],
      ["sanitation", 0.74]
    ],
    locationTerms: [
      ["market", 0.32],
      ["street", 0.2],
      ["colony", 0.18],
      ["dump yard", 0.52],
      ["lane", 0.14]
    ],
    visualTerms: [
      ["garbage", 1.0],
      ["waste", 0.78],
      ["trash", 0.8],
      ["dump", 0.75],
      ["overflow", 0.48]
    ],
    imageSignal(features) {
      return clamp01(
        features.edgeDensity * 0.34 +
          features.averageSaturation * 0.22 +
          features.contrast * 0.24 +
          features.darkRatio * 0.14 +
          features.neutralRatio * 0.12 +
          (1 - features.blueRatio) * 0.08
      );
    },
    basePriority: 0.46
  },
  {
    id: "sewage_overflow",
    category: "Sanitation",
    issueType: "Sewage / Manhole Overflow",
    team: "Sanitation and Drainage Team",
    cvLabel: "Sewage spill, dirty drain overflow, or open manhole hazard",
    textTerms: [
      ["sewage", 1.0],
      ["manhole", 0.95],
      ["open manhole", 1.05],
      ["drain overflow", 0.92],
      ["dirty water", 0.74],
      ["waste water", 0.78],
      ["foul smell", 0.82],
      ["sludge", 0.72],
      ["gutter", 0.76],
      ["sewer", 0.84],
      ["drain blocked", 0.68]
    ],
    locationTerms: [
      ["drain", 0.42],
      ["sewer", 0.5],
      ["basement", 0.22],
      ["lane", 0.14],
      ["road", 0.14]
    ],
    visualTerms: [
      ["sewage", 1.0],
      ["manhole", 0.9],
      ["dirty water", 0.72],
      ["drain", 0.62],
      ["overflow", 0.46],
      ["sludge", 0.72]
    ],
    imageSignal(features) {
      return clamp01(
        features.neutralRatio * 0.18 +
          features.darkRatio * 0.14 +
          features.blueRatio * 0.12 +
          features.contrast * 0.08
      );
    },
    basePriority: 0.61
  },
  {
    id: "water_drainage",
    category: "Infrastructure",
    issueType: "Drainage / Waterlogging",
    team: "Maintenance Team",
    cvLabel: "Waterlogging, drainage overflow, or wet surface pattern",
    textTerms: [
      ["water", 0.4],
      ["water clogging", 1.0],
      ["water logging", 1.0],
      ["waterlogged", 0.96],
      ["drainage", 0.92],
      ["drain", 0.66],
      ["clogged drain", 0.88],
      ["overflow", 0.5],
      ["flood", 0.82],
      ["stagnant", 0.68],
      ["stagnant water", 0.82],
      ["water stagnation", 0.84],
      ["heavy waterlogging", 0.96],
      ["blocked drainage", 0.9],
      ["rain water accumulation", 0.84],
      ["leakage", 0.44]
    ],
    locationTerms: [
      ["drain", 0.44],
      ["street", 0.18],
      ["road", 0.16],
      ["basement", 0.24],
      ["colony", 0.14]
    ],
    visualTerms: [
      ["water", 0.84],
      ["drain", 0.66],
      ["overflow", 0.48],
      ["flood", 0.78],
      ["wet", 0.46]
    ],
    imageSignal(features) {
      return clamp01(
        features.blueRatio * 0.92 +
          features.neutralRatio * 0.42 +
          (1 - features.averageSaturation) * 0.22 +
          features.averageBrightness * 0.1
      );
    },
    basePriority: 0.52
  },
  {
    id: "wall_damage",
    category: "Infrastructure",
    issueType: "Wall / Building Damage",
    team: "Civil Maintenance Team",
    cvLabel: "Cracked wall, ceiling damage, or structural surface defect",
    textTerms: [
      ["wall crack", 1.0],
      ["cracked wall", 1.0],
      ["ceiling", 0.62],
      ["ceiling crack", 0.94],
      ["building crack", 1.0],
      ["plaster", 0.58],
      ["plaster fallen", 0.82],
      ["masonry", 0.86],
      ["masonry deterioration", 0.98],
      ["deterioration", 0.72],
      ["wear", 0.46],
      ["structural", 0.88],
      ["collapse", 0.92],
      ["collapsed wall", 0.96],
      ["damaged wall", 0.86],
      ["seepage", 0.72],
      ["leak stain", 0.58]
    ],
    locationTerms: [
      ["building", 0.3],
      ["block", 0.22],
      ["tower", 0.22],
      ["staircase", 0.18],
      ["corridor", 0.14],
      ["ceiling", 0.2]
    ],
    visualTerms: [
      ["crack", 0.92],
      ["wall", 0.56],
      ["ceiling", 0.58],
      ["damage", 0.5],
      ["plaster", 0.46],
      ["structural", 0.74]
    ],
    imageSignal(features) {
      return clamp01(
        features.edgeDensity * 0.4 +
          features.contrast * 0.26 +
          features.neutralRatio * 0.28 +
          features.darkRatio * 0.14 +
          (1 - features.averageSaturation) * 0.12
      );
    },
    basePriority: 0.57
  },
  {
    id: "security",
    category: "Security",
    issueType: "Security Concern",
    team: "Security Team",
    cvLabel: "Suspicious or security-related visual anomaly",
    textTerms: [
      ["theft", 0.96],
      ["suspicious", 0.92],
      ["suspicious person", 0.98],
      ["suspicious activity", 0.96],
      ["fight", 0.72],
      ["robbery", 0.94],
      ["intruder", 0.98],
      ["security", 0.72],
      ["open gate", 1.0],
      ["open gates", 1.0],
      ["unsecured entryway", 1.02],
      ["entryway", 0.62],
      ["access", 0.46],
      ["unsafe", 0.4],
      ["trespass", 0.82]
    ],
    locationTerms: [
      ["gate", 0.3],
      ["parking", 0.18],
      ["entrance", 0.22],
      ["security cabin", 0.5]
    ],
    visualTerms: [
      ["suspicious", 0.7],
      ["security", 0.66]
    ],
    imageSignal(features) {
      return clamp01(features.darkRatio * 0.26 + features.edgeDensity * 0.22 + features.contrast * 0.18 + (1 - features.averageBrightness) * 0.12);
    },
    basePriority: 0.62
  },
  {
    id: "utility_fault",
    category: "Infrastructure",
    issueType: "Utility Fault",
    team: "Electrical Team",
    cvLabel: "Electrical short circuit, exposed wiring, or utility fault",
    textTerms: [
      ["streetlight", 1.0],
      ["street light", 1.0],
      ["street light off", 1.05],
      ["streetlight not working", 1.05],
      ["streetlight off", 1.05],
      ["switchboard", 0.92],
      ["switchboard wiring", 1.04],
      ["wiring", 0.74],
      ["exposed wire", 0.98],
      ["exposed wires", 0.98],
      ["electric", 0.72],
      ["wire", 0.46],
      ["live wire", 0.96],
      ["fallen wire", 0.96],
      ["hanging wire", 0.88],
      ["snapped wire", 0.96],
      ["cable", 0.5],
      ["lamp post", 0.78],
      ["pole", 0.36],
      ["electric pole", 0.82],
      ["fallen pole", 0.92],
      ["transformer", 0.72],
      ["power outage", 0.82],
      ["no power", 0.78],
      ["no light", 0.8],
      ["meter box", 0.7],
      ["power", 0.44],
      ["flicker", 0.38]
    ],
    locationTerms: [
      ["street", 0.18],
      ["road", 0.14],
      ["pole", 0.32],
      ["junction", 0.18]
    ],
    visualTerms: [
      ["light", 0.36],
      ["pole", 0.28],
      ["wire", 0.36],
      ["electric", 0.44]
    ],
    imageSignal(features) {
      return clamp01(
        features.hotspotRatio * 0.74 +
          features.edgeDensity * 0.24 +
          features.redHeatRatio * 0.22 -
          features.smokeLikeRatio * 0.2
      );
    },
    basePriority: 0.48
  },
  {
    id: "water_leakage",
    category: "Infrastructure",
    issueType: "Water Leakage / Pipe Burst",
    team: "Water Supply and Maintenance Team",
    cvLabel: "Leakage, pipe burst, or continuous water seepage pattern",
    textTerms: [
      ["water leak", 1.0],
      ["pipe leak", 1.0],
      ["pipe burst", 1.06],
      ["burst pipe", 1.06],
      ["leaking pipe", 0.96],
      ["water leakage", 1.02],
      ["tap leak", 0.84],
      ["pipe break", 0.92],
      ["tap broken", 0.78],
      ["overflowing tank", 0.92],
      ["water line", 0.66],
      ["pipeline", 0.58],
      ["leak evidence", 0.92],
      ["seepage", 0.74],
      ["leakage", 0.52]
    ],
    locationTerms: [
      ["pipe", 0.42],
      ["tank", 0.34],
      ["overhead tank", 0.56],
      ["corridor", 0.16],
      ["wash area", 0.22],
      ["basement", 0.18]
    ],
    visualTerms: [
      ["leak", 0.8],
      ["water", 0.72],
      ["pipe", 0.66],
      ["seepage", 0.74],
      ["wet", 0.5]
    ],
    imageSignal(features) {
      return clamp01(
        features.blueRatio * 0.42 +
          features.neutralRatio * 0.26 +
          features.averageBrightness * 0.14 +
          features.edgeDensity * 0.12 +
          features.contrast * 0.08
      );
    },
    basePriority: 0.54
  },
  {
    id: "animal_intrusion",
    category: "Public Health",
    issueType: "Stray Animal / Animal Menace",
    team: "Animal Control and Sanitation Team",
    cvLabel: "Animal intrusion or stray animal obstruction",
    textTerms: [
      ["stray dog", 1.04],
      ["stray dogs", 1.04],
      ["stray animal", 1.0],
      ["dog", 0.5],
      ["dogs", 0.5],
      ["cow", 0.82],
      ["cattle", 0.82],
      ["bull", 0.84],
      ["monkey", 0.78],
      ["pig", 0.7],
      ["snake", 0.92],
      ["animal on road", 1.02],
      ["animal menace", 0.92],
      ["dead animal", 1.0]
    ],
    locationTerms: [
      ["road", 0.16],
      ["street", 0.14],
      ["market", 0.16],
      ["play area", 0.24],
      ["park", 0.22],
      ["gate", 0.12]
    ],
    visualTerms: [
      ["animal", 0.86],
      ["dog", 0.8],
      ["cow", 0.82],
      ["cattle", 0.82]
    ],
    imageSignal(features) {
      return clamp01(features.contrast * 0.16 + features.edgeDensity * 0.18 + features.darkRatio * 0.08 + features.greenRatio * 0.08);
    },
    basePriority: 0.5
  },
  {
    id: "vehicle_obstruction",
    category: "Traffic",
    issueType: "Vehicle Obstruction / Illegal Parking",
    team: "Traffic and Enforcement Team",
    cvLabel: "Vehicle obstruction, illegal parking, or blocked access",
    textTerms: [
      ["illegal parking", 1.06],
      ["wrong parking", 1.0],
      ["vehicle blocking", 1.02],
      ["blocked driveway", 1.04],
      ["abandoned vehicle", 1.02],
      ["car parked", 0.74],
      ["truck blocking", 0.96],
      ["bike blocking", 0.92],
      ["double parked", 0.96],
      ["vehicle obstruction", 1.0],
      ["blocked entrance", 0.92],
      ["blocking gate", 1.0],
      ["gate blocked", 0.96],
      ["driveway blocked", 1.0]
    ],
    locationTerms: [
      ["gate", 0.3],
      ["entrance", 0.3],
      ["road", 0.2],
      ["street", 0.18],
      ["driveway", 0.42],
      ["parking", 0.3],
      ["junction", 0.18]
    ],
    visualTerms: [
      ["vehicle", 0.78],
      ["car", 0.72],
      ["bike", 0.68],
      ["truck", 0.76],
      ["parking", 0.52]
    ],
    imageSignal(features) {
      return clamp01(features.edgeDensity * 0.2 + features.contrast * 0.18 + features.darkRatio * 0.12 + features.neutralRatio * 0.1 + (1 - features.greenRatio) * 0.08);
    },
    basePriority: 0.56
  }
];

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function hasAnyTerm(text, terms) {
  return terms.some((term) => text.includes(term));
}

function keywordScore(text, weightedTerms = []) {
  return clamp01(
    weightedTerms.reduce((sum, [term, weight]) => {
      return text.includes(term) ? sum + weight : sum;
    }, 0)
  );
}

function createGeneralProfile() {
  return {
    category: "General",
    issueType: "Civic Complaint",
    team: "Help Desk",
    cvLabel: "General civic visual anomaly",
    textScore: 0,
    visualScore: 0,
    id: "general"
  };
}

function scoreTextProfiles(unifiedText, locationText) {
  return ISSUE_PROFILES.map((profile) => {
    const textScore = keywordScore(unifiedText, profile.textTerms);
    const locationScore = keywordScore(locationText, profile.locationTerms);
    return {
      ...profile,
      textScore: clamp01(textScore + locationScore * 0.55)
    };
  });
}

function scoreVisualProfiles(imageFeatures, imageLabel) {
  if (!imageFeatures) {
    return ISSUE_PROFILES.map((profile) => ({
      ...profile,
      visualScore: 0
    }));
  }

  const scoredProfiles = ISSUE_PROFILES.map((profile) => {
    const imageScore = profile.imageSignal ? profile.imageSignal(imageFeatures) : 0;
    const labelScore = keywordScore(imageLabel, profile.visualTerms);
    return {
      ...profile,
      visualScore: clamp01(imageScore + labelScore * 0.45)
    };
  });

  const vegetationStrength = clamp01(
    imageFeatures.greenRatio * 1.2 +
      imageFeatures.averageSaturation * 0.24 +
      imageFeatures.edgeDensity * 0.16 -
      imageFeatures.blueRatio * 0.08
  );
  const dirtyWaterStrength = clamp01(
    imageFeatures.neutralRatio * 0.6 +
      imageFeatures.darkRatio * 0.44 +
      (1 - imageFeatures.blueRatio) * 0.24 +
      (1 - imageFeatures.averageBrightness) * 0.18
  );
  const waterLeakStrength = clamp01(
    imageFeatures.blueRatio * 0.44 +
      imageFeatures.neutralRatio * 0.28 +
      imageFeatures.averageBrightness * 0.14 +
      imageFeatures.edgeDensity * 0.12
  );
  const structuralStrength = clamp01(
    imageFeatures.edgeDensity * 0.42 +
      imageFeatures.neutralRatio * 0.34 +
      imageFeatures.contrast * 0.26 +
      (1 - imageFeatures.averageSaturation) * 0.18
  );

  return scoredProfiles.map((profile) => {
    const electricalArcingStrength = clamp01(
      imageFeatures.hotspotRatio * 0.74 +
        imageFeatures.edgeDensity * 0.24 +
        imageFeatures.redHeatRatio * 0.22 -
        imageFeatures.smokeLikeRatio * 0.2
    );

    if (["road_damage", "wall_damage"].includes(profile.id) && electricalArcingStrength > 0.48) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore - 0.55)
      };
    }

    if (profile.id === "tree_obstruction" && vegetationStrength > 0.2) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore + 0.18 + vegetationStrength * 0.22)
      };
    }

    if (profile.id === "garbage" && vegetationStrength > 0.2) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore - (0.12 + vegetationStrength * 0.18))
      };
    }

    if (profile.id === "road_damage" && imageFeatures.greenRatio > 0.2) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore - 0.08)
      };
    }

    if (profile.id === "sewage_overflow" && dirtyWaterStrength > 0.22 && hasAnyTerm(imageLabel, ["sewage", "manhole", "sludge", "drain overflow"])) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore + 0.12 + dirtyWaterStrength * 0.12)
      };
    }

    if (profile.id === "sewage_overflow" && !hasAnyTerm(imageLabel, ["sewage", "manhole", "sludge", "drain overflow"])) {
      return {
        ...profile,
        visualScore: Math.min(0.42, profile.visualScore)
      };
    }

    if (profile.id === "water_drainage" && dirtyWaterStrength > 0.22 && imageFeatures.blueRatio < 0.2) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore - 0.08)
      };
    }

    if (profile.id === "water_drainage" && imageFeatures.greenRatio > 0.22) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore - (0.12 + imageFeatures.greenRatio * 0.16))
      };
    }

    if (profile.id === "wall_damage" && structuralStrength > 0.24 && hasAnyTerm(imageLabel, ["wall", "crack", "ceiling", "plaster", "structural"])) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore + 0.1 + structuralStrength * 0.14)
      };
    }

    if (profile.id === "water_leakage" && waterLeakStrength > 0.3 && (imageFeatures.blueRatio > 0.24 || hasAnyTerm(imageLabel, ["leak", "pipe", "burst", "seepage"]))) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore + 0.12 + waterLeakStrength * 0.14)
      };
    }

    if (profile.id === "garbage" && structuralStrength > 0.26 && imageFeatures.greenRatio < 0.18) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore - 0.06)
      };
    }

    if (profile.id === "utility_fault" && imageFeatures.greenRatio > 0.24) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore - 0.06)
      };
    }

    if (profile.id === "vehicle_obstruction" && imageFeatures.neutralRatio > 0.16 && imageFeatures.greenRatio < 0.2 && hasAnyTerm(imageLabel, ["vehicle", "car", "truck", "parking"])) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore + 0.06)
      };
    }

    return profile;
  });
}

function pickTopProfile(scoredProfiles, key, threshold = 0.18) {
  const sorted = [...scoredProfiles].sort((left, right) => right[key] - left[key]);
  const top = sorted[0];

  if (!top || top[key] < threshold) {
    return createGeneralProfile();
  }

  return top;
}

function buildNlpResult(payload) {
  const unifiedText = normalizeText([payload.textComplaint, payload.voiceTranscript].filter(Boolean).join(" "));
  const locationText = normalizeText(payload.location);
  const scoredProfiles = scoreTextProfiles(unifiedText, locationText);
  const top = pickTopProfile(scoredProfiles, "textScore");

  return {
    profile: top,
    profiles: scoredProfiles,
    unifiedText,
    result: {
      category: top.category,
      issueType: top.issueType,
      team: top.team,
      confidence: Number(top.textScore.toFixed(2))
    }
  };
}

function buildCvResult(payload) {
  const imageLabel = normalizeText([payload.textComplaint, payload.voiceTranscript].filter(Boolean).join(" "));
  const scoredProfiles = scoreVisualProfiles(payload.imageFeatures, imageLabel);
  const sortedProfiles = [...scoredProfiles].sort((left, right) => right.visualScore - left.visualScore);
  const visualMargin = (sortedProfiles[0]?.visualScore || 0) - (sortedProfiles[1]?.visualScore || 0);
  const visualThreshold = imageLabel ? 0.52 : 0.58;
  const reliableVisualDecision = Boolean(sortedProfiles[0]?.visualScore >= visualThreshold && visualMargin >= 0.08);
  const top = reliableVisualDecision ? sortedProfiles[0] : createGeneralProfile();

  if (!payload.imageFeatures) {
    return {
      profile: top,
      profiles: scoredProfiles,
      result: {
        detected: "No image uploaded",
        score: 0.18,
        reason: "No visual features were provided."
      }
    };
  }

  const reasons = {
    safety_fire: `Heat ${payload.imageFeatures.redHeatRatio}, smoke ${payload.imageFeatures.smokeLikeRatio}, hotspot ${payload.imageFeatures.hotspotRatio}`,
    road_damage: `Edge density ${payload.imageFeatures.edgeDensity}, contrast ${payload.imageFeatures.contrast}, dark regions ${payload.imageFeatures.darkRatio}`,
    tree_obstruction: `Green ratio ${payload.imageFeatures.greenRatio}, edge density ${payload.imageFeatures.edgeDensity}, contrast ${payload.imageFeatures.contrast}`,
    garbage: `Texture ${payload.imageFeatures.edgeDensity}, saturation ${payload.imageFeatures.averageSaturation}, contrast ${payload.imageFeatures.contrast}`,
    sewage_overflow: `Neutral regions ${payload.imageFeatures.neutralRatio}, dark regions ${payload.imageFeatures.darkRatio}, blue ratio ${payload.imageFeatures.blueRatio}`,
    water_drainage: `Blue ratio ${payload.imageFeatures.blueRatio}, neutral regions ${payload.imageFeatures.neutralRatio}, saturation ${payload.imageFeatures.averageSaturation}`,
    water_leakage: `Blue ratio ${payload.imageFeatures.blueRatio}, neutral regions ${payload.imageFeatures.neutralRatio}, brightness ${payload.imageFeatures.averageBrightness}`,
    wall_damage: `Edge density ${payload.imageFeatures.edgeDensity}, contrast ${payload.imageFeatures.contrast}, neutral surface ${payload.imageFeatures.neutralRatio}`,
    security: `Darkness ${payload.imageFeatures.darkRatio}, texture ${payload.imageFeatures.edgeDensity}, contrast ${payload.imageFeatures.contrast}`,
    utility_fault: `Hotspot ${payload.imageFeatures.hotspotRatio}, edge density ${payload.imageFeatures.edgeDensity}, brightness ${payload.imageFeatures.averageBrightness}`,
    animal_intrusion: `Texture ${payload.imageFeatures.edgeDensity}, contrast ${payload.imageFeatures.contrast}, green ratio ${payload.imageFeatures.greenRatio}`,
    vehicle_obstruction: `Texture ${payload.imageFeatures.edgeDensity}, contrast ${payload.imageFeatures.contrast}, neutral surface ${payload.imageFeatures.neutralRatio}`
  };

  return {
    profile: top,
    profiles: scoredProfiles,
    result: {
      detected: reliableVisualDecision ? top.cvLabel : "Image uploaded; incident unclear",
      score: Number(top.visualScore.toFixed(2)),
      reason: reasons[top.id] || "Visual signals were matched against issue patterns.",
      candidates: scoredProfiles
        .filter((profile) => profile.visualScore > 0)
        .sort((left, right) => right.visualScore - left.visualScore)
        .slice(0, 5)
        .map((profile) => ({
          label: profile.cvLabel,
          category_id: profile.id,
          category_label: profile.issueType,
          confidence: Number(profile.visualScore.toFixed(2)),
          source: "feature"
        })),
      model: "feature-signals",
      provider: "feature-fallback",
      fallbackUsed: true,
      confidenceBreakdown: {
        featureTop: Number(top.visualScore.toFixed(2)),
        clipTop: 0,
        fusedTop: Number(top.visualScore.toFixed(2)),
        candidateMargin: Number(Math.max(0, visualMargin).toFixed(2)),
        reliableVisualDecision
      }
    }
  };
}

function fuseIssueDecision(nlpBundle, cvBundle, payload) {
  const hasImage = Boolean(payload.imageFeatures);
  const textProfiles = new Map((nlpBundle.profiles || []).map((profile) => [profile.id, profile]));
  const visualProfiles = new Map((cvBundle.profiles || []).map((profile) => [profile.id, profile]));
  const unifiedText = nlpBundle.unifiedText || "";
  const imageFeatures = payload.imageFeatures || {};
  const hasText = Boolean(unifiedText);

  const scoredProfiles = ISSUE_PROFILES.map((profile) => {
    const textScore = textProfiles.get(profile.id)?.textScore || 0;
    const visualScore = visualProfiles.get(profile.id)?.visualScore || 0;
    let fusedScore = hasImage && !hasText
      ? visualScore * 0.92
      : textScore * (hasImage ? 0.58 : 0.84) + visualScore * (hasImage ? 0.42 : 0.12);

    fusedScore += Math.min(textScore, visualScore) * (hasImage && hasText ? 0.18 : 0.04);

    if (profile.id === "safety_fire" && payload.iotTriggered) {
      fusedScore += 0.12;
    }
    if (profile.id === "tree_obstruction" && imageFeatures.greenRatio > 0.22 && hasAnyTerm(unifiedText, ["tree", "branch", "blocked"])) {
      fusedScore += 0.08;
    }
    if (profile.id === "water_leakage" && hasAnyTerm(unifiedText, ["leak", "pipe", "burst", "seepage"])) {
      fusedScore += 0.24;
    }
    if (profile.id === "utility_fault" && hasAnyTerm(unifiedText, ["streetlight", "street light", "wire", "pole", "transformer", "power outage", "no light"])) {
      fusedScore += 0.2;
    }
    if (profile.id === "security" && hasAnyTerm(unifiedText, ["intruder", "theft", "robbery", "suspicious", "trespass"])) {
      fusedScore += 0.18;
    }
    if (profile.id === "animal_intrusion" && hasAnyTerm(unifiedText, ["dog", "animal", "cow", "cattle", "monkey"])) {
      fusedScore += 0.08;
    }
    if (profile.id === "vehicle_obstruction" && hasAnyTerm(unifiedText, ["vehicle", "parking", "car", "truck", "bike", "driveway"])) {
      fusedScore += 0.08;
    }
    if (profile.id === "garbage" && (hasAnyTerm(unifiedText, ["tree", "branch", "sewage", "manhole", "wire", "streetlight", "animal"]) || imageFeatures.greenRatio > 0.24)) {
      fusedScore -= 0.16;
    }
    if (profile.id === "road_damage" && hasAnyTerm(unifiedText, ["streetlight", "wire", "pole", "parking", "vehicle"])) {
      fusedScore -= 0.18;
    }
    if (profile.id === "water_drainage" && hasAnyTerm(unifiedText, ["pipe", "burst", "seepage", "tank", "leakage"])) {
      fusedScore -= 0.22;
    }
    if (profile.id === "safety_fire" && hasAnyTerm(unifiedText, ["streetlight off", "no light", "power outage"]) && !hasAnyTerm(unifiedText, ["fire", "smoke", "gas", "burning"])) {
      fusedScore -= 0.16;
    }
    if (profile.id === "utility_fault" && imageFeatures.greenRatio > 0.26 && !hasAnyTerm(unifiedText, ["wire", "pole", "streetlight", "electric"])) {
      fusedScore -= 0.08;
    }

    return {
      ...profile,
      fusedScore: clamp01(fusedScore)
    };
  }).sort((left, right) => right.fusedScore - left.fusedScore);

  const minimumFusedScore = hasImage && !hasText ? 0.58 : 0.22;
  const fusedMargin = (scoredProfiles[0]?.fusedScore || 0) - (scoredProfiles[1]?.fusedScore || 0);
  const reliableImageOnly = !hasImage || hasText || fusedMargin >= 0.08;
  return scoredProfiles[0] && scoredProfiles[0].fusedScore >= minimumFusedScore && reliableImageOnly
    ? scoredProfiles[0]
    : createGeneralProfile();
}

function predictPriority(payload, issueProfile, nlp, cv) {
  const combinedText = normalizeText([payload.textComplaint, payload.voiceTranscript, payload.location].join(" "));
  let score = issueProfile.basePriority || 0.45;

  if (["urgent", "immediately", "danger", "emergency", "injury", "critical"].some((word) => combinedText.includes(word))) {
    score += 0.18;
  }

  if (["school", "hospital", "main road", "market", "junction", "community kitchen"].some((word) => combinedText.includes(word))) {
    score += 0.08;
  }

  if (payload.iotTriggered) {
    score += 0.14;
  }

  score += nlp.confidence * 0.12;
  score += cv.score * 0.16;

  if (issueProfile.id === "road_damage" && payload.imageFeatures?.contrast > 0.2) {
    score += 0.04;
  }

  if (issueProfile.id === "tree_obstruction" && payload.imageFeatures?.greenRatio > 0.18) {
    score += 0.06;
  }

  if (issueProfile.id === "water_drainage" && payload.imageFeatures?.blueRatio > 0.16) {
    score += 0.04;
  }

  if (issueProfile.id === "sewage_overflow" && payload.imageFeatures?.neutralRatio > 0.2) {
    score += 0.05;
  }

  if (issueProfile.id === "wall_damage" && payload.imageFeatures?.contrast > 0.18) {
    score += 0.04;
  }

  if (issueProfile.id === "garbage" && payload.imageFeatures?.contrast > 0.16) {
    score += 0.03;
  }
  if (issueProfile.id === "water_leakage" && payload.imageFeatures?.averageBrightness > 0.14) {
    score += 0.04;
  }
  if (issueProfile.id === "vehicle_obstruction" && ["gate", "entrance", "driveway", "ambulance"].some((word) => combinedText.includes(word))) {
    score += 0.05;
  }
  if (issueProfile.id === "animal_intrusion" && ["school", "park", "play area", "child"].some((word) => combinedText.includes(word))) {
    score += 0.06;
  }

  if (issueProfile.id === "safety_fire" || issueProfile.id === "utility_fault") {
    score += 0.08;
  }

  if (nlp.category === issueProfile.category && cv.detected !== "No image uploaded") {
    score += 0.06;
  }

  score = clamp01(score);

  if (score >= 0.9) {
    return { level: "Critical", score: Number(score.toFixed(2)) };
  }
  if (score >= 0.74) {
    return { level: "High", score: Number(score.toFixed(2)) };
  }
  if (score >= 0.54) {
    return { level: "Medium", score: Number(score.toFixed(2)) };
  }

  return { level: "Low", score: Number(score.toFixed(2)) };
}

function buildAlerts(priority, location, issueProfile) {
  if (priority.level === "Critical") {
    return [
      `Emergency alert raised for ${issueProfile.issueType}`,
      `Residents near ${location || "the affected zone"} warned instantly`
    ];
  }

  if (priority.level === "High") {
    return [
      `High-priority admin alert created for ${issueProfile.issueType}`,
      `Nearby users notified for ${location || "the selected zone"}`
    ];
  }

  return [`Complaint logged for ${issueProfile.team}`];
}

function assignAuthority(priority, location, issueProfile) {
  const locationText = normalizeText(location);
  const municipalityKeywords = ["main road", "market", "downtown", "city", "ward", "bus stand", "station", "junction", "school", "hospital"];

  if (priority.level === "Critical" || priority.level === "High") {
    return "Municipality";
  }

  if (["safety_fire", "utility_fault", "vehicle_obstruction"].includes(issueProfile.id) || municipalityKeywords.some((keyword) => locationText.includes(keyword))) {
    return "Municipality";
  }

  return "Gram Panchayat";
}

function buildMapLocation(location) {
  const baseLat = 12.9716;
  const baseLng = 77.5946;
  const seed = Array.from(String(location || "unknown")).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const latOffset = ((seed % 35) - 17) / 1000;
  const lngOffset = ((Math.floor(seed / 7) % 35) - 17) / 1000;

  return {
    lat: Number((baseLat + latOffset).toFixed(6)),
    lng: Number((baseLng + lngOffset).toFixed(6))
  };
}

function analyzeComplaintLocally(payload) {
  const nlpBundle = buildNlpResult(payload);
  const cvBundle = buildCvResult(payload);
  const fusedIssue = fuseIssueDecision(nlpBundle, cvBundle, payload);
  const priority = predictPriority(payload, fusedIssue, nlpBundle.result, cvBundle.result);
  const threatAssessment = buildThreatAssessment(payload, {
    nlpBundle,
    cvBundle,
    fusedIssue,
    priority
  });
  if (threatAssessment.threatLevel === "Critical" && threatAssessment.confidence >= 0.46 && priority.level !== "Critical") {
    priority.level = "Critical";
    priority.score = Math.max(priority.score, threatAssessment.riskScore, 0.86);
  } else if (threatAssessment.threatLevel === "High" && threatAssessment.confidence >= 0.44 && ["Low", "Medium"].includes(priority.level)) {
    priority.level = "High";
    priority.score = Math.max(priority.score, threatAssessment.riskScore, 0.74);
  }
  const alerts = buildAlerts(priority, payload.location, fusedIssue);
  const assignedAuthority = assignAuthority(priority, payload.location, fusedIssue);
  const mapLocation = buildMapLocation(payload.location);
  const mergedText = [payload.textComplaint, payload.voiceTranscript].filter(Boolean).join(" ").trim();
  const confidence = clamp01(
    Math.max(nlpBundle.result.confidence || 0, cvBundle.result.score || 0, fusedIssue.fusedScore || 0) * 0.74 +
      (nlpBundle.profile.id === cvBundle.profile.id ? 0.18 : 0.08)
  );

  return {
    unifiedText: mergedText || "Complaint submitted with image evidence.",
    nlp: {
      category: fusedIssue.category,
      issueType: fusedIssue.issueType,
      team: fusedIssue.team,
      confidence: Number((nlpBundle.result.confidence || 0).toFixed(2))
    },
    cv: {
      ...cvBundle.result,
      threatAssessment
    },
    priority,
    confidence: Number(confidence.toFixed(2)),
    status: priority.level === "Critical" ? "Escalated" : priority.level === "High" ? "In Progress" : "Queued",
    assignedAuthority,
    mapLocation,
    alerts,
    notifications: [
      "Admin dashboard updated",
      priority.level === "Critical" ? "Residents received safety warning" : "Users subscribed to the zone were notified"
    ],
    imageUpload: "Processed by local multimodal analyzer"
    ,
    threatAssessment,
    aiMeta: {
      provider: "express",
      engine: "local-keyword-feature-fusion-threat-v4",
      model: "deterministic-rules",
      fallbackUsed: true,
      categoryId: fusedIssue.id || CATEGORY_ID_BY_ISSUE_TYPE.get(fusedIssue.issueType) || "general",
      visionEngine: "browser-feature-signals-v2",
      visionProvider: "feature-fallback",
      visionFallbackUsed: true,
      evaluationVersion: AI_EVALUATION_VERSION,
      machineHintIgnoredForClassification: true,
      threatEngine: threatAssessment.engine,
      threatStatus: threatAssessment.status,
      threatLevel: threatAssessment.threatLevel,
      threatRiskScore: threatAssessment.riskScore,
      imageFingerprint: threatAssessment.integrity?.sha256 || ""
    }
  };
}

function normalizedRequestId(value) {
  const candidate = String(value || "").trim();
  return /^[A-Za-z0-9._-]{8,80}$/.test(candidate) ? candidate : crypto.randomUUID();
}

function aiServiceHeaders(requestId) {
  return {
    "Content-Type": "application/json",
    "X-Request-ID": normalizedRequestId(requestId),
    ...(env.aiServiceToken ? { "X-Urban-Pulse-Service-Token": env.aiServiceToken } : {})
  };
}

function aiServiceHost() {
  try {
    return new URL(env.aiServiceUrl).host;
  } catch (_error) {
    return "invalid-ai-service-url";
  }
}

function classifyAiServiceFailure(error) {
  if (error?.name === "AbortError") return "timeout";
  if (error?.statusCode === 401 || error?.statusCode === 403) return "authentication_failed";
  if (error?.statusCode === 413) return "payload_too_large";
  if (error?.code === "INVALID_RESPONSE") return "invalid_response";
  return "unavailable";
}

function recordAiServiceConnection(status, error = null, details = {}) {
  const checkedAt = new Date().toISOString();
  aiServiceConnectionStatus = {
    status,
    failureType: error ? classifyAiServiceFailure(error) : "",
    failureStage: error?.failureStage || "",
    httpStatus: Number(error?.statusCode) || null,
    checkedAt,
    lastSuccessAt: status === "ok" ? checkedAt : aiServiceConnectionStatus.lastSuccessAt,
    latencyMs: Number.isFinite(details.latencyMs) ? details.latencyMs : null,
    requestId: normalizedRequestId(details.requestId)
  };
}

function getAiServiceConnectionStatus() {
  return {
    ...aiServiceConnectionStatus,
    serviceHost: aiServiceHost()
  };
}

function logAiServiceFailure(error, operation, payload = {}, requestId = "") {
  const message = String(error?.message || "AI service request failed")
    .replace(/[\r\n]+/g, " ")
    .slice(0, 240);
  console.warn(JSON.stringify({
    event: "ai_service_request_failed",
    operation,
    requestId: normalizedRequestId(requestId),
    serviceHost: aiServiceHost(),
    failureType: classifyAiServiceFailure(error),
    failureStage: error?.failureStage || "web_to_ai",
    httpStatus: Number(error?.statusCode) || undefined,
    hasImage: Boolean(payload.imageBase64),
    message
  }));
}

async function parseAiServiceResponse(response) {
  const rawBody = await response.text();
  try {
    return rawBody ? JSON.parse(rawBody) : {};
  } catch (_error) {
    const error = new Error("AI microservice returned an invalid JSON response.");
    error.code = "INVALID_RESPONSE";
    error.statusCode = response.status;
    error.failureStage = "web_to_ai_response";
    throw error;
  }
}

async function probeAiService() {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.min(env.aiServiceTimeoutMs, 30000));

  try {
    const response = await fetch(`${env.aiServiceUrl}/auth/probe`, {
      method: "POST",
      headers: aiServiceHeaders(requestId),
      body: "{}",
      signal: controller.signal
    });
    const data = await parseAiServiceResponse(response);
    if (!response.ok) {
      const error = new Error(data.error || "AI service authentication probe failed.");
      error.statusCode = response.status;
      error.failureStage = data.failureStage || "ai_service_auth";
      throw error;
    }
    const latencyMs = Date.now() - startedAt;
    recordAiServiceConnection("ok", null, { requestId, latencyMs });
    return {
      ...getAiServiceConnectionStatus(),
      authenticated: data.authenticated === true
    };
  } catch (error) {
    error.failureStage = error.failureStage || "web_to_ai";
    recordAiServiceConnection("failed", error, { requestId, latencyMs: Date.now() - startedAt });
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function refreshAiServiceConnectionStatus({ maxAgeMs = 60000 } = {}) {
  const checkedAt = Date.parse(aiServiceConnectionStatus.checkedAt || "");
  if (Number.isFinite(checkedAt) && Date.now() - checkedAt < maxAgeMs) {
    return getAiServiceConnectionStatus();
  }
  if (!aiServiceProbePromise) {
    aiServiceProbePromise = probeAiService()
      .catch(() => getAiServiceConnectionStatus())
      .finally(() => {
        aiServiceProbePromise = null;
      });
  }
  return aiServiceProbePromise;
}

async function analyzeComplaint(payload, options = {}) {
  const requestId = normalizedRequestId(options.requestId);
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.aiServiceTimeoutMs);

  try {
    const response = await fetch(`${env.aiServiceUrl}/analyze`, {
      method: "POST",
      headers: aiServiceHeaders(requestId),
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const data = await parseAiServiceResponse(response);
    if (!response.ok) {
      const error = new Error(data.error || "AI microservice request failed");
      error.statusCode = response.status;
      error.failureStage = data.failureStage || "ai_service";
      throw error;
    }
    recordAiServiceConnection("ok", null, { requestId, latencyMs: Date.now() - startedAt });
    console.info(JSON.stringify({
      event: "ai_service_request_succeeded",
      operation: "analyze",
      requestId,
      serviceHost: aiServiceHost(),
      durationMs: Date.now() - startedAt,
      hasImage: Boolean(payload.imageBase64)
    }));

    const threatAssessment = buildThreatAssessment(payload, {
      remoteAnalysis: data
    });

    return {
      ...data,
      threatAssessment,
      cv: {
        ...(data.cv || {}),
        threatAssessment
      },
      aiMeta: {
        ...(data.aiMeta || {}),
        requestId,
        provider: data.aiMeta?.provider || "flask",
        engine: data.aiMeta?.engine || "hybrid-scene-threat-v5",
        model: data.aiMeta?.model || "sentence-transformers+florence-or-safe-fallback",
        fallbackUsed: false,
        categoryId: data.aiMeta?.categoryId || CATEGORY_ID_BY_ISSUE_TYPE.get(data.nlp?.issueType) || data.category || "general",
        visionEngine: data.aiMeta?.visionEngine || "shared-feature-signals-v2",
        visionProvider: data.aiMeta?.visionProvider || data.cv?.provider || "feature-fallback",
        visionFallbackUsed: Boolean(data.aiMeta?.visionFallbackUsed || data.cv?.fallbackUsed),
        evaluationVersion: data.aiMeta?.evaluationVersion || AI_EVALUATION_VERSION,
        machineHintIgnoredForClassification: Boolean(data.aiMeta?.machineHintIgnoredForClassification),
        threatEngine: data.aiMeta?.threatEngine || threatAssessment.engine,
        threatStatus: data.aiMeta?.threatStatus || threatAssessment.status,
        threatLevel: data.aiMeta?.threatLevel || threatAssessment.threatLevel,
        threatRiskScore: data.aiMeta?.threatRiskScore || threatAssessment.riskScore,
        imageFingerprint: data.aiMeta?.imageFingerprint || threatAssessment.integrity?.sha256 || ""
      }
    };
  } catch (error) {
    error.failureStage = error.failureStage || "web_to_ai";
    recordAiServiceConnection("failed", error, { requestId, latencyMs: Date.now() - startedAt });
    logAiServiceFailure(error, "analyze", payload, requestId);
    const fallback = analyzeComplaintLocally(payload);
    return {
      ...fallback,
      aiMeta: {
        ...(fallback.aiMeta || {}),
        requestId,
        upstreamStatus: classifyAiServiceFailure(error),
        upstreamHttpStatus: Number(error?.statusCode) || null,
        upstreamStage: error.failureStage
      }
    };
  } finally {
    clearTimeout(timeout);
  }
}

function compareResolutionEvidenceLocally(payload) {
  const vote = String(payload.vote || "").trim().toLowerCase();
  const originalPriority = String(payload.originalPriority || "").trim().toUpperCase();
  const hasImage = Boolean(payload.imageBase64 || payload.imageFeatures);

  if (vote === "still_there" || vote === "got_worse") {
    return {
      outcome: "needs_rework",
      confidence: vote === "got_worse" ? 0.92 : 0.86,
      reason: vote === "got_worse" ? "Citizen follow-up reports that the issue has worsened." : "Citizen follow-up reports that the original issue remains.",
      visualComparison: hasImage ? "follow_up_image_recorded" : "no_follow_up_image",
      followUpEvidence: { hasImage, reviewRequired: true, confidenceLabel: "Needs Review" },
      engine: "resolution-evidence-comparator-fallback-v1",
      disclaimer: "This comparison supports review; it does not independently prove that physical work was completed."
    };
  }

  if (vote === "resolved" && ["HIGH", "CRITICAL"].includes(originalPriority)) {
    return {
      outcome: "needs_admin_review",
      confidence: 0.64,
      reason: "A high-risk incident needs an authority review even after a citizen marks it resolved.",
      visualComparison: hasImage ? "follow_up_image_recorded" : "no_follow_up_image",
      followUpEvidence: { hasImage, reviewRequired: true, confidenceLabel: "Needs Review" },
      engine: "resolution-evidence-comparator-fallback-v1",
      disclaimer: "This comparison supports review; it does not independently prove that physical work was completed."
    };
  }

  return {
    outcome: vote === "resolved" ? "citizen_confirmed" : "needs_admin_review",
    confidence: hasImage ? 0.68 : 0.56,
    reason: vote === "resolved" ? "Citizen marked the issue resolved." : "Follow-up evidence needs manual review.",
    visualComparison: hasImage ? "follow_up_image_recorded" : "no_follow_up_image",
    followUpEvidence: { hasImage, reviewRequired: !hasImage, confidenceLabel: hasImage ? "Medium" : "Needs Review" },
    engine: "resolution-evidence-comparator-fallback-v1",
    disclaimer: "This comparison supports review; it does not independently prove that physical work was completed."
  };
}

async function compareResolutionEvidence(payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${env.aiServiceUrl}/compare-resolution`, {
      method: "POST",
      headers: aiServiceHeaders(),
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Resolution comparison failed");
    }
    return data;
  } catch (_error) {
    return compareResolutionEvidenceLocally(payload);
  } finally {
    clearTimeout(timeout);
  }
}

async function processTranscriptWithAi(payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(`${env.aiServiceUrl}/transcript/process`, {
      method: "POST",
      headers: aiServiceHeaders(),
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Transcript processing failed");
    }

    return data;
  } catch (_error) {
    const transcript = normalizeComplaintTranscript(payload.transcript);
    return {
      transcript: String(payload.transcript || "").trim(),
      normalizedTranscript: transcript.normalizedTranscript,
      summary: transcript.summary,
      provider: "express-transcript-normalizer-v2"
    };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeComplaintTranscript(value) {
  let text = normalizeText(value);
  const fillerPhrases = [
    "um",
    "uh",
    "please note that",
    "i want to say",
    "i would like to report",
    "i want to report",
    "this is a complaint about"
  ];

  fillerPhrases.forEach((phrase) => {
    text = text.replaceAll(phrase, " ");
  });
  text = text
    .replaceAll("water logging", "waterlogging")
    .replaceAll("street light", "streetlight")
    .replaceAll("bbmp", "BBMP")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return { normalizedTranscript: "", summary: "" };
  }

  const normalizedTranscript = `${text.charAt(0).toUpperCase()}${text.slice(1)}${/[.!?]$/.test(text) ? "" : "."}`;
  const summary =
    normalizedTranscript.length > 420
      ? `${normalizedTranscript.slice(0, 417).replace(/\s+\S*$/, "").replace(/[.,;:]$/, "")}...`
      : normalizedTranscript;

  return { normalizedTranscript, summary };
}

function detectIntentLocally(message, history = []) {
    const normalized = normalizeText(message);
    const recentText = normalizeText(
      history
        .slice(-6)
      .map((item) => item.content)
      .join(" ")
  );

  if (/^(hi|hello|hey|good morning|good evening)\b/.test(normalized)) {
    return {
      intent: "greeting",
      response: "Hello. I can help you check complaint status, raise a complaint, answer common questions, and help you navigate the dashboard.",
      confidence: 0.94
    };
  }

  if (/(status|update|track|where is|progress).*(complaint|report)|complaint.*(status|update|progress)/.test(normalized)) {
    return {
      intent: "complaint_status",
      response: "Checking your latest complaint status now.",
      confidence: 0.9
      };
    }

    const faqResponses = [
      {
        patterns: ["login", "sign in", "register", "sign up", "signup", "otp", "account"],
        response: "Use the login and registration overlay to sign in as Citizen or Admin. Registration requires email OTP verification, and forgot password can reset an existing account by email OTP."
      },
      {
        patterns: ["report", "raise complaint", "submit complaint", "file complaint", "how do i complain"],
        response: "Use Report an Issue to submit a complaint. You can enter text, record voice, attach an image, set the location, then submit it for AI analysis and routing."
      },
      {
        patterns: ["voice", "audio", "transcript", "transcription", "recording", "microphone"],
        response: "Voice complaints use live recording in the browser. After recording stops, the backend sends the audio to Deepgram, then the processed transcript is filled into the complaint summary."
      },
      {
        patterns: ["map", "location", "live location", "preview"],
        response: "Use Live Location to fill the location field automatically. Show Map updates the live location preview."
      },
      {
        patterns: ["image analysis", "photo analysis", "uploaded photo", "what does ai do", "florence"],
        response: "The visual service observes the scene, visible civic issues, infrastructure damage, hazards, image quality, and uncertainty. Urban Pulse combines those observations with complaint and location evidence, while unclear or conflicting cases require human review."
      },
      {
        patterns: ["ward", "department", "routing", "route complaint", "which authority"],
        response: "Bengaluru routing uses the complaint location, ward evidence, issue category, severity, and configured authority directory to select a BBMP-aligned department, operational unit, and escalation destination."
      },
      {
        patterns: ["nearby users", "community verification", "verify incident", "still present", "worsening", "duplicate complaint"],
        response: "Eligible nearby citizens can mark an incident as still present, worsening, resolved, or duplicated without seeing the reporter's identity or private evidence. Conflicting or suspicious signals are retained for review."
      },
      {
        patterns: ["government api", "government integration", "official api", "future implementation", "future feature", "officer access"],
        response: "Future authorized government API access could create official tickets directly, synchronize acknowledgements and status, assign verified officers, exchange resolution evidence, and provide authorities with a managed queue. It depends on formal API access, secure credentials, data-sharing agreements, and department adoption."
      },
      {
        patterns: ["admin", "dashboard", "reset", "alerts", "status update"],
        response: "Admin actions stay permission-protected. Admin users can review complaints, update status, and manage dashboard data through the admin panels."
      },
      {
        patterns: ["bbmp", "email", "mail", "portal", "pdf", "receipt", "download", "reach authority", "authority handoff"],
        response: "Urban Pulse prepares an authority ticket and supports configured email or webhook delivery, plus manual official-portal handoff with reference tracking. Actual delivery depends on the authority channel configured by the deployment administrator."
      }
    ];

    const faqMatch = faqResponses.find((item) => item.patterns.some((pattern) => normalized.includes(pattern)));
    if (faqMatch) {
      return {
        intent: "faq",
        response: faqMatch.response,
        confidence: 0.76
      };
    }

    if (/(raise|report|submit|file|complaint|issue|problem)/.test(normalized) || /need to complain/.test(recentText)) {
      return {
        intent: "raise_complaint",
        response: "Share the complaint details, and I will guide you through creating it here in chat.",
      confidence: 0.82
    };
  }

  return {
    intent: "fallback",
    response: "I can help with complaint status, raising a complaint, FAQs, and dashboard navigation.",
    confidence: 0.4
  };
}

async function resolveChatIntent(payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(`${env.aiServiceUrl}/chat`, {
      method: "POST",
      headers: aiServiceHeaders(),
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Chat intent resolution failed");
    }

    return {
      intent: String(data.intent || "fallback"),
      response: String(data.response || "").trim(),
      confidence: Number(data.confidence || 0)
    };
  } catch (_error) {
    return detectIntentLocally(payload.message, payload.history);
  } finally {
    clearTimeout(timeout);
  }
}

async function transcribeAudio(payload) {
  if (!env.deepgramApiKey) {
    throw new Error("Speech recognition is not configured. Add DEEPGRAM_API_KEY to the server environment.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const audioBase64 = String(payload.audioBase64 || "").trim();
    const mimeType = String(payload.mimeType || "audio/webm").trim();

    if (!audioBase64) {
      throw new Error("Audio data is required for transcription.");
    }

    const audioBuffer = Buffer.from(audioBase64, "base64");
    const query = new URLSearchParams({
      model: env.deepgramModel,
      smart_format: "true",
      punctuate: "true"
    });

    let response;

    try {
      response = await fetch(`https://api.deepgram.com/v1/listen?${query.toString()}`, {
        method: "POST",
        headers: {
          Authorization: `Token ${env.deepgramApiKey}`,
          "Content-Type": mimeType
        },
        body: audioBuffer,
        signal: controller.signal
      });
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new Error("Deepgram transcription timed out. Try a shorter recording or try again.");
      }

      const causeCode = error?.cause?.code || error?.code || "";
      const causeMessage = error?.cause?.message || error?.message || "";

      if (causeCode === "ENOTFOUND") {
        throw new Error("The server could not resolve api.deepgram.com. Check internet or DNS settings.");
      }

      if (causeCode === "ECONNRESET" || causeCode === "UND_ERR_SOCKET") {
        throw new Error("The connection to Deepgram was reset. Check firewall, VPN, or outbound HTTPS filtering.");
      }

      if (causeCode === "ECONNREFUSED") {
        throw new Error("The outbound connection to Deepgram was refused by the network.");
      }

      if (/certificate|tls|ssl/i.test(causeMessage)) {
        throw new Error("TLS/SSL handshake to Deepgram failed. Check system time, certificates, or HTTPS inspection software.");
      }

      throw new Error(
        `Unable to reach Deepgram from the server. ${causeCode || causeMessage || "Unknown network error."}`
      );
    }

    let data = null;
    const rawBody = await response.text();
    try {
      data = rawBody ? JSON.parse(rawBody) : {};
    } catch (_error) {
      data = {};
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        data.err_msg ||
          data.error ||
          data.message ||
          "Deepgram rejected the request. Verify DEEPGRAM_API_KEY."
      );
    }

    if (response.status === 413) {
      throw new Error("The recording is too large for transcription. Try a shorter recording.");
    }

    if (!response.ok) {
      throw new Error(data.err_msg || data.error || `Deepgram transcription failed with status ${response.status}.`);
    }

    const transcript =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
      data?.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.transcript ||
      "";

    const rawTranscript = String(transcript || "").trim();
    const processed = await processTranscriptWithAi({
      transcript: rawTranscript,
      language: data?.results?.channels?.[0]?.detected_language || "unknown",
      filename: payload.filename,
      mimeType
    });

    return {
      transcript: String(processed.normalizedTranscript || processed.summary || rawTranscript).trim(),
      rawTranscript,
      language: data?.results?.channels?.[0]?.detected_language || "unknown",
      provider: "deepgram"
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  analyzeComplaint,
  probeAiService,
  getAiServiceConnectionStatus,
  refreshAiServiceConnectionStatus,
  compareResolutionEvidence,
  transcribeAudio,
  processTranscriptWithAi,
  resolveChatIntent,
  _analyzeComplaintLocally: analyzeComplaintLocally
};
