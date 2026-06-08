"use client";

import { useState, useEffect } from "react";
import { Brain } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <a href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Brain size={18} />
          </div>
          <span className={styles.logoText}>ClinicalBERT</span>
        </a>

        {/* Tagline */}
        <span style={{
          fontSize: 13,
          color: "var(--text-muted)",
          fontFamily: "var(--font-body)",
          fontStyle: "italic",
        }}>
          30-Day Readmission Predictor
        </span>
      </div>
    </nav>
  );
}
