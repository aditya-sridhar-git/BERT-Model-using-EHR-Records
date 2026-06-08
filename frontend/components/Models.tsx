"use client";

import { motion } from "framer-motion";
import { ExternalLink, Star, Layers } from "lucide-react";
import styles from "./Models.module.css";

const models = [
  {
    id: "bio-clinical",
    name: "Bio+Clinical BERT",
    hfSlug: "emilyalsentzer/Bio_ClinicalBERT",
    checkpoint: "biobert_pretrain_output_all_notes_150000",
    base: "BioBERT-Base v1.0",
    data: "All MIMIC-III notes",
    steps: "150,000",
    badge: "Recommended",
    badgeColor: "#ec4899",
    desc: "Pre-trained on all MIMIC-III notes, initialized from BioBERT. Best overall performance.",
  },
  {
    id: "bio-discharge",
    name: "Bio+Discharge Summary BERT",
    hfSlug: "emilyalsentzer/Bio_Discharge_Summary_BERT",
    checkpoint: "biobert_pretrain_output_disch_100000",
    base: "BioBERT-Base v1.0",
    data: "Discharge summaries only",
    steps: "100,000",
    badge: "Specialized",
    badgeColor: "#fb7185",
    desc: "Optimized for discharge summaries. Ideal for end-of-stay clinical documentation tasks.",
  },
  {
    id: "clinical-bert",
    name: "Clinical BERT",
    hfSlug: null,
    checkpoint: "bert_pretrain_output_all_notes_150000",
    base: "BERT-Base (cased)",
    data: "All MIMIC-III notes",
    steps: "150,000",
    badge: "General",
    badgeColor: "#f43f5e",
    desc: "Fine-tuned from original cased BERT. Useful without biomedical pre-training dependency.",
  },
  {
    id: "discharge-bert",
    name: "Discharge Summary BERT",
    hfSlug: null,
    checkpoint: "bert_pretrain_output_disch_100000",
    base: "BERT-Base (cased)",
    data: "Discharge summaries only",
    steps: "100,000",
    badge: "Lightweight",
    badgeColor: "#fb923c",
    desc: "Smallest and fastest variant. Great for resource-constrained inference pipelines.",
  },
];

export default function Models() {
  return (
    <section className="section" id="models">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">
            <Layers size={13} /> Model Zoo
          </div>
          <h2 className="section-title">
            Choose Your <span className="gradient-text">Model Variant</span>
          </h2>
          <p className="section-subtitle">
            Four pre-trained checkpoints — each optimized for different clinical
            data distributions and base initializations.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {models.map((model, i) => (
            <motion.div
              key={model.id}
              className={`glass-card ${styles.card} ${model.badge === "Recommended" ? styles.featured : ""}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div
                className={styles.badge}
                style={{
                  background: `${model.badgeColor}22`,
                  color: model.badgeColor,
                  border: `1px solid ${model.badgeColor}40`,
                }}
              >
                <Star size={11} />
                {model.badge}
              </div>
              <h3 className={styles.modelName}>{model.name}</h3>
              <p className={styles.modelDesc}>{model.desc}</p>
              <div className={styles.specs}>
                {[
                  { label: "Base", value: model.base },
                  { label: "Data", value: model.data },
                  { label: "Steps", value: model.steps },
                ].map((spec) => (
                  <div key={spec.label} className={styles.specRow}>
                    <span className={styles.specLabel}>{spec.label}</span>
                    <span className={styles.specValue}>{spec.value}</span>
                  </div>
                ))}
              </div>
              <div className={styles.checkpoint}>
                <code>{model.checkpoint}</code>
              </div>
              {model.hfSlug ? (
                <a
                  href={`https://huggingface.co/${model.hfSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn-primary ${styles.modelBtn}`}
                >
                  HuggingFace <ExternalLink size={14} />
                </a>
              ) : (
                <a
                  href="https://www.dropbox.com/s/8armk04fu16algz/pretrained_bert_tf.tar.gz?dl=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn-secondary ${styles.modelBtn}`}
                >
                  Download <ExternalLink size={14} />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
