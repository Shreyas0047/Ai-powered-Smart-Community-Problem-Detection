import base64
import os
import tempfile

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

try:
    from faster_whisper import WhisperModel
except ImportError:  # pragma: no cover
    WhisperModel = None

TRANSCRIPTION_MODEL = None

ISSUE_PROFILES = [
    {
        "id": "safety_fire",
        "category": "Safety",
        "issueType": "Gas Leak / Fire Risk",
        "team": "Emergency Response",
        "cvLabel": "Potential fire, smoke, or gas hazard",
        "textTerms": [
            ("gas", 0.95),
            ("gas leak", 1.05),
            ("leak", 0.5),
            ("smoke", 0.9),
            ("fire", 1.0),
            ("flame", 0.9),
            ("burn", 0.62),
            ("spark", 0.58),
            ("short circuit", 0.98),
            ("explosion", 1.0),
            ("emergency", 0.8),
        ],
        "locationTerms": [
            ("kitchen", 0.55),
            ("basement", 0.4),
            ("electrical room", 0.7),
            ("transformer", 0.72),
            ("generator", 0.48),
            ("parking", 0.24),
        ],
        "visualTerms": [("fire", 1.0), ("smoke", 0.95), ("burn", 0.72), ("flame", 0.92), ("gas", 0.52)],
        "basePriority": 0.82,
    },
    {
        "id": "road_damage",
        "category": "Infrastructure",
        "issueType": "Road Damage",
        "team": "Maintenance Team",
        "cvLabel": "Road damage, pothole, or crack-like structure",
        "textTerms": [
            ("pothole", 1.0),
            ("road", 0.42),
            ("broken road", 0.95),
            ("road crack", 0.92),
            ("crack", 0.72),
            ("damaged road", 0.9),
            ("sinkhole", 0.98),
            ("surface damage", 0.65),
            ("pavement", 0.38),
            ("manhole", 0.45),
        ],
        "locationTerms": [
            ("road", 0.45),
            ("street", 0.35),
            ("main road", 0.55),
            ("junction", 0.28),
            ("lane", 0.22),
            ("bridge", 0.36),
            ("gate", 0.18),
        ],
        "visualTerms": [("pothole", 1.0), ("crack", 0.74), ("broken", 0.62), ("road", 0.32), ("surface", 0.26), ("damage", 0.44)],
        "basePriority": 0.58,
    },
    {
        "id": "tree_obstruction",
        "category": "Infrastructure",
        "issueType": "Tree / Obstruction on Road",
        "team": "Horticulture and Maintenance Team",
        "cvLabel": "Tree, branch, or vegetation obstruction on the roadway",
        "textTerms": [
            ("tree", 1.0),
            ("fallen tree", 1.08),
            ("tree fallen", 1.02),
            ("tree on road", 1.05),
            ("branch", 0.84),
            ("log", 0.55),
            ("fallen", 0.58),
            ("uprooted", 0.88),
            ("road blocked", 1.0),
            ("blocked road", 0.96),
            ("blocked by tree", 1.04),
            ("roadblock", 0.7),
            ("obstruction", 0.86),
            ("fallen branch", 0.98),
            ("plant", 0.34),
            ("vegetation", 0.6),
        ],
        "locationTerms": [("road", 0.5), ("street", 0.34), ("main road", 0.42), ("junction", 0.22), ("lane", 0.16), ("avenue", 0.18)],
        "visualTerms": [("tree", 1.0), ("branch", 0.86), ("fallen", 0.62), ("vegetation", 0.58), ("leaves", 0.52), ("obstruction", 0.68)],
        "basePriority": 0.64,
    },
    {
        "id": "garbage",
        "category": "Sanitation",
        "issueType": "Garbage Overflow",
        "team": "Sanitation Team",
        "cvLabel": "Garbage, waste, or clutter accumulation",
        "textTerms": [
            ("garbage", 1.0),
            ("waste", 0.72),
            ("trash", 0.8),
            ("dustbin", 0.7),
            ("overflow", 0.55),
            ("litter", 0.65),
            ("dump", 0.82),
            ("unclean", 0.44),
            ("sanitation", 0.74),
        ],
        "locationTerms": [("market", 0.32), ("street", 0.2), ("colony", 0.18), ("dump yard", 0.52), ("lane", 0.14)],
        "visualTerms": [("garbage", 1.0), ("waste", 0.78), ("trash", 0.8), ("dump", 0.75), ("overflow", 0.48)],
        "basePriority": 0.46,
    },
    {
        "id": "sewage_overflow",
        "category": "Sanitation",
        "issueType": "Sewage / Manhole Overflow",
        "team": "Sanitation and Drainage Team",
        "cvLabel": "Sewage spill, dirty drain overflow, or open manhole hazard",
        "textTerms": [
            ("sewage", 1.0),
            ("manhole", 0.95),
            ("open manhole", 1.05),
            ("drain overflow", 0.92),
            ("dirty water", 0.74),
            ("waste water", 0.78),
            ("foul smell", 0.82),
            ("sludge", 0.72),
            ("gutter", 0.76),
            ("sewer", 0.84),
            ("drain blocked", 0.68),
        ],
        "locationTerms": [("drain", 0.42), ("sewer", 0.5), ("basement", 0.22), ("lane", 0.14), ("road", 0.14)],
        "visualTerms": [("sewage", 1.0), ("manhole", 0.9), ("dirty water", 0.72), ("drain", 0.62), ("overflow", 0.46), ("sludge", 0.72)],
        "basePriority": 0.61,
    },
    {
        "id": "water_drainage",
        "category": "Infrastructure",
        "issueType": "Drainage / Waterlogging",
        "team": "Maintenance Team",
        "cvLabel": "Waterlogging, drainage overflow, or wet surface pattern",
        "textTerms": [
            ("water", 0.4),
            ("water clogging", 1.0),
            ("water logging", 1.0),
            ("waterlogged", 0.96),
            ("drainage", 0.92),
            ("drain", 0.66),
            ("clogged drain", 0.88),
            ("overflow", 0.5),
            ("flood", 0.82),
            ("stagnant", 0.68),
            ("stagnant water", 0.82),
            ("water stagnation", 0.84),
            ("leakage", 0.44),
        ],
        "locationTerms": [("drain", 0.44), ("street", 0.18), ("road", 0.16), ("basement", 0.24), ("colony", 0.14)],
        "visualTerms": [("water", 0.84), ("drain", 0.66), ("overflow", 0.48), ("flood", 0.78), ("wet", 0.46)],
        "basePriority": 0.52,
    },
    {
        "id": "wall_damage",
        "category": "Infrastructure",
        "issueType": "Wall / Building Damage",
        "team": "Civil Maintenance Team",
        "cvLabel": "Cracked wall, ceiling damage, or structural surface defect",
        "textTerms": [
            ("wall crack", 1.0),
            ("ceiling", 0.62),
            ("ceiling crack", 0.94),
            ("building crack", 1.0),
            ("plaster", 0.58),
            ("structural", 0.88),
            ("collapse", 0.92),
            ("damaged wall", 0.86),
            ("seepage", 0.72),
            ("leak stain", 0.58),
        ],
        "locationTerms": [("building", 0.3), ("block", 0.22), ("tower", 0.22), ("staircase", 0.18), ("corridor", 0.14), ("ceiling", 0.2)],
        "visualTerms": [("crack", 0.92), ("wall", 0.56), ("ceiling", 0.58), ("damage", 0.5), ("plaster", 0.46), ("structural", 0.74)],
        "basePriority": 0.57,
    },
    {
        "id": "security",
        "category": "Security",
        "issueType": "Security Concern",
        "team": "Security Team",
        "cvLabel": "Suspicious or security-related visual anomaly",
        "textTerms": [
            ("theft", 0.96),
            ("suspicious", 0.92),
            ("fight", 0.72),
            ("intruder", 0.98),
            ("security", 0.72),
            ("unsafe", 0.4),
            ("trespass", 0.82),
        ],
        "locationTerms": [("gate", 0.3), ("parking", 0.18), ("entrance", 0.22), ("security cabin", 0.5)],
        "visualTerms": [("suspicious", 0.7), ("security", 0.66)],
        "basePriority": 0.62,
    },
    {
        "id": "utility_fault",
        "category": "Infrastructure",
        "issueType": "Utility Fault",
        "team": "Electrical Team",
        "cvLabel": "Utility or public asset fault",
        "textTerms": [
            ("streetlight", 1.0),
            ("street light", 1.0),
            ("street light off", 1.05),
            ("electric", 0.72),
            ("wire", 0.46),
            ("live wire", 0.96),
            ("fallen wire", 0.96),
            ("hanging wire", 0.88),
            ("cable", 0.5),
            ("lamp post", 0.78),
            ("pole", 0.36),
            ("transformer", 0.72),
            ("power outage", 0.82),
            ("meter box", 0.7),
            ("power", 0.44),
            ("flicker", 0.38),
        ],
        "locationTerms": [("street", 0.18), ("road", 0.14), ("pole", 0.32), ("junction", 0.18)],
        "visualTerms": [("light", 0.36), ("pole", 0.28), ("wire", 0.36), ("electric", 0.44)],
        "basePriority": 0.48,
    },
    {
        "id": "water_leakage",
        "category": "Infrastructure",
        "issueType": "Water Leakage / Pipe Burst",
        "team": "Water Supply and Maintenance Team",
        "cvLabel": "Leakage, pipe burst, or continuous water seepage pattern",
        "textTerms": [
            ("water leak", 1.0),
            ("pipe leak", 1.0),
            ("pipe burst", 1.06),
            ("burst pipe", 1.06),
            ("leaking pipe", 0.96),
            ("water leakage", 1.02),
            ("tap leak", 0.84),
            ("overflowing tank", 0.92),
            ("water line", 0.66),
            ("pipeline", 0.58),
            ("seepage", 0.74),
            ("leakage", 0.52),
        ],
        "locationTerms": [
            ("pipe", 0.42),
            ("tank", 0.34),
            ("overhead tank", 0.56),
            ("corridor", 0.16),
            ("wash area", 0.22),
            ("basement", 0.18),
        ],
        "visualTerms": [("leak", 0.8), ("water", 0.72), ("pipe", 0.66), ("seepage", 0.74), ("wet", 0.5)],
        "basePriority": 0.54,
    },
    {
        "id": "animal_intrusion",
        "category": "Public Health",
        "issueType": "Stray Animal / Animal Menace",
        "team": "Animal Control and Sanitation Team",
        "cvLabel": "Animal intrusion or stray animal obstruction",
        "textTerms": [
            ("stray dog", 1.04),
            ("stray dogs", 1.04),
            ("stray animal", 1.0),
            ("dog", 0.5),
            ("dogs", 0.5),
            ("cow", 0.82),
            ("cattle", 0.82),
            ("bull", 0.84),
            ("monkey", 0.78),
            ("pig", 0.7),
            ("animal on road", 1.02),
            ("animal menace", 0.92),
            ("dead animal", 1.0),
        ],
        "locationTerms": [("road", 0.16), ("street", 0.14), ("market", 0.16), ("play area", 0.24), ("park", 0.22), ("gate", 0.12)],
        "visualTerms": [("animal", 0.86), ("dog", 0.8), ("cow", 0.82), ("cattle", 0.82)],
        "basePriority": 0.5,
    },
    {
        "id": "vehicle_obstruction",
        "category": "Traffic",
        "issueType": "Vehicle Obstruction / Illegal Parking",
        "team": "Traffic and Enforcement Team",
        "cvLabel": "Vehicle obstruction, illegal parking, or blocked access",
        "textTerms": [
            ("illegal parking", 1.06),
            ("wrong parking", 1.0),
            ("vehicle blocking", 1.02),
            ("blocked driveway", 1.04),
            ("abandoned vehicle", 1.02),
            ("car parked", 0.74),
            ("truck blocking", 0.96),
            ("bike blocking", 0.92),
            ("double parked", 0.96),
            ("vehicle obstruction", 1.0),
            ("blocked entrance", 0.92),
        ],
        "locationTerms": [("gate", 0.3), ("entrance", 0.3), ("road", 0.2), ("street", 0.18), ("driveway", 0.42), ("parking", 0.3), ("junction", 0.18)],
        "visualTerms": [("vehicle", 0.78), ("car", 0.72), ("bike", 0.68), ("truck", 0.76), ("parking", 0.52)],
        "basePriority": 0.56,
    },
]


