# Future Plan — ClinicalBERT Direct Model Integration

> **Status:** Planned  
> **Priority:** High  
> **Author:** Project Maintainer

---

## Overview

The current state of this project provides **guidelines** on how to run ClinicalBERT models — shell scripts, Python invocations, and links to HuggingFace. While this is useful for researchers reproducing results, it creates friction for end users and developers who want to interact with clinical NLP capabilities directly through the frontend or an API.

**The goal of this future work is to wire the ClinicalBERT models in directly** — so the frontend and a backend service can run inference, fine-tuning, and evaluation without a user needing to touch a shell script.

---

## Current Limitations

| Area | Current State | Problem |
|---|---|---|
| **Inference** | Links to HuggingFace or manual `transformers` usage | No live inference from the UI |
| **NER** | `run_i2b2.sh` shell script | Requires local environment setup, MIMIC access |
| **NLI** | `run_classifier.sh` shell script | No API endpoint; results not surfaced in UI |
| **Pre-training** | Multi-step manual pipeline | Not scriptable from the frontend |
| **Model selection** | Static documentation | User can't switch models interactively |

---

## Planned Changes

### 1. FastAPI Backend (`/backend`)

Create a lightweight Python FastAPI service that wraps the HuggingFace `transformers` pipeline:

```
backend/
├── main.py              # FastAPI app entrypoint
├── models/
│   ├── loader.py        # Lazy-load model by name
│   └── registry.py      # Map model IDs → HuggingFace slugs
├── routes/
│   ├── inference.py     # POST /infer — run token embeddings
│   ├── ner.py           # POST /ner  — run NER on clinical text
│   └── nli.py           # POST /nli  — run MedNLI classification
└── requirements.txt
```

**Key endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/infer` | Return contextual embeddings for input text |
| `POST` | `/ner` | Predict clinical NER labels (medication, problem, treatment) |
| `POST` | `/nli` | Classify premise-hypothesis as entail / contradict / neutral |
| `GET` | `/models` | List available model variants and their metadata |
| `POST` | `/models/switch` | Hot-swap the active model checkpoint |

### 2. Model Registry

Instead of hardcoded checkpoint paths, define a `registry.py` that maps friendly names to HuggingFace slugs or local checkpoint directories:

```python
MODEL_REGISTRY = {
    "bio-clinical": "emilyalsentzer/Bio_ClinicalBERT",
    "bio-discharge": "emilyalsentzer/Bio_Discharge_Summary_BERT",
    "clinical-bert": "./checkpoints/bert_pretrain_output_all_notes_150000",
    "discharge-bert": "./checkpoints/bert_pretrain_output_disch_100000",
}
```

Models are loaded lazily on first request and cached in memory.

### 3. Frontend Integration

Update the Next.js frontend to call the backend API instead of rendering static documentation:

- **Live Inference Panel** — text input → real-time token embeddings / NER tags
- **NLI Playground** — enter a clinical premise and hypothesis, get classification + confidence score
- **Model Switcher** — dropdown to select which checkpoint to use for inference
- **Results Visualization** — highlight NER entities inline, show NLI confidence bars

### 4. Streaming Inference (Stretch Goal)

For longer clinical documents, stream token-level predictions back to the frontend using Server-Sent Events (SSE) so the UI can render results progressively without waiting for the full document to be processed.

### 5. Authentication & Rate Limiting (If Deployed Publicly)

If the backend is hosted publicly:
- Add API key authentication via a `Bearer` token
- Rate-limit inference requests to prevent abuse
- Log requests for monitoring (no PHI should be stored)

---

## Implementation Phases

```
Phase 1 — Backend Foundation
  ├── [ ] Scaffold FastAPI app
  ├── [ ] Implement model registry + lazy loader
  ├── [ ] /infer endpoint with Bio+ClinicalBERT
  └── [ ] Dockerize backend

Phase 2 — NER & NLI Endpoints
  ├── [ ] Wire run_ner.py logic into /ner REST endpoint
  ├── [ ] Wire run_classifier.py logic into /nli REST endpoint
  └── [ ] Add model-switching support

Phase 3 — Frontend Wiring
  ├── [ ] Live inference panel component
  ├── [ ] NLI playground component
  ├── [ ] Model selector dropdown
  └── [ ] Entity highlighting in NER results

Phase 4 — Polish & Deploy
  ├── [ ] Streaming inference via SSE
  ├── [ ] Auth + rate limiting
  └── [ ] CI/CD pipeline (GitHub Actions → Render/Railway)
```

---

## Motivation

The current project is valuable as a **research artifact** but falls short as a **usable tool**. By wiring the models in directly:

1. **Researchers** can test hypotheses interactively without writing code.
2. **Clinicians** can explore NLP capabilities on example notes directly in the browser.
3. **Developers** can integrate clinical NLP into their own systems via a clean REST API.
4. **The frontend** becomes a living demo rather than static documentation.

---

## Notes

- All inference should operate on **de-identified or synthetic clinical text** only. MIMIC-III data must never be stored or transmitted through the backend.
- Model weights for `bert_pretrain_output_*` checkpoints are TensorFlow format — they may need conversion to PyTorch using `transformers-cli convert` before serving.
- HuggingFace-hosted models (`emilyalsentzer/*`) are already in PyTorch format and can be served immediately.
