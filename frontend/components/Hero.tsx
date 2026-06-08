"use client";

import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* Animated orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      <div className="container">
        <div className={styles.inner}>
          {/* Badge */}
          <motion.div
            className={styles.badge}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Sparkles size={14} />
            NAACL Clinical NLP Workshop 2019
          </motion.div>

          {/* Headline */}
          <motion.h1
            className={styles.headline}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            All Of Your Clinical
            <br />
            <span className="gradient-text">NLP — In One Place</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className={styles.subheadline}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            Your ClinicalBERT model grows with you — pre-trained on{" "}
            <strong>MIMIC-III clinical notes</strong>, fine-tuned for NER and
            NLI tasks through our comprehensive EHR pre-training pipeline.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className={styles.ctas}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <a
              href="https://huggingface.co/emilyalsentzer/Bio_ClinicalBERT"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Get Started
              <ArrowRight size={16} />
            </a>
            <a
              href="https://github.com/EmilyAlsentzer/clinicalBERT"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <ExternalLink size={16} />
              View on GitHub
            </a>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            className={styles.stats}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {[
              { value: "2M+", label: "Clinical Notes" },
              { value: "4", label: "Model Variants" },
              { value: "150K", label: "Pre-training Steps" },
              { value: "BioBERT", label: "Base Model" },
            ].map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero Card Preview */}
        <motion.div
          className={styles.heroCardRow}
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {[
            {
              title: "Remain In Flow While Coding",
              desc: "by removing the barriers that block productivity when building clinical NLP models",
              cta: "Get Started",
              accent: true,
            },
            {
              title: "Pre-Train On Your Own Data",
              desc: "Format MIMIC notes, create pre-training data, and fine-tune in hours",
              cta: "Learn More",
              accent: false,
            },
            {
              title: "Deploy via HuggingFace",
              desc: "Drop-in integration with the Transformers library — two lines of code",
              cta: "View Models",
              accent: false,
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              className={`glass-card ${styles.heroCard} ${card.accent ? styles.heroCardAccent : ""}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 + i * 0.1 }}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className={styles.cardDot} />
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.desc}</p>
              <button className={card.accent ? "btn-primary" : styles.cardLinkBtn}>
                {card.cta}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
