from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from predict import predict_batch
from knowledge_graph import build_patient_graph
import pandas as pd
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)

MAX_ROWS = 500  # cap to keep response times reasonable

@app.post("/predict-csv")
async def predict_from_csv(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")), low_memory=False)
    df = df.fillna("N/A")

    # Limit rows so the request doesn't time out on huge files
    if len(df) > MAX_ROWS:
        df = df.head(MAX_ROWS)

    results = predict_batch(df)

    # Compute summary statistics
    total = len(results)
    readmitted_pred    = sum(1 for r in results if r["prediction"] == "Readmitted")
    not_readmitted_pred = total - readmitted_pred
    correct = sum(1 for r in results if r["prediction"] == r["actual"])
    accuracy = round((correct / total) * 100, 1) if total > 0 else 0

    return {
        "predictions": results,
        "total": total,
        "summary": {
            "readmitted_count":     readmitted_pred,
            "not_readmitted_count": not_readmitted_pred,
            "correct":              correct,
            "accuracy":             accuracy,
        }
    }

@app.post("/knowledge-graph")
async def knowledge_graph(patient: dict):
    """
    Accept a patient record dict (same shape as a prediction result row)
    and return a knowledge graph of nodes + edges.
    """
    return build_patient_graph(patient)