def normalize_text(value):
    return str(value or "").strip().lower()


def clamp01(value):
    return max(0.0, min(1.0, value))


def get_transcription_model():
    global TRANSCRIPTION_MODEL

    if WhisperModel is None:
        raise RuntimeError("Audio transcription is unavailable because faster-whisper is not installed.")

    if TRANSCRIPTION_MODEL is None:
        model_size = os.getenv("WHISPER_MODEL_SIZE", "base")
        compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
        TRANSCRIPTION_MODEL = WhisperModel(model_size, device="cpu", compute_type=compute_type)

    return TRANSCRIPTION_MODEL


def has_any_term(text, terms):
    return any(term in text for term in terms)


def create_general_profile():
    return {
        "id": "general",
        "category": "General",
        "issueType": "Civic Complaint",
        "team": "Help Desk",
        "cvLabel": "General civic visual anomaly",
        "textScore": 0.0,
        "visualScore": 0.0,
    }


def keyword_score(text, weighted_terms):
    return clamp01(sum(weight for term, weight in weighted_terms if term in text))


def image_signal(profile_id, features):
    if profile_id == "safety_fire":
        return clamp01(features.get("redHeatRatio", 0) * 1.2 + features.get("smokeLikeRatio", 0) * 1.05 + features.get("hotspotRatio", 0) * 0.9 + features.get("darkRatio", 0) * 0.12 + features.get("neutralRatio", 0) * 0.08)
    if profile_id == "road_damage":
        return clamp01(features.get("edgeDensity", 0) * 0.92 + features.get("contrast", 0) * 0.72 + features.get("darkRatio", 0) * 0.32 + (1 - features.get("averageBrightness", 0)) * 0.22 + features.get("neutralRatio", 0) * 0.12)
    if profile_id == "tree_obstruction":
        return clamp01(features.get("greenRatio", 0) * 1.24 + features.get("averageSaturation", 0) * 0.18 + features.get("edgeDensity", 0) * 0.2 + features.get("contrast", 0) * 0.16 + (1 - features.get("blueRatio", 0)) * 0.08)
    if profile_id == "garbage":
        return clamp01(features.get("edgeDensity", 0) * 0.34 + features.get("averageSaturation", 0) * 0.22 + features.get("contrast", 0) * 0.24 + features.get("darkRatio", 0) * 0.14 + features.get("neutralRatio", 0) * 0.12 + (1 - features.get("blueRatio", 0)) * 0.08)
    if profile_id == "sewage_overflow":
        return clamp01(features.get("neutralRatio", 0) * 0.34 + features.get("darkRatio", 0) * 0.3 + features.get("contrast", 0) * 0.18 + (1 - features.get("blueRatio", 0)) * 0.18 + (1 - features.get("averageBrightness", 0)) * 0.12)
    if profile_id == "water_drainage":
        return clamp01(features.get("blueRatio", 0) * 0.92 + features.get("neutralRatio", 0) * 0.42 + (1 - features.get("averageSaturation", 0)) * 0.22 + features.get("averageBrightness", 0) * 0.1)
    if profile_id == "wall_damage":
        return clamp01(features.get("edgeDensity", 0) * 0.4 + features.get("contrast", 0) * 0.26 + features.get("neutralRatio", 0) * 0.28 + features.get("darkRatio", 0) * 0.14 + (1 - features.get("averageSaturation", 0)) * 0.12)
    if profile_id == "security":
        return clamp01(features.get("darkRatio", 0) * 0.26 + features.get("edgeDensity", 0) * 0.22 + features.get("contrast", 0) * 0.18 + (1 - features.get("averageBrightness", 0)) * 0.12)
    if profile_id == "utility_fault":
        return clamp01(features.get("edgeDensity", 0) * 0.22 + features.get("hotspotRatio", 0) * 0.24 + features.get("averageBrightness", 0) * 0.12 + (1 - features.get("greenRatio", 0)) * 0.08)
    if profile_id == "water_leakage":
        return clamp01(features.get("blueRatio", 0) * 0.42 + features.get("neutralRatio", 0) * 0.26 + features.get("averageBrightness", 0) * 0.14 + features.get("edgeDensity", 0) * 0.12 + features.get("contrast", 0) * 0.08)
    if profile_id == "animal_intrusion":
        return clamp01(features.get("contrast", 0) * 0.16 + features.get("edgeDensity", 0) * 0.18 + features.get("darkRatio", 0) * 0.08 + features.get("greenRatio", 0) * 0.08)
    if profile_id == "vehicle_obstruction":
        return clamp01(features.get("edgeDensity", 0) * 0.2 + features.get("contrast", 0) * 0.18 + features.get("darkRatio", 0) * 0.12 + features.get("neutralRatio", 0) * 0.1 + (1 - features.get("greenRatio", 0)) * 0.08)
    return 0.0


