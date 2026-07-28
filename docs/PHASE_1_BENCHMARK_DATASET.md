# Phase 1: Governed Civic Benchmark Dataset

Phase 1 establishes the evidence needed to measure Urban Pulse AI responsibly. It defines a versioned Bengaluru civic-image benchmark with provenance, privacy review, independent annotation, adjudication, integrity hashes, negative examples, and leakage-safe splits. It does not treat demonstration images or ordinary production complaints as ground truth.

## Dataset Lifecycle

| Status | Meaning | Eligible for evaluation |
| --- | --- | --- |
| `draft` | Imported media is awaiting permission, privacy, or annotation work | No |
| `double_annotated` | Two independent labels exist but disagreements are not adjudicated | No |
| `adjudicated` | Permission, privacy review, independent labels, and final adjudication are complete | Yes |
| `rejected` | The record is unsuitable, unsafe, duplicated, or unsupported | No |

The repository currently contains the schema and collection tooling, while `dataset/benchmark/manifest.json` remains at dataset version `0.1.0-collection` with no adjudicated records. This is an explicit `not_ready` state, not a failed or fabricated benchmark.

## Record Contract

Every benchmark record includes:

- A stable `UPB-` identifier and an image path constrained to `dataset/benchmark/images/`.
- A SHA-256 media digest and a `groupId` that joins derivatives from the same physical scene.
- Source type, source reference, license, and explicit permission confirmation.
- Bengaluru area-level context without exact residential addresses.
- Independent privacy review for faces, vehicle plates, and private-property identifiers.
- Canonical category, secondary categories, severity, incident presence, hazards, sensitive context, and visible evidence.
- Annotation status, independent annotators, agreement, adjudicator, timestamp, and notes.

JPEG, PNG, and WebP are accepted. Categories must match `shared/aiCategories.json`; a true negative uses `categoryId: general`, `incidentPresent: false`, and no fabricated incident label.

## Acceptance Gates

An `adjudicated` record is rejected when any of the following is missing or invalid:

- Confirmed source permission and a documented license.
- Completed independent privacy review and reviewer identifier.
- At least two distinct annotators and a final adjudicator.
- Annotation agreement between `0` and `1`.
- A canonical category and supported severity.
- A valid image hash, unique record ID, and unique media path.
- Area, ward, or city-level location precision.

Exact duplicate images are detected by SHA-256. Draft records may produce warnings while work is incomplete, but those same conditions become errors before benchmark acceptance.

## Leakage-Safe Splitting

`npm run dataset:split` creates deterministic train, validation, and test assignments using a versioned seed. Splitting is category-stratified and grouped by `media.groupId`, so crops, alternate views, or derivatives from one scene cannot appear across different splits.

The generated split file records:

- Dataset version and generation timestamp.
- SHA-256 of the exact manifest.
- Split seed and policy description.
- Record IDs and counts for train, validation, and test.

Phase 2 rejects a split when its stored manifest hash no longer matches the active manifest. Any dataset change therefore requires regenerating the split rather than silently evaluating against stale membership.

## Collection Workflow

```bash
# Import an approved source image as a quarantined draft.
python3 scripts/manageBenchmarkDataset.py import \
  --image /path/to/image.jpg \
  --id UPB-AREA-000001 \
  --group-id scene-area-000001 \
  --category road_damage \
  --area "Bengaluru area" \
  --source-type field_capture \
  --source-reference "collection record" \
  --license "documented permission"

# Inspect collection state, validate records, then generate immutable splits.
npm run dataset:stats
npm run dataset:validate
npm run dataset:split
```

Importing copies the image into the benchmark directory, calculates its digest, rejects exact duplicates, and creates a `draft` manifest record. Permission, privacy, and annotation fields must then be completed through a documented human process.

## Verification

```bash
npm run verify:dataset
```

The focused verification covers valid manifests, explicit negative examples, draft quarantine, privacy enforcement, duplicate detection, deterministic splitting, and prevention of scene leakage.

## Phase 2 Boundary

Phase 1 governs what evidence is eligible for measurement. It does not calculate accuracy or approve a model. Phase 2 runs the production decision pipeline on an immutable image-only split, computes safety and quality metrics, and applies a policy fixed before test results are examined. See [Phase 2](PHASE_2_EVALUATION_METRICS.md).
