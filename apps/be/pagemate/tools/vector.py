import numpy as np


def inner_products(query: np.ndarray, keys: np.ndarray) -> np.ndarray:
    similarities = np.dot(keys, query)
    return similarities


def cosine_similarities(query: np.ndarray, keys: np.ndarray) -> np.ndarray:
    """
    Compute cosine similarities between a query vector and a set of key vectors.
    """

    q_norm = query / np.linalg.norm(query)
    keys_norm = keys / np.linalg.norm(keys, axis=1, keepdims=True)

    similarities = inner_products(q_norm, keys_norm)

    return similarities