def score_text_profiles(unified_text, location_text):
    scored = []
    for profile in ISSUE_PROFILES:
        text_score = keyword_score(unified_text, profile["textTerms"])
        location_score = keyword_score(location_text, profile["locationTerms"])
        copy = dict(profile)
        copy["textScore"] = clamp01(text_score + location_score * 0.55)
        scored.append(copy)
    return scored


def score_visual_profiles(image_features, image_label):
    scored = []
    for profile in ISSUE_PROFILES:
        copy = dict(profile)
        if not image_features:
            copy["visualScore"] = 0.0
        else:
            image_score = image_signal(profile["id"], image_features)
            label_score = keyword_score(image_label, profile["visualTerms"])
            copy["visualScore"] = clamp01(image_score + label_score * 0.45)
        scored.append(copy)

    vegetation_strength = clamp01(
        image_features.get("greenRatio", 0) * 1.2
        + image_features.get("averageSaturation", 0) * 0.24
        + image_features.get("edgeDensity", 0) * 0.16
        - image_features.get("blueRatio", 0) * 0.08
    ) if image_features else 0.0
    dirty_water_strength = clamp01(
        image_features.get("neutralRatio", 0) * 0.6
        + image_features.get("darkRatio", 0) * 0.44
        + (1 - image_features.get("blueRatio", 0)) * 0.24
        + (1 - image_features.get("averageBrightness", 0)) * 0.18
    ) if image_features else 0.0
    water_leak_strength = clamp01(
        image_features.get("blueRatio", 0) * 0.44
        + image_features.get("neutralRatio", 0) * 0.28
        + image_features.get("averageBrightness", 0) * 0.14
        + image_features.get("edgeDensity", 0) * 0.12
    ) if image_features else 0.0
    structural_strength = clamp01(
        image_features.get("edgeDensity", 0) * 0.42
        + image_features.get("neutralRatio", 0) * 0.34
        + image_features.get("contrast", 0) * 0.26
        + (1 - image_features.get("averageSaturation", 0)) * 0.18
    ) if image_features else 0.0

    adjusted = []
    for profile in scored:
        copy = dict(profile)
        if copy["id"] == "tree_obstruction" and vegetation_strength > 0.2:
            copy["visualScore"] = clamp01(copy.get("visualScore", 0) + 0.14 + vegetation_strength * 0.18)
        elif copy["id"] == "garbage" and vegetation_strength > 0.2:
            copy["visualScore"] = clamp01(copy.get("visualScore", 0) - (0.12 + vegetation_strength * 0.18))
        elif copy["id"] == "road_damage" and image_features and image_features.get("greenRatio", 0) > 0.2:
            copy["visualScore"] = clamp01(copy.get("visualScore", 0) - 0.08)
        elif copy["id"] == "sewage_overflow" and dirty_water_strength > 0.22:
            copy["visualScore"] = clamp01(copy.get("visualScore", 0) + 0.14 + dirty_water_strength * 0.16)
        elif copy["id"] == "water_drainage" and dirty_water_strength > 0.22 and image_features and image_features.get("blueRatio", 0) < 0.2:
            copy["visualScore"] = clamp01(copy.get("visualScore", 0) - 0.08)
        elif copy["id"] == "wall_damage" and structural_strength > 0.24:
            copy["visualScore"] = clamp01(copy.get("visualScore", 0) + 0.1 + structural_strength * 0.14)
        elif copy["id"] == "water_leakage" and water_leak_strength > 0.18:
            copy["visualScore"] = clamp01(copy.get("visualScore", 0) + 0.12 + water_leak_strength * 0.14)
        elif copy["id"] == "garbage" and structural_strength > 0.26 and image_features and image_features.get("greenRatio", 0) < 0.18:
            copy["visualScore"] = clamp01(copy.get("visualScore", 0) - 0.06)
        elif copy["id"] == "utility_fault" and image_features and image_features.get("greenRatio", 0) > 0.24:
            copy["visualScore"] = clamp01(copy.get("visualScore", 0) - 0.06)
        elif copy["id"] == "vehicle_obstruction" and image_features and image_features.get("neutralRatio", 0) > 0.16 and image_features.get("greenRatio", 0) < 0.2:
            copy["visualScore"] = clamp01(copy.get("visualScore", 0) + 0.06)
        adjusted.append(copy)

    return adjusted


