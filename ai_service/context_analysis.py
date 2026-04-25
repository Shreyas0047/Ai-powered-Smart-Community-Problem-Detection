from collections import Counter

from text_processing import normalize_text


def context_features(payload, semantic_result):
    user_history = payload.get("previousComplaints") or []
    area_history = payload.get("recentAreaComplaints") or []
    category_ids = [item["id"] for item in semantic_result["labels"]]
    location_text = normalize_text(payload.get("location"))

    user_repeat_count = 0
    area_repeat_count = 0

    for complaint in user_history:
        description = normalize_text(complaint.get("description"))
        complaint_type = normalize_text(complaint.get("type"))
        if any(category_id.replace("_", " ") in description or category_id.replace("_", " ") in complaint_type for category_id in category_ids):
            user_repeat_count += 1

    for complaint in area_history:
        complaint_location = normalize_text(complaint.get("location"))
        complaint_type = normalize_text(complaint.get("type"))
        description = normalize_text(complaint.get("description"))
        if location_text and complaint_location and (location_text in complaint_location or complaint_location in location_text):
            area_repeat_count += 1
        elif any(category_id.replace("_", " ") in description or category_id.replace("_", " ") in complaint_type for category_id in category_ids):
            area_repeat_count += 1

    return {
        "user_repeat_count": user_repeat_count,
        "area_repeat_count": area_repeat_count,
        "repeat_count": user_repeat_count + area_repeat_count,
        "top_recent_types": Counter(normalize_text(item.get("type")) for item in area_history if item.get("type")).most_common(3),
    }

