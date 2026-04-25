from functools import lru_cache

import numpy as np

from ai_config import EMBEDDING_MODEL_NAME

try:
    from sentence_transformers import SentenceTransformer
except ImportError:  # pragma: no cover
    SentenceTransformer = None


@lru_cache(maxsize=1)
def get_embedding_model():
    if SentenceTransformer is None:
        return None
    return SentenceTransformer(EMBEDDING_MODEL_NAME)


def cosine_similarity(left, right):
    left_norm = np.linalg.norm(left)
    right_norm = np.linalg.norm(right)
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return float(np.dot(left, right) / (left_norm * right_norm))