def pick_top_profile(scored_profiles, key, threshold=0.18):
    top = sorted(scored_profiles, key=lambda profile: profile[key], reverse=True)[0]
    if not top or top[key] < threshold:
        return create_general_profile()
    return top


def build_nlp_result(payload):
    unified_text = normalize_text(" ".join([value for value in [payload.get("textComplaint"), payload.get("voiceTranscript"), payload.get("imageHint")] if value]))
    location_text = normalize_text(payload.get("location"))
    scored_profiles = score_text_profiles(unified_text, location_text)
    top = pick_top_profile(scored_profiles, "textScore")
    return {
        "profile": top,
        "profiles": scored_profiles,
        "unified_text": unified_text,
        "result": {
            "category": top["category"],
            "issueType": top["issueType"],
            "team": top["team"],
            "confidence": round(top.get("textScore", 0), 2),
        },
    }


def build_cv_result(payload):
    image_features = payload.get("imageFeatures")
    image_label = normalize_text(payload.get("imageHint"))
    scored_profiles = score_visual_profiles(image_features, image_label)
    top = pick_top_profile(scored_profiles, "visualScore", 0.16)

    if not image_features:
        return {
            "profile": top,
            "profiles": scored_profiles,
            "result": {
                "detected": "No image uploaded",
                "score": 0.18,
                "reason": "No visual features were provided.",
            },
        }

    reasons = {
        "safety_fire": f"Heat {image_features.get('redHeatRatio', 0)}, smoke {image_features.get('smokeLikeRatio', 0)}, hotspot {image_features.get('hotspotRatio', 0)}",
        "road_damage": f"Edge density {image_features.get('edgeDensity', 0)}, contrast {image_features.get('contrast', 0)}, dark regions {image_features.get('darkRatio', 0)}",
        "tree_obstruction": f"Green ratio {image_features.get('greenRatio', 0)}, edge density {image_features.get('edgeDensity', 0)}, contrast {image_features.get('contrast', 0)}",
        "garbage": f"Texture {image_features.get('edgeDensity', 0)}, saturation {image_features.get('averageSaturation', 0)}, contrast {image_features.get('contrast', 0)}",
        "sewage_overflow": f"Neutral regions {image_features.get('neutralRatio', 0)}, dark regions {image_features.get('darkRatio', 0)}, blue ratio {image_features.get('blueRatio', 0)}",
        "water_drainage": f"Blue ratio {image_features.get('blueRatio', 0)}, neutral regions {image_features.get('neutralRatio', 0)}, saturation {image_features.get('averageSaturation', 0)}",
        "water_leakage": f"Blue ratio {image_features.get('blueRatio', 0)}, neutral regions {image_features.get('neutralRatio', 0)}, brightness {image_features.get('averageBrightness', 0)}",
        "wall_damage": f"Edge density {image_features.get('edgeDensity', 0)}, contrast {image_features.get('contrast', 0)}, neutral surface {image_features.get('neutralRatio', 0)}",
        "security": f"Darkness {image_features.get('darkRatio', 0)}, texture {image_features.get('edgeDensity', 0)}, contrast {image_features.get('contrast', 0)}",
        "utility_fault": f"Hotspot {image_features.get('hotspotRatio', 0)}, edge density {image_features.get('edgeDensity', 0)}, brightness {image_features.get('averageBrightness', 0)}",
        "animal_intrusion": f"Texture {image_features.get('edgeDensity', 0)}, contrast {image_features.get('contrast', 0)}, green ratio {image_features.get('greenRatio', 0)}",
        "vehicle_obstruction": f"Texture {image_features.get('edgeDensity', 0)}, contrast {image_features.get('contrast', 0)}, neutral surface {image_features.get('neutralRatio', 0)}",
    }

    return {
        "profile": top,
        "profiles": scored_profiles,
        "result": {
            "detected": top["cvLabel"],
            "score": round(top.get("visualScore", 0), 2),
            "reason": reasons.get(top["id"], "Visual signals were matched against issue patterns."),
        },
    }


