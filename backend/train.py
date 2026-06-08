from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset
import pandas as pd
import numpy as np
import torch
from sklearn.metrics import accuracy_score, f1_score
from pathlib import Path

BACKEND_DIR = Path(__file__).parent
DATA_PATH   = (BACKEND_DIR.parent / "data" / "clinicalbert_readmission.tsv").as_posix()
MODEL_OUT   = (BACKEND_DIR / "fine_tuned_model").as_posix()

# ── Load your CSV ─────────────────────────────────────────────
df = pd.read_csv(DATA_PATH, sep="\t")
df = df.rename(columns={"text_a": "text"})  # TSV uses text_a, BERT expects text
df["label"] = df["label"].astype(int)
df = df[["text", "label"]]


# ── Tokenize ───────────────────────────────────────────────────
tokenizer = AutoTokenizer.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")
dataset = Dataset.from_pandas(df)

def tokenize(batch):
    return tokenizer(batch["text"], truncation=True, padding="max_length", max_length=512)

dataset = dataset.map(tokenize, batched=True)
dataset = dataset.train_test_split(test_size=0.2, seed=42)

# ── Model ──────────────────────────────────────────────────────
model = AutoModelForSequenceClassification.from_pretrained(
    "emilyalsentzer/Bio_ClinicalBERT", num_labels=2
)

# ── Training ───────────────────────────────────────────────────
training_args = TrainingArguments(
    output_dir=MODEL_OUT,
    num_train_epochs=3,
    per_device_train_batch_size=8,
    eval_strategy ="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    logging_dir=(BACKEND_DIR / "logs").as_posix(),
    logging_steps=50,
    remove_unused_columns=False,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
)

trainer.train()

# ── Save fine-tuned model ──────────────────────────────────────
model.save_pretrained(MODEL_OUT)
tokenizer.save_pretrained(MODEL_OUT)
print(f"✅ Fine-tuned model saved to {MODEL_OUT}")