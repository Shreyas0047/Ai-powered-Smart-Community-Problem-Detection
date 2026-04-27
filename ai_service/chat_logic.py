from category_catalog import FAQ_HINTS, FAQ_TOPICS
from text_processing import normalize_text


def find_faq_response(normalized):
    for topic in FAQ_TOPICS:
        if any(pattern in normalized for pattern in topic["patterns"]):
            return topic["response"]

    for key, answer in FAQ_HINTS.items():
        if key in normalized:
            return answer

    return ""


def classify_chat_intent(message, history):
    normalized = normalize_text(message)
    recent_text = normalize_text(" ".join(item.get("content", "") for item in history[-6:])) if isinstance(history, list) else ""

    if any(normalized.startswith(greeting) for greeting in ["hi", "hello", "hey", "good morning", "good evening"]):
        return {
            "intent": "greeting",
            "response": "Hello. I can help you check complaint status, raise a complaint, answer common questions, and guide you through the dashboard.",
            "confidence": 0.96,
        }

    if ("complaint" in normalized or "report" in normalized) and any(term in normalized for term in ["status", "update", "track", "progress"]):
        return {
            "intent": "complaint_status",
            "response": "Checking your latest complaint status now.",
            "confidence": 0.92,
        }

    if any(term in normalized for term in ["raise complaint", "report complaint", "submit complaint", "file complaint", "report issue", "raise issue"]):
        return {
            "intent": "raise_complaint",
            "response": "Share the complaint details, and I will help create it here in chat.",
            "confidence": 0.9,
        }

    faq_response = find_faq_response(normalized)
    if faq_response:
        return {"intent": "faq", "response": faq_response, "confidence": 0.78}

    if any(term in normalized for term in ["complaint", "issue", "problem", "garbage", "water", "road", "fire", "wire", "leak"]) or "raise_complaint" in recent_text:
        return {
            "intent": "raise_complaint",
            "response": "Share the complaint details, and I will help create it here in chat.",
            "confidence": 0.78,
        }

    return {
        "intent": "fallback",
        "response": "I can help with complaint status, raising a complaint, FAQs, and dashboard navigation.",
        "confidence": 0.42,
    }
