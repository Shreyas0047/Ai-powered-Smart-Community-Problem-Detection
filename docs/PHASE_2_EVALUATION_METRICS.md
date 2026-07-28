# Phase 2: Leak-Free Evaluation And Quality Gates

Phase 2 measures the Urban Pulse AI decision pipeline against the adjudicated benchmark created in Phase 1. It separates model evaluation from demonstrations by using an immutable image-only test split, fixed Bengaluru city context, versioned quality gates, reproducible reports, and explicit `not_ready` outcomes.

## Evaluation Isolation

For each selected benchmark record, the evaluator sends only:

- The image bytes and declared MIME type.
- A fixed location value of `Bengaluru`.
- Empty complaint text, voice transcript, image hint, complaint history, and area history.

Ground-truth category, severity, area, annotation text, and media path are never provided to inference. The resulting report declares `evaluationMode: image_only_no_ground_truth_hints` and records the model runtime, vision providers, decision engine, evaluation versions, fallback use, and latency.

The test split must not be used to tune prompts, thresholds, rules, categories, or models. Tuning requires train or validation data followed by a new, untouched test evaluation.

## Measured Behavior

| Area | Metrics |
| --- | --- |
| Classification | Accuracy with 95% Wilson interval, coverage, selective accuracy, abstention rate, top-1, top-3, per-class precision/recall/F1, macro and weighted F1, confusion matrix |
| Safety severity | Exact accuracy, within-one-level accuracy, mean absolute level error, Critical recall, false-Critical rate, dangerous under-triage rate |
| Calibration | Brier score, expected calibration error, and confidence-bin reliability |
| Failure analysis | Misclassification, incorrect abstention, missed negative, severity over-triage, and severity under-triage buckets |
| Runtime | Mean, median, and p95 latency; provider, fallback, engine, and evaluation-version identity |

Abstention is a measurable safety behavior. A result of `general` can correctly represent a negative image, but it is counted as an incorrect abstention when an adjudicated incident was present.

## Versioned Release Policy

The initial academic policy in `dataset/benchmark/evaluation-policy.json` requires:

| Gate | Required value |
| --- | --- |
| Test records | At least 54 |
| Incident classes represented | At least 12 |
| Macro incident F1 | At least `0.70` |
| Critical recall | At least `0.90` |
| Negative recall | At least `0.70` |
| Selective accuracy | At least `0.78` |
| Coverage | At least `0.65` |
| False-Critical rate | At most `0.03` |
| Dangerous under-triage | At most `0.05` |
| Expected calibration error | At most `0.12` |

These thresholds are policy targets, not current accuracy claims. They must not be lowered after viewing test results without publishing a new policy version and documenting the decision.

## Readiness And Integrity

The evaluator returns `not_ready` rather than inventing a score when:

- No adjudicated benchmark records exist.
- The requested split is missing or empty.
- The split references missing or unaccepted records.
- The manifest fails Phase 1 validation.
- The manifest changed after split generation.

Completed reports preserve the dataset version, manifest SHA-256, split-file SHA-256, split name, record count, policy version, runtime identity, and per-sample outputs. A sample-level inference error becomes an abstained, human-review-required result and fails the policy rather than disappearing from the denominator.

## Running The Evaluation

```bash
# Safe during collection: reports why the benchmark is not ready.
npm run evaluate:benchmark:readiness

# After adjudication and split generation: evaluate the immutable test split.
python3 scripts/evaluateBenchmark.py \
  --split test \
  --output reports/benchmark-test.json
```

The output describes only the exact dataset and runtime versions recorded in that report. It is not a population-wide accuracy claim unless collection coverage and representativeness have been independently established.

## Verification

```bash
npm run verify:metrics
```

The focused verification uses known-answer examples to check precision, recall, F1, confusion matrices, top-k behavior, abstention, severity safety, calibration, and error buckets. It also verifies policy pass/fail behavior, honest empty-dataset readiness, end-to-end image-only inference, runtime-version capture, and rejection of stale splits.

## Phase 3 Boundary

Phase 2 establishes whether offline evidence meets predefined quality and safety gates. It cannot correct a live complaint or create operational ground truth. Phase 3 adds authorized human confirmation, correction, insufficient-evidence handling, concurrency protection, and preservation of the original machine decision. See [Phase 3](PHASE_3_HUMAN_REVIEW.md).
