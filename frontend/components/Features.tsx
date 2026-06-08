"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Tag,
  GitBranch,
  Download,
  Activity,
  Zap,
  Shield,
  Database,
} from "lucide-react";
import styles from "./Features.module.css";

const features = [
  {
    icon: Brain,
    color: "#ec4899",
    title: "Language Model Pre-training",
    desc: "Fine-tune BERT or BioBERT on MIMIC-III clinical notes using masked language modeling and next sentence prediction objectives.",
    tags: ["MIMIC-III", "MLM", "NSP"],
  },
  {
    icon: Tag,
    color: "#f43f5e",
    title: "Named Entity Recognition",
    desc: "Run i2b2 NER tasks with state-of-the-art accuracy on clinical entities like medications, problems, and treatments.",
    tags: ["i2b2", "BIO Tagging", "CRF"],
  },
  {
    icon: GitBranch,
    color: "#fb7185",
    title: "Natural Language Inference",
    desc: "Tackle MedNLI with clinical BERT embeddings, classifying entailment, contradiction, and neutrality on medical premise-hypothesis pairs.",
    tags: ["MedNLI", "Entailment", "Classification"],
  },
  {
    icon: Download,
    color: "#be185d",
    title: "HuggingFace Integration",
    desc: "Use Bio+ClinicalBERT or Discharge Summary BERT directly via the Transformers library with just two lines of Python.",
    tags: ["Transformers", "PyTorch", "TensorFlow"],
  },
  {
    icon: Activity,
    color: "#e11d48",
    title: "Clinical Text Processing",
    desc: "Specialized tokenization and heuristic sentence splitting designed specifically for the nuances of clinical notes.",
    tags: ["Tokenization", "Preprocessing", "MIMIC"],
  },
  {
    icon: Database,
    color: "#86efac",
    title: "MIMIC-III Pipeline",
    desc: "End-to-end pipeline from raw MIMIC exports to pre-training-ready shards, with configurable parameters for any cluster.",
    tags: ["ETL", "MIMIC-III", "Sharding"],
  },
  {
    icon: Zap,
    color: "#fdba74",
    title: "Dual Model Variants",
    desc: "Choose between Clinical BERT (general notes) and Discharge Summary BERT, each available with or without BioBERT initialization.",
    tags: ["Bio+Clinical", "Discharge", "Multi-model"],
  },
  {
    icon: Shield,
    color: "#c4b5fd",
    title: "Research-Grade Quality",
    desc: "Published at NAACL 2019 Clinical NLP Workshop, cited 2,000+ times. A gold-standard baseline for clinical NLP research.",
    tags: ["NAACL 2019", "Peer Reviewed", "Open Source"],
  },
];

export default function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">
            <Zap size={13} /> Capabilities
          </div>
          <h2 className="section-title">
            Everything You Need for{" "}
            <span className="gradient-text">Clinical NLP</span>
          </h2>
          <p className="section-subtitle">
            From raw EHR data to fine-tuned models — ClinicalBERT covers the
            entire clinical NLP pipeline out of the box.
          </p>
        </motion.div>

        {/* Grid */}
        <div className={styles.grid}>
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className={`glass-card ${styles.card}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                <div
                  className={styles.iconWrap}
                  style={{
                    background: `${feature.color}18`,
                    border: `1px solid ${feature.color}30`,
                  }}
                >
                  <Icon size={22} color={feature.color} />
                </div>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardDesc}>{feature.desc}</p>
                <div className={styles.tags}>
                  {feature.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
