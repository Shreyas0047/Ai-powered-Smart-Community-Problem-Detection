from text_processing import normalize_text


def clamp01(value):
    return max(0.0, min(1.0, value))


def detect_objects_from_features(image_features, image_hint):
    features = image_features or {}
    normalized_hint = normalize_text(image_hint)
    detections = []

    crack_score = clamp01(features.get("edgeDensity", 0) * 0.9 + features.get("contrast", 0) * 0.7 + features.get("neutralRatio", 0) * 0.22)
    garbage_score = clamp01(features.get("greenRatio", 0) * 0.18 + features.get("edgeDensity", 0) * 0.38 + features.get("contrast", 0) * 0.28 + features.get("averageSaturation", 0) * 0.24)
    water_score = clamp01(features.get("blueRatio", 0) * 0.92 + features.get("neutralRatio", 0) * 0.36 + features.get("averageBrightness", 0) * 0.14)

    if crack_score >= 0.38 or "crack" in normalized_hint:
        detections.append({"label": "crack", "confidence": round(max(crack_score, 0.42), 3)})
    if garbage_score >= 0.4 or "garbage" in normalized_hint or "waste" in normalized_hint:
        detections.append({"label": "garbage", "confidence": round(max(garbage_score, 0.44), 3)})
    if water_score >= 0.36 or "leak" in normalized_hint or "water" in normalized_hint:
        detections.append({"label": "water leakage", "confidence": round(max(water_score, 0.4), 3)})

    return {
        "detections": detections,
        "top_detection": detections[0] if detections else None,
    }


def map_visual_labels_to_categories(vision_result):
    category_map = {
        "crack": "structural_damage",
        "garbage": "garbage",
        "water leakage": "plumbing",
    }

    return [category_map[detection["label"]] for detection in vision_result["detections"] if detection["label"] in category_map]

