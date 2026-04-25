from category_catalog import COMPLAINT_CATEGORIES
from context_analysis import context_features
from reasoning import build_explanation, merge_multi_modal_categories, predict_priority
from text_processing import analyze_sentiment_and_severity, keyword_extract, normalize_text, semantic_multi_label_classification
from vision_analysis import detect_objects_from_features


def clamp01(value):
    return max(0.0, min(1.0, value))


def category_to_team(category_id):
    mapping = {
        "plumbing": "Water Supply and Maintenance Team",
        "electrical": "Electrical Team",
        "road_damage": "Maintenance Team",
        "garbage": "Sanitation Team",
        "waterlogging": "Sanitation and Drainage Team",
        "fire_hazard": "Emergency Response",
        "structural_damage": "Civil Maintenance Team",
    }
    return mapping.get(category_id, "Help Desk")


def category_to_authority(priority, category_id):
    if priority == "HIGH":
        return "Municipality"
    if category_id in {"electrical", "fire_hazard", "road_damage"}:
        return "Municipality"
    return "Gram Panchayat"


def build_alerts(priority, category_label, location):
    if priority == "HIGH":
        return [
            f"High priority alert for {category_label}",
            f"Residents near {location or 'the affected area'} should remain cautious",
        ]
    if priority == "MEDIUM":
        return [f"Maintenance alert created for {category_label}"]
    return [f"Complaint logged for {category_label}"]


def build_status(priority):
    if priority == "HIGH":
        return "Escalated"
    if priority == "MEDIUM":
        return "In Progress"
    return "Queued"


def build_map_location(location):
    base_lat = 12.9716
    base_lng = 77.5946
    seed = sum(ord(char) for char in str(location or "unknown"))
    lat_offset = ((seed % 35) - 17) / 1000
    lng_offset = (((seed // 7) % 35) - 17) / 1000
    return {"lat": round(base_lat + lat_offset, 6), "lng": round(base_lng + lng_offset, 6)}


def run_hybrid_pipeline(payload):
    text = " ".join(
        value
        for value in [
            str(payload.get("textComplaint") or "").strip(),
            str(payload.get("voiceTranscript") or "").strip(),
            str(payload.get("imageHint") or "").strip(),
        ]
        if value
    ).strip()
    normalized_text = normalize_text(text)
    semantic_result = semantic_multi_label_classification(text)
    vision_result = detect_objects_from_features(payload.get("imageFeatures"), payload.get("imageHint"))
    final_categories = merge_multi_modal_categories(semantic_result["labels"], vision_result)
    sentiment_bundle = analyze_sentiment_and_severity(text, final_categories)
    context_bundle = context_features(payload, semantic_result)
    priority, priority_score = predict_priority(text, sentiment_bundle, final_categories, context_bundle["repeat_count"])

    top_category = final_categories[0] if final_categories else None
    fallback = semantic_result["fallback"]
    primary_category_id = top_category["id"] if top_category else (fallback["suggested_category"] if fallback else "general")
    primary_category_label = top_category["label"] if top_category else (fallback["suggested_label"] if fallback else "General")
    confidence = top_category["confidence"] if top_category else (fallback["confidence"] if fallback else 0.28)
    reason = build_explanation(text, final_categories, sentiment_bundle, priority, context_bundle, fallback)

    return {
        "category": primary_category_id,
        "confidence": round(confidence, 3),
        "sentiment": sentiment_bundle["sentiment_label"],
        "sentiment_score": sentiment_bundle["sentiment_score"],
        "severity": sentiment_bundle["severity_score"],
        "priority": {"level": priority, "score": priority_score},
        "priority_score": priority_score,
        "reason": reason,
        "categories": [item["id"] for item in final_categories] if final_categories else ([fallback["suggested_category"]] if fallback else []),
        "category_labels": [item["label"] for item in final_categories] if final_categories else ([fallback["suggested_label"]] if fallback else []),
        "category_confidence": [item["confidence"] for item in final_categories] if final_categories else ([fallback["confidence"]] if fallback else []),
        "keywords": keyword_extract(text, limit=6),
        "vision": vision_result,
        "context": context_bundle,
        "fallback": fallback,
        "unified_text": text or "No complaint text provided.",
        "nlp": {
            "category": primary_category_label,
            "issueType": primary_category_label,
            "team": category_to_team(primary_category_id),
            "confidence": round(confidence, 3),
            "categories": [item["label"] for item in final_categories] if final_categories else ([fallback["suggested_label"]] if fallback else []),
        },
        "cv": {
            "detected": vision_result["top_detection"]["label"] if vision_result["top_detection"] else "No image uploaded",
            "score": vision_result["top_detection"]["confidence"] if vision_result["top_detection"] else 0.18,
            "reason": "Image and text were fused for hybrid inference." if vision_result["detections"] else "No strong visual detection available.",
            "detections": vision_result["detections"],
        },
        "status": build_status(priority),
        "assignedAuthority": category_to_authority(priority, primary_category_id),
        "mapLocation": build_map_location(payload.get("location")),
        "alerts": build_alerts(priority, primary_category_label, payload.get("location")),
        "notifications": [
            "Admin dashboard updated",
            "Users subscribed to the zone were notified" if priority != "HIGH" else "Residents received a high-priority warning",
        ],
        "imageUpload": "Processed by modular hybrid AI pipeline",
    }
