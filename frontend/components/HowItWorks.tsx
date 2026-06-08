"use client";

import { motion } from "framer-motion";
import { FileText, Cpu, FlaskConical, ArrowRight } from "lucide-react";
import styles from "./HowItWorks.module.css";

const steps = [
  {
    step: "01",
    icon: FileText,
    color: "#ec4899",
    title: "Format MIMIC Data",
    desc: "Run format_mimic_for_BERT.py to convert raw MIMIC-III clinical notes into BERT-compatible sentence pairs. Configure your input/output paths and let the heuristic sentence splitter do the heavy lifting.",
    code: "python format_mimic_for_BERT.py",
  },
  {
    step: "02",
    icon: Cpu,
    color: "#f43f5e",
    title: "Create Pre-training Data",
    desc: "Execute create_pretrain_data.sh to generate shuffled, masked token datasets with next-sentence-prediction labels. Outputs sharded TFRecord files ready for distributed training.",
    code: "bash create_pretrain_data.sh",
  },
  {
    step: "03",
    icon: FlaskConical,
    color: "#fb923c",
    title: "Fine-tune & Evaluate",
    desc: "Launch finetune_lm_tf.sh to continue pre-training from BioBERT, then evaluate on downstream tasks using run_classifier.py (MedNLI) or run_ner.py (i2b2 NER).",
    code: "bash finetune_lm_tf.sh",
  },
];

export default function HowItWorks() {
  return (
    <section className="section" id="how-it-works">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">
            <Cpu size={13} /> Workflow
          </div>
          <h2 className="section-title">
            Reproduce ClinicalBERT in{" "}
            <span className="gradient-text">3 Steps</span>
          </h2>
          <p className="section-subtitle">
            A clean, reproducible pipeline from raw clinical text to a
            state-of-the-art medical NLP model.
          </p>
        </motion.div>

        {/* Steps */}
        <div className={styles.stepsWrapper}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                className={styles.stepRow}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className={styles.connector}>
                    <div
                      className={styles.connectorLine}
                      style={{ background: `linear-gradient(180deg, ${step.color}, ${steps[i + 1].color})` }}
                    />
                  </div>
                )}

                {/* Step number bubble */}
                <div
                  className={styles.stepNumber}
                  style={{
                    background: `${step.color}18`,
                    border: `2px solid ${step.color}50`,
                    color: step.color,
                  }}
                >
                  {step.step}
                </div>

                {/* Content Card */}
                <motion.div
                  className={`glass-card ${styles.stepCard}`}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.stepTop}>
                    <div
                      className={styles.stepIconWrap}
                      style={{ background: `${step.color}18`, border: `1px solid ${step.color}30` }}
                    >
                      <Icon size={20} color={step.color} />
                    </div>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                  </div>
                  <p className={styles.stepDesc}>{step.desc}</p>
                  <div className={styles.codeSnippet}>
                    <span className={styles.codePrompt}>$</span>
                    <code>{step.code}</code>
                  </div>
                </motion.div>

                {i < steps.length - 1 && (
                  <div className={styles.arrow}>
                    <ArrowRight size={20} color="rgba(255,255,255,0.2)" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
