"use client";

import { Brain, ExternalLink, Heart } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logoIcon}>
              <Brain size={18} />
            </div>
            <span className={styles.logoText}>ClinicalBERT</span>
          </div>

          {/* Links */}
          <div className={styles.links}>
            <a href="https://www.aclweb.org/anthology/W19-1909/" target="_blank" rel="noopener noreferrer" className={styles.link}>
              Paper <ExternalLink size={12} />
            </a>
            <a href="https://github.com/EmilyAlsentzer/clinicalBERT" target="_blank" rel="noopener noreferrer" className={styles.link}>
              GitHub <ExternalLink size={12} />
            </a>
            <a href="https://huggingface.co/emilyalsentzer/Bio_ClinicalBERT" target="_blank" rel="noopener noreferrer" className={styles.link}>
              HuggingFace <ExternalLink size={12} />
            </a>
            <a href="https://www.dropbox.com/s/8armk04fu16algz/pretrained_bert_tf.tar.gz?dl=0" target="_blank" rel="noopener noreferrer" className={styles.link}>
              Download Models <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Citation */}
        <div className={styles.citation}>
          <p className={styles.citationLabel}>Cite This Work</p>
          <code className={styles.citationCode}>
            {`Alsentzer et al. (2019). Publicly Available Clinical BERT Embeddings.
Proceedings of the 2nd Clinical NLP Workshop, NAACL 2019.
DOI: 10.18653/v1/W19-1909`}
          </code>
        </div>

        {/* Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copy}>
            © 2019 Emily Alsentzer, MIT. Open source under MIT License.
          </p>
          <p className={styles.madeWith}>
            Made with <Heart size={12} className={styles.heart} /> for clinical NLP research
          </p>
        </div>
      </div>
    </footer>
  );
}