def fuse_issue_decision(nlp_bundle, cv_bundle, payload):
    has_image = bool(payload.get("imageFeatures"))
    text_profiles = {profile["id"]: profile for profile in nlp_bundle.get("profiles", [])}
    visual_profiles = {profile["id"]: profile for profile in cv_bundle.get("profiles", [])}
    unified_text = nlp_bundle.get("unified_text", "")
    image_features = payload.get("imageFeatures") or {}

    scored_profiles = []
    for profile in ISSUE_PROFILES:
        text_score = text_profiles.get(profile["id"], {}).get("textScore", 0)
        visual_score = visual_profiles.get(profile["id"], {}).get("visualScore", 0)
        fused_score = text_score * (0.58 if has_image else 0.84) + visual_score * (0.42 if has_image else 0.12)
        fused_score += min(text_score, visual_score) * (0.18 if has_image else 0.04)

        if profile["id"] == "safety_fire" and payload.get("iotTriggered"):
            fused_score += 0.12
        if profile["id"] == "tree_obstruction" and image_features.get("greenRatio", 0) > 0.22 and has_any_term(unified_text, ["tree", "branch", "blocked"]):
            fused_score += 0.08
        if profile["id"] == "water_leakage" and has_any_term(unified_text, ["leak", "pipe", "burst", "seepage"]):
            fused_score += 0.24
        if profile["id"] == "animal_intrusion" and has_any_term(unified_text, ["dog", "animal", "cow", "cattle", "monkey"]):
            fused_score += 0.08
        if profile["id"] == "vehicle_obstruction" and has_any_term(unified_text, ["vehicle", "parking", "car", "truck", "bike", "driveway"]):
            fused_score += 0.08
        if profile["id"] == "garbage" and (has_any_term(unified_text, ["tree", "branch", "sewage", "manhole", "wire", "streetlight", "animal"]) or image_features.get("greenRatio", 0) > 0.24):
            fused_score -= 0.16
        if profile["id"] == "road_damage" and has_any_term(unified_text, ["streetlight", "wire", "pole", "parking", "vehicle"]):
            fused_score -= 0.18
        if profile["id"] == "water_drainage" and has_any_term(unified_text, ["pipe", "burst", "seepage", "tank", "leakage"]):
            fused_score -= 0.22
        if profile["id"] == "utility_fault" and image_features.get("greenRatio", 0) > 0.26 and not has_any_term(unified_text, ["wire", "pole", "streetlight", "electric"]):
            fused_score -= 0.08

        copy = dict(profile)
        copy["fusedScore"] = clamp01(fused_score)
        scored_profiles.append(copy)

    top = sorted(scored_profiles, key=lambda profile: profile["fusedScore"], reverse=True)[0]
    return top if top["fusedScore"] >= 0.22 else create_general_profile()


