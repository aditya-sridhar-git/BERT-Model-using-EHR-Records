"""
knowledge_graph.py
Builds a patient-centric knowledge graph using NetworkX.
Returns serialisable node/edge data for the frontend to render.
"""
import re
import random
import networkx as nx
import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"

# ── Load reference tables once at import time ──────────────────────────────────
_symptoms_df    = pd.read_csv(DATA_DIR / "DiseaseAndSymptoms.csv")
_precaution_df  = pd.read_csv(DATA_DIR / "DiseasePrecaution.csv")

# Normalise disease names: lowercase, strip, collapse spaces
def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", str(s).lower().strip())

_symptoms_df["_key"]    = _symptoms_df["Disease"].apply(_norm)
_precaution_df["_key"]  = _precaution_df["Disease"].apply(_norm)

SYMPTOM_COLS    = [c for c in _symptoms_df.columns  if c.startswith("Symptom_")]
PRECAUTION_COLS = [c for c in _precaution_df.columns if c.startswith("Precaution_")]


def _seed_for(patient_id: str) -> int:
    """Deterministic seed from patient_id so the same patient always gets the same graph."""
    return sum(ord(c) for c in str(patient_id))


def _lookup_symptoms(disease: str, n: int = 3, rng: random.Random | None = None) -> list[str]:
    """Return up to n symptoms for the closest matching disease name."""
    key = _norm(disease)
    rows = _symptoms_df[_symptoms_df["_key"] == key]
    if rows.empty:
        rows = _symptoms_df[_symptoms_df["_key"].str.contains(key.split()[0], na=False)]
    if rows.empty:
        return []
    row = rows.iloc[0]
    syms = [str(row[c]).strip().replace("_", " ")
            for c in SYMPTOM_COLS if pd.notna(row[c]) and str(row[c]).strip() not in ("nan", "")]
    (rng or random).shuffle(syms)
    return syms[:n]


def _lookup_precautions(disease: str, n: int = 2) -> list[str]:
    """Return up to n precautions for the closest matching disease name."""
    key = _norm(disease)
    rows = _precaution_df[_precaution_df["_key"] == key]
    if rows.empty:
        rows = _precaution_df[_precaution_df["_key"].str.contains(key.split()[0], na=False)]
    if rows.empty:
        return []
    row = rows.iloc[0]
    precs = [str(row[c]).strip()
             for c in PRECAUTION_COLS if pd.notna(row[c]) and str(row[c]).strip() not in ("nan", "")]
    return precs[:n]



def build_patient_graph(patient: dict) -> dict:
    """
    Build a knowledge graph centred on the patient and return
    {nodes: [...], edges: [...]} ready for the frontend renderer.

    Node types (used for colour coding):
      patient | diagnosis | symptom | precaution | readmission | attribute
    """
    G = nx.DiGraph()

    pid        = str(patient.get("patient_id", "Patient"))
    diagnosis  = str(patient.get("primary_diagnosis", "Unknown"))
    severity   = str(patient.get("severity_level", "N/A"))
    age        = str(patient.get("age", "N/A"))
    gender     = str(patient.get("gender", "N/A"))
    los        = str(patient.get("length_of_stay", "N/A"))
    prediction = str(patient.get("prediction", "Unknown"))
    confidence = str(patient.get("confidence", "N/A"))

    # Seed RNG with patient_id so the same patient always produces the same graph
    # but different patients get different numbers of symptoms/precautions.
    rng = random.Random(_seed_for(pid))
    n_symptoms    = rng.randint(2, 4)
    n_precautions = rng.randint(1, 3)

    # ── Core nodes ──────────────────────────────────────────────────────────────
    G.add_node(pid,         type="patient",     label=f"Patient {pid}")
    G.add_node(diagnosis,   type="diagnosis",   label=diagnosis)

    # ── Patient → Diagnosis ────────────────────────────────────────────────────
    G.add_edge(pid, diagnosis, relation="diagnosed_with")

    # ── Attribute nodes ────────────────────────────────────────────────────────
    age_node = f"Age: {age}y"
    G.add_node(age_node,  type="attribute", label=age_node)
    G.add_edge(pid, age_node, relation="age")

    gender_node = f"Gender: {gender}"
    G.add_node(gender_node, type="attribute", label=gender_node)
    G.add_edge(pid, gender_node, relation="gender")

    los_node = f"Stay: {los}d"
    G.add_node(los_node,  type="attribute", label=los_node)
    G.add_edge(pid, los_node, relation="length_of_stay")

    severity_node = f"Severity: {severity}"
    G.add_node(severity_node, type="attribute", label=severity_node)
    G.add_edge(diagnosis, severity_node, relation="severity")

    # ── Symptoms ───────────────────────────────────────────────────────────────
    symptoms = _lookup_symptoms(diagnosis, n=n_symptoms, rng=rng)
    for sym in symptoms:
        G.add_node(sym, type="symptom", label=sym)
        G.add_edge(sym, diagnosis, relation="symptom_of")

    # ── Precautions ────────────────────────────────────────────────────────────
    precautions = _lookup_precautions(diagnosis, n=n_precautions)
    for prec in precautions:
        G.add_node(prec, type="precaution", label=prec)
        G.add_edge(diagnosis, prec, relation="recommended_precaution")

    # ── Readmission prediction ─────────────────────────────────────────────────
    readmit_node = f"Readmission: {prediction}"
    G.add_node(readmit_node, type="readmission", label=readmit_node,
               prediction=prediction, confidence=confidence)
    G.add_edge(pid, readmit_node, relation="predicted_readmission")

    conf_node = f"Confidence: {confidence}%"
    G.add_node(conf_node, type="attribute", label=conf_node)
    G.add_edge(readmit_node, conf_node, relation="model_confidence")

    # ── Serialise ──────────────────────────────────────────────────────────────
    nodes = [{"id": n, **G.nodes[n]} for n in G.nodes]
    edges = [{"source": u, "target": v, "relation": G.edges[u, v].get("relation", "")}
             for u, v in G.edges]

    return {"nodes": nodes, "edges": edges, "patient_id": pid}
