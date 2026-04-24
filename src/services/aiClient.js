const env = require("../config/env");

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
      ["fire", 1.0],
      ["flame", 0.9],
      ["burn", 0.62],
      ["spark", 0.58],
      ["short circuit", 0.98],
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
        features.redHeatRatio * 1.2 +
          features.smokeLikeRatio * 1.05 +
          features.hotspotRatio * 0.9 +
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
        features.edgeDensity * 0.92 +
          features.contrast * 0.72 +
          features.darkRatio * 0.32 +
          (1 - features.averageBrightness) * 0.22 +
          features.neutralRatio * 0.12
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
        features.neutralRatio * 0.34 +
          features.darkRatio * 0.3 +
          features.contrast * 0.18 +
          (1 - features.blueRatio) * 0.18 +
          (1 - features.averageBrightness) * 0.12
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
      ["ceiling", 0.62],
      ["ceiling crack", 0.94],
      ["building crack", 1.0],
      ["plaster", 0.58],
      ["structural", 0.88],
      ["collapse", 0.92],
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
      ["fight", 0.72],
      ["intruder", 0.98],
      ["security", 0.72],
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
    cvLabel: "Utility or public asset fault",
    textTerms: [
      ["streetlight", 1.0],
      ["street light", 1.0],
      ["street light off", 1.05],
      ["electric", 0.72],
      ["wire", 0.46],
      ["live wire", 0.96],
      ["fallen wire", 0.96],
      ["hanging wire", 0.88],
      ["cable", 0.5],
      ["lamp post", 0.78],
      ["pole", 0.36],
      ["transformer", 0.72],
      ["power outage", 0.82],
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
      return clamp01(features.edgeDensity * 0.22 + features.hotspotRatio * 0.24 + features.averageBrightness * 0.12 + (1 - features.greenRatio) * 0.08);
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
      ["overflowing tank", 0.92],
      ["water line", 0.66],
      ["pipeline", 0.58],
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
      ["blocked entrance", 0.92]
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
    if (profile.id === "tree_obstruction" && vegetationStrength > 0.2) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore + 0.14 + vegetationStrength * 0.18)
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

    if (profile.id === "sewage_overflow" && dirtyWaterStrength > 0.22) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore + 0.14 + dirtyWaterStrength * 0.16)
      };
    }

    if (profile.id === "water_drainage" && dirtyWaterStrength > 0.22 && imageFeatures.blueRatio < 0.2) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore - 0.08)
      };
    }

    if (profile.id === "wall_damage" && structuralStrength > 0.24) {
      return {
        ...profile,
        visualScore: clamp01(profile.visualScore + 0.1 + structuralStrength * 0.14)
      };
    }

    if (profile.id === "water_leakage" && waterLeakStrength > 0.18) {
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

    if (profile.id === "vehicle_obstruction" && imageFeatures.neutralRatio > 0.16 && imageFeatures.greenRatio < 0.2) {
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
  const unifiedText = normalizeText([payload.textComplaint, payload.voiceTranscript, payload.imageHint].filter(Boolean).join(" "));
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
  const imageLabel = normalizeText(payload.imageHint);
  const scoredProfiles = scoreVisualProfiles(payload.imageFeatures, imageLabel);
  const top = pickTopProfile(scoredProfiles, "visualScore", 0.16);

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
      detected: top.cvLabel,
      score: Number(top.visualScore.toFixed(2)),
      reason: reasons[top.id] || "Visual signals were matched against issue patterns."
    }
  };
}

function fuseIssueDecision(nlpBundle, cvBundle, payload) {
  const hasImage = Boolean(payload.imageFeatures);
  const textProfiles = new Map((nlpBundle.profiles || []).map((profile) => [profile.id, profile]));
  const visualProfiles = new Map((cvBundle.profiles || []).map((profile) => [profile.id, profile]));
  const unifiedText = nlpBundle.unifiedText || "";
  const imageFeatures = payload.imageFeatures || {};

  const scoredProfiles = ISSUE_PROFILES.map((profile) => {
    const textScore = textProfiles.get(profile.id)?.textScore || 0;
    const visualScore = visualProfiles.get(profile.id)?.visualScore || 0;
    let fusedScore = textScore * (hasImage ? 0.58 : 0.84) + visualScore * (hasImage ? 0.42 : 0.12);

    fusedScore += Math.min(textScore, visualScore) * (hasImage ? 0.18 : 0.04);

    if (profile.id === "safety_fire" && payload.iotTriggered) {
      fusedScore += 0.12;
    }
    if (profile.id === "tree_obstruction" && imageFeatures.greenRatio > 0.22 && hasAnyTerm(unifiedText, ["tree", "branch", "blocked"])) {
      fusedScore += 0.08;
    }
    if (profile.id === "water_leakage" && hasAnyTerm(unifiedText, ["leak", "pipe", "burst", "seepage"])) {
      fusedScore += 0.24;
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
    if (profile.id === "utility_fault" && imageFeatures.greenRatio > 0.26 && !hasAnyTerm(unifiedText, ["wire", "pole", "streetlight", "electric"])) {
      fusedScore -= 0.08;
    }

    return {
      ...profile,
      fusedScore: clamp01(fusedScore)
    };
  }).sort((left, right) => right.fusedScore - left.fusedScore);

  return scoredProfiles[0] && scoredProfiles[0].fusedScore >= 0.22 ? scoredProfiles[0] : createGeneralProfile();
}

function predictPriority(payload, issueProfile, nlp, cv) {
  const combinedText = normalizeText([payload.textComplaint, payload.voiceTranscript, payload.imageHint, payload.location].join(" "));
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
  const alerts = buildAlerts(priority, payload.location, fusedIssue);
  const assignedAuthority = assignAuthority(priority, payload.location, fusedIssue);
  const mapLocation = buildMapLocation(payload.location);
  const mergedText = [payload.textComplaint, payload.voiceTranscript, payload.imageHint].filter(Boolean).join(" ").trim();
  const confidence = clamp01(
    Math.max(nlpBundle.result.confidence || 0, cvBundle.result.score || 0) * 0.72 +
      (nlpBundle.profile.id === cvBundle.profile.id ? 0.18 : 0.08)
  );

  return {
    unifiedText: mergedText || "No complaint text provided.",
    nlp: {
      category: fusedIssue.category,
      issueType: fusedIssue.issueType,
      team: fusedIssue.team,
      confidence: Number((nlpBundle.result.confidence || 0).toFixed(2))
    },
    cv: cvBundle.result,
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
  };
}

async function analyzeComplaint(payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${env.aiServiceUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "AI microservice request failed");
    }

    return data;
  } catch (_error) {
    return analyzeComplaintLocally(payload);
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

    const response = await fetch(`https://api.deepgram.com/v1/listen?${query.toString()}`, {
      method: "POST",
      headers: {
        Authorization: `Token ${env.deepgramApiKey}`,
        "Content-Type": mimeType
      },
      body: audioBuffer,
      signal: controller.signal
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.err_msg || data.error || "Deepgram transcription failed.");
    }

    const transcript =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
      data?.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.transcript ||
      "";

    return {
      transcript: String(transcript || "").trim(),
      language: data?.results?.channels?.[0]?.detected_language || "unknown",
      provider: "deepgram"
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  analyzeComplaint,
  transcribeAudio
};