def predict_priority(payload, issue_profile, nlp_result, cv_result):
    combined_text = normalize_text(" ".join([str(value or "") for value in [payload.get("textComplaint"), payload.get("voiceTranscript"), payload.get("imageHint"), payload.get("location")]]))
    score = issue_profile.get("basePriority", 0.45)

    if any(word in combined_text for word in ["urgent", "immediately", "danger", "emergency", "injury", "critical"]):
        score += 0.18
    if any(word in combined_text for word in ["school", "hospital", "main road", "market", "junction", "community kitchen"]):
        score += 0.08
    if bool(payload.get("iotTriggered")):
        score += 0.14

    score += nlp_result.get("confidence", 0) * 0.12
    score += cv_result.get("score", 0) * 0.16

    image_features = payload.get("imageFeatures") or {}
    if issue_profile["id"] == "road_damage" and image_features.get("contrast", 0) > 0.2:
        score += 0.04
    if issue_profile["id"] == "tree_obstruction" and image_features.get("greenRatio", 0) > 0.18:
        score += 0.06
    if issue_profile["id"] == "water_drainage" and image_features.get("blueRatio", 0) > 0.16:
        score += 0.04
    if issue_profile["id"] == "sewage_overflow" and image_features.get("neutralRatio", 0) > 0.2:
        score += 0.05
    if issue_profile["id"] == "wall_damage" and image_features.get("contrast", 0) > 0.18:
        score += 0.04
    if issue_profile["id"] == "garbage" and image_features.get("contrast", 0) > 0.16:
        score += 0.03
    if issue_profile["id"] == "water_leakage" and image_features.get("averageBrightness", 0) > 0.14:
        score += 0.04
    if issue_profile["id"] == "vehicle_obstruction" and has_any_term(combined_text, ["gate", "entrance", "driveway", "ambulance"]):
        score += 0.05
    if issue_profile["id"] == "animal_intrusion" and has_any_term(combined_text, ["school", "park", "play area", "child"]):
        score += 0.06

    if issue_profile["id"] in ["safety_fire", "utility_fault"]:
        score += 0.08
    if nlp_result["category"] == issue_profile["category"] and cv_result["detected"] != "No image uploaded":
        score += 0.06

    score = clamp01(score)

    if score >= 0.9:
        level = "Critical"
    elif score >= 0.74:
        level = "High"
    elif score >= 0.54:
        level = "Medium"
    else:
        level = "Low"

    return {"level": level, "score": round(score, 2)}


