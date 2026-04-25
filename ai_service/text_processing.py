import hashlib
import re
from collections import Counter
from functools import lru_cache

import numpy as np

from category_catalog import COMPLAINT_CATEGORIES
from model_runtime import cosine_similarity, get_embedding_model


TOKEN_PATTERN = re.compile(r"[a-z0-9]+(?:['-][a-z0-9]+)?")
STOP_WORDS = {
    "the",
    "and",
    "for",
    "with",
    "this",
    "that",
    "from",
    "near",
    "into",
    "there",
    "have",
    "been",
    "about",
    "after",
    "before",
    "very",
    "just",
    "need",
    "please",
    "issue",
    "complaint",
}
NEGATIVE_TERMS = {"danger", "urgent", "bad", "critical", "unsafe", "broken", "failing", "overflow", "leakage", "outage"}
POSITIVE_TERMS = {"resolved", "fixed", "thanks", "clean", "good", "working"}


def normalize_text(value):
    return " ".join(str(value or "").strip().lower().split())


def tokenize(text):
    return TOKEN_PATTERN.findall(normalize_text(text))


def generate_ngrams(tokens):
    bigrams = [f"{tokens[index]} {tokens[index + 1]}" for index in range(len(tokens) - 1)]
    return tokens + bigrams


def keyword_extract(text, limit=6):
    grams = [gram for gram in generate_ngrams(tokenize(text)) if gram not in STOP_WORDS and len(gram) > 2]
    counts = Counter(grams)
    return [term for term, _count in counts.most_common(limit)]


@lru_cache(maxsize=256)
def _hash_embedding(text):
    vector = np.zeros(384, dtype=float)
    for token in generate_ngrams(tokenize(text)):
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        for index, byte in enumerate(digest[:48]):
            vector[(index * 8) % 384] += byte / 255.0
    return vector


@lru_cache(maxsize=128)
def _embed_text(text):
    normalized = normalize_text(text)
    model = get_embedding_model()
    if model is None:
        return _hash_embedding(normalized)
    return np.array(model.encode([normalized], normalize_embeddings=True)[0], dtype=float)


@lru_cache(maxsize=64)
def _category_embedding(category_id, corpus):
    return _embed_text(corpus)


def build_category_corpus(category):
    return " ".join([category["label"], *category["aliases"], *[term for term, _weight in category["keywords"]]])


def semantic_multi_label_classification(text, threshold=0.34):
    text_vector = _embed_text(text)
    keyword_terms = keyword_extract(text, limit=8)
    normalized = normalize_text(text)
    scored = []

    for category in COMPLAINT_CATEGORIES:
        category_vector = _category_embedding(category["id"], build_category_corpus(category))
        similarity = cosine_similarity(text_vector, category_vector)
        keyword_bonus = sum(weight for term, weight in category["keywords"] if term in normalized)
        keyword_bonus = min(0.45, keyword_bonus * 0.24)
        ngram_bonus = sum(0.08 for keyword in keyword_terms if keyword in category["aliases"] or keyword in [term for term, _ in category["keywords"]])
        score = min(1.0, similarity * 0.74 + keyword_bonus + min(0.18, ngram_bonus))
        scored.append(
            {
                "id": category["id"],
                "label": category["label"],
                "confidence": round(score, 3),
                "matched_keywords": [term for term, _weight in category["keywords"] if term in normalized][:4],
            }
        )

    scored.sort(key=lambda item: item["confidence"], reverse=True)
    selected = [item for item in scored if item["confidence"] >= threshold]

    if not selected:
        return {
            "labels": [],
            "fallback": {
                "suggested_category": scored[0]["id"],
                "suggested_label": scored[0]["label"],
                "confidence": scored[0]["confidence"],
            },
            "all_scores": scored,
        }

    return {
        "labels": selected,
        "fallback": None,
        "all_scores": scored,
    }


def analyze_sentiment_and_severity(text, categories):
    normalized = normalize_text(text)
    tokens = tokenize(text)
    negative_hits = sum(1 for token in tokens if token in NEGATIVE_TERMS)
    positive_hits = sum(1 for token in tokens if token in POSITIVE_TERMS)
    critical_hits = 0

    for category in COMPLAINT_CATEGORIES:
        if category["id"] in {item["id"] for item in categories}:
            critical_hits += sum(1 for term in category["critical_keywords"] if term in normalized)

    raw_score = negative_hits * 0.32 - positive_hits * 0.22 + critical_hits * 0.4
    if raw_score >= 0.7:
        sentiment = "negative"
    elif raw_score <= -0.3:
        sentiment = "positive"
    else:
        sentiment = "neutral"

    if critical_hits >= 2 or raw_score >= 1.0:
        severity = "HIGH"
    elif critical_hits == 1 or raw_score >= 0.45:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    return {
        "sentiment_label": sentiment,
        "sentiment_score": round(max(-1.0, min(1.0, raw_score)), 3),
        "severity_score": severity,
        "critical_keyword_hits": critical_hits,
    }

