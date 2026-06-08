"use client";

import { motion } from "framer-motion";
import { Code2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import styles from "./Quickstart.module.css";

const snippets = [
  {
    id: "hf-pipeline",
    label: "HuggingFace (2 lines)",
    lang: "python",
    code: `from transformers import AutoTokenizer, AutoModel

# Load Bio+ClinicalBERT directly from HuggingFace Hub
tokenizer = AutoTokenizer.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")
model = AutoModel.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")

# Encode a clinical sentence
inputs = tokenizer(
    "Patient presents with acute chest pain radiating to the left arm.",
    return_tensors="pt",
    truncation=True,
    max_length=512
)
outputs = model(**inputs)
embeddings = outputs.last_hidden_state  # Shape: [1, seq_len, 768]
print(f"Embedding shape: {embeddings.shape}")`,
  },
  {
    id: "ner",
    label: "NER (i2b2)",
    lang: "bash",
    code: `# Run NER fine-tuning on i2b2 dataset
cd downstream_tasks

bash run_i2b2.sh \\
  --bert_model_dir /path/to/biobert_pretrain_output_all_notes_150000 \\
  --data_dir /path/to/i2b2_data \\
  --output_dir /path/to/output \\
  --num_train_epochs 5 \\
  --learning_rate 5e-5`,
  },
  {
    id: "nli",
    label: "MedNLI",
    lang: "bash",
    code: `# Run NLI classification on MedNLI
cd downstream_tasks

bash run_classifier.sh \\
  --task_name medNLI \\
  --bert_model_dir /path/to/biobert_pretrain_output_all_notes_150000 \\
  --data_dir /path/to/mednli_data \\
  --output_dir /path/to/output \\
  --num_train_epochs 3`,
  },
];

export default function Quickstart() {
  const [active, setActive] = useState(snippets[0].id);
  const [copied, setCopied] = useState(false);

  const current = snippets.find((s) => s.id === active)!;

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="section" id="quickstart">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">
            <Code2 size={13} /> Quickstart
          </div>
          <h2 className="section-title">
            Start Coding in <span className="gradient-text">Minutes</span>
          </h2>
          <p className="section-subtitle">
            Use ClinicalBERT directly from HuggingFace or reproduce from
            scratch — pick your path below.
          </p>
        </motion.div>

        <motion.div
          className={`glass-card ${styles.codeBlock}`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Tabs */}
          <div className={styles.tabs}>
            {snippets.map((s) => (
              <button
                key={s.id}
                className={`${styles.tab} ${active === s.id ? styles.tabActive : ""}`}
                onClick={() => setActive(s.id)}
              >
                {s.label}
              </button>
            ))}
            <button className={styles.copyBtn} onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Code */}
          <div className={styles.code}>
            <SyntaxHighlighter
              language={current.lang}
              style={vscDarkPlus}
              customStyle={{
                background: "transparent",
                padding: "24px",
                margin: 0,
                fontSize: "13.5px",
                lineHeight: "1.7",
              }}
              showLineNumbers
            >
              {current.code}
            </SyntaxHighlighter>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