def build_alerts(priority, location, issue_profile):
    if priority["level"] == "Critical":
        return [
            f"Emergency alert raised for {issue_profile['issueType']}",
            f"Residents near {location or 'the affected zone'} warned instantly",
        ]
    if priority["level"] == "High":
        return [
            f"High-priority admin alert created for {issue_profile['issueType']}",
            f"Nearby users notified for {location or 'the selected zone'}",
        ]
    return [f"Complaint logged for {issue_profile['team']}"]


def assign_authority(priority, location, issue_profile):
    location_text = normalize_text(location)
    municipality_keywords = ["main road", "market", "downtown", "city", "ward", "bus stand", "station", "junction", "school", "hospital"]

    if priority["level"] in ["Critical", "High"]:
        return "Municipality"
    if issue_profile["id"] in ["safety_fire", "utility_fault", "vehicle_obstruction"] or any(keyword in location_text for keyword in municipality_keywords):
        return "Municipality"
    return "Gram Panchayat"


def build_map_location(location):
    base_lat = 12.9716
    base_lng = 77.5946
    seed = sum(ord(char) for char in str(location or "unknown"))
    lat_offset = ((seed % 35) - 17) / 1000
    lng_offset = (((seed // 7) % 35) - 17) / 1000
    return {"lat": round(base_lat + lat_offset, 6), "lng": round(base_lng + lng_offset, 6)}


def analyze_payload(payload):
    nlp_bundle = build_nlp_result(payload)
    cv_bundle = build_cv_result(payload)
    fused_issue = fuse_issue_decision(nlp_bundle, cv_bundle, payload)
    priority = predict_priority(payload, fused_issue, nlp_bundle["result"], cv_bundle["result"])
    alerts = build_alerts(priority, payload.get("location"), fused_issue)
    assigned_authority = assign_authority(priority, payload.get("location"), fused_issue)
    map_location = build_map_location(payload.get("location"))
    confidence = clamp01(max(nlp_bundle["result"].get("confidence", 0), cv_bundle["result"].get("score", 0)) * 0.72 + (0.18 if nlp_bundle["profile"]["id"] == cv_bundle["profile"]["id"] else 0.08))

    merged_text = " ".join([value for value in [payload.get("textComplaint"), payload.get("voiceTranscript"), payload.get("imageHint")] if value]).strip()

    return {
        "unifiedText": merged_text or "No complaint text provided.",
        "nlp": {
            "category": fused_issue["category"],
            "issueType": fused_issue["issueType"],
            "team": fused_issue["team"],
            "confidence": round(nlp_bundle["result"].get("confidence", 0), 2),
        },
        "cv": cv_bundle["result"],
        "priority": priority,
        "confidence": round(confidence, 2),
        "status": "Escalated" if priority["level"] == "Critical" else ("In Progress" if priority["level"] == "High" else "Queued"),
        "assignedAuthority": assigned_authority,
        "mapLocation": map_location,
        "alerts": alerts,
        "notifications": [
            "Admin dashboard updated",
            "Residents received safety warning" if priority["level"] == "Critical" else "Users subscribed to the zone were notified",
        ],
        "imageUpload": "Processed by Flask multimodal AI microservice",
    }


def decode_audio_payload(audio_base64):
    if not audio_base64:
        raise ValueError("Audio payload is empty.")

    encoded = audio_base64.split(",", 1)[1] if "," in audio_base64 else audio_base64
    return base64.b64decode(encoded)


def transcribe_audio_payload(payload):
    audio_base64 = payload.get("audioBase64")
    filename = str(payload.get("filename") or "complaint-audio").strip()
    audio_bytes = decode_audio_payload(audio_base64)
    suffix = os.path.splitext(filename)[1] or ".webm"
    model = get_transcription_model()

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
        temp_audio.write(audio_bytes)
        temp_path = temp_audio.name

    try:
        segments, info = model.transcribe(temp_path, beam_size=5, vad_filter=True)
        transcript = " ".join(segment.text.strip() for segment in segments).strip()
        return {
            "transcript": transcript,
            "language": getattr(info, "language", "unknown"),
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/analyze")
def analyze():
    payload = request.get_json(silent=True) or {}
    return jsonify(analyze_payload(payload))


@app.post("/transcribe")
def transcribe():
    payload = request.get_json(silent=True) or {}

    try:
        result = transcribe_audio_payload(payload)
        return jsonify(result)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except RuntimeError as error:
        return jsonify({"error": str(error)}), 503
    except Exception:
        return jsonify({"error": "Audio transcription failed inside the AI service."}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
