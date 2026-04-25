from ai_config import CONTEXT_REPEAT_HIGH, CONTEXT_REPEAT_MEDIUM, MAX_EXPLANATION_KEYWORDS, VISION_IMAGE_WEIGHT
from category_catalog import COMPLAINT_CATEGORIES
from text_processing import keyword_extract, normalize_text
from vision_analysis import map_visual_labels_to_categories


def predict_priority(text, sentiment_bundle, categories, repeat_count):
    normalized = normalize_text(text)
    top_category = categories[0]["id"] if categories else "general"
    severity = sentiment_bundle["severity_score"]
    score = 0.24

    if severity == "HIGH":
      score += 0.42
    elif severity == "MEDIUM":
      score += 0.22

    if sentiment_bundle["sentiment_label"] == "negative":
        score += 0.18

    if repeat_count >= CONTEXT_REPEAT_HIGH:
        score += 0.24
    elif repeat_count >= CONTEXT_REPEAT_MEDIUM:
        score += 0.12

    if any(keyword in normalized for keyword in ["urgent", "immediately", "danger", "critical", "emergency"]):
        score += 0.2

    if top_category in {"fire_hazard", "electrical"}:
        score += 0.16

    if score >= 0.82:
        return "HIGH", round(score, 3)
    if score >= 0.5:
        return "MEDIUM", round(score, 3)
    return "LOW", round(score, 3)


def merge_multi_modal_categories(text_categories, vision_result):
    merged = {item["id"]: dict(item) for item in text_categories}

    for category_id in map_visual_labels_to_categories(vision_result):
        if category_id in merged:
            merged[category_id]["confidence"] = round(min(1.0, merged[category_id]["confidence"] + VISION_IMAGE_WEIGHT * 0.18), 3)
        else:
            category = next((item for item in COMPLAINT_CATEGORIES if item["id"] == category_id), None)
            if category:
                merged[category_id] = {
                    "id": category["id"],
                    "label": category["label"],
                    "confidence": round(0.42 * VISION_IMAGE_WEIGHT, 3),
                    "matched_keywords": [],
                }

    merged_values = sorted(merged.values(), key=lambda item: item["confidence"], reverse=True)
    return merged_values


def build_explanation(text, final_categories, sentiment_bundle, priority, context_bundle, fallback):
    normalized = normalize_text(text)
    keywords = keyword_extract(text, limit=MAX_EXPLANATION_KEYWORDS)
    reason_parts = []

    if final_categories:
        top_category = final_categories[0]
        matched_keywords = top_category.get("matched_keywords") or []
        if matched_keywords:
            reason_parts.append(f"Contains keyword(s) {', '.join(repr(keyword) for keyword in matched_keywords[:3])}")
        else:
            reason_parts.append(f"Semantically closest to {top_category['label']}")
    elif fallback:
        reason_parts.append(f"Unknown category, closest semantic match is {fallback['suggested_label']}")

    if sentiment_bundle["sentiment_label"] == "negative":
        reason_parts.append("negative sentiment increases urgency")

    if context_bundle["repeat_count"] >= CONTEXT_REPEAT_MEDIUM:
        reason_parts.append(f"{context_bundle['repeat_count']} similar recent complaints increase context severity")

    if keywords:
        reason_parts.append(f"top extracted terms: {', '.join(keywords[:3])}")

    reason_parts.append(f"predicted priority is {priority}")
    return ". ".join(reason_parts) + "."

