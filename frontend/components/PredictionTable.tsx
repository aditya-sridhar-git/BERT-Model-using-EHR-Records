"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
  Users,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  XCircle,
  BarChart3,
  Network,
} from "lucide-react";
import KnowledgeGraph from "./KnowledgeGraph";

type Prediction = {
  admission_id: string;
  patient_id: string;
  primary_diagnosis: string;
  age: string;
  gender: string;
  length_of_stay: string;
  severity_level: string;
  prediction: string;
  confidence: number;
};

type Summary = {
  readmitted_count: number;
  not_readmitted_count: number;
  correct: number;
  accuracy: number;
};

export default function PredictionTable() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Prediction | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile?.name.endsWith(".csv")) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please upload a .csv file");
    }
  }, []);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://localhost:8000/predict-csv", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Prediction failed");
      const data = await res.json();
      setPredictions(data.predictions);
      setSummary(data.summary);
    } catch {
      setError("Failed to get predictions. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  const getSeverityColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "critical": return "#ef4444";
      case "high":     return "#f97316";
      case "moderate": return "#eab308";
      case "low":      return "#22c55e";
      default:         return "var(--text-muted)";
    }
  };

  const readmitRate =
    summary && predictions.length > 0
      ? Math.round((summary.readmitted_count / predictions.length) * 100)
      : 0;

  return (
    <section
      id="predictions"
      className="section"
      style={{ position: "relative", zIndex: 1, paddingTop: 100 }}
    >
      <div className="container">

        {/* ── Page Header ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 48, textAlign: "center" }}
        >
          <div className="section-label" style={{ justifyContent: "center", display: "inline-flex" }}>
            <Activity size={14} />
            Readmission Predictor
          </div>
          <h1 className="section-title" style={{ textAlign: "center" }}>
            Patient Readmission{" "}
            <span className="gradient-text">Analysis</span>
          </h1>
          <p className="section-subtitle" style={{ margin: "0 auto", textAlign: "center" }}>
            Upload a CSV of patient records to predict 30-day hospital
            readmission risk using our fine-tuned ClinicalBERT model.
          </p>
        </motion.div>

        {/* ── Upload Area ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div
            className="glass-card"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            style={{
              padding: "56px 32px",
              textAlign: "center",
              cursor: file ? "default" : "pointer",
              border: dragActive
                ? "2px dashed var(--accent-purple)"
                : "1px solid var(--border-subtle)",
              transition: "all 0.3s ease",
              background: dragActive
                ? "rgba(236, 72, 153, 0.06)"
                : "var(--bg-card)",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setError(null);
              }}
              style={{ display: "none" }}
            />

            {!file ? (
              <div>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "var(--gradient-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    border: "1px solid var(--border-accent)",
                  }}
                >
                  <Upload size={32} color="var(--accent-purple)" />
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: 8,
                  }}
                >
                  Drop your CSV file here
                </p>
                <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                  or click to browse &bull; Accepts .csv files with patient records
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 20px",
                    background: "rgba(236, 72, 153, 0.08)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <FileSpreadsheet size={20} color="var(--accent-purple)" />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 14,
                      color: "var(--text-primary)",
                    }}
                  >
                    {file.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPredictions([]);
                      setSummary(null);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      padding: 4,
                      display: "flex",
                    }}
                  >
                    <XCircle size={16} />
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    opacity: loading ? 0.7 : 1,
                    pointerEvents: loading ? "none" : "auto",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={16}
                        style={{ animation: "spin-slow 1s linear infinite" }}
                      />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Activity size={16} />
                      Run Predictions
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Error ───────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                marginTop: 16,
                padding: "12px 20px",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "var(--radius-sm)",
                color: "#ef4444",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertTriangle size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Summary Stats ────────────────────────────── */}
        <AnimatePresence>
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ marginTop: 40 }}
            >
              {/* Section heading */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <BarChart3 size={18} color="var(--accent-purple)" />
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 17,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Summary Statistics
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginLeft: 4,
                  }}
                >
                  — {predictions.length} patients processed
                </span>
              </div>

              {/* Stat cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                }}
              >
                {[
                  {
                    icon: <Users size={22} />,
                    label: "Total Patients",
                    value: predictions.length,
                    sub: "records analysed",
                    color: "var(--accent-purple)",
                  },
                  {
                    icon: <AlertTriangle size={22} />,
                    label: "Predicted Readmitted",
                    value: summary.readmitted_count,
                    sub: `${readmitRate}% of cohort`,
                    color: "#ef4444",
                  },
                  {
                    icon: <TrendingUp size={22} />,
                    label: "Not Readmitted",
                    value: summary.not_readmitted_count,
                    sub: `${100 - readmitRate}% of cohort`,
                    color: "#22c55e",
                  },
                  {
                    icon: <ShieldCheck size={22} />,
                    label: "Model Confidence",
                    value:
                      predictions.length > 0
                        ? `${Math.round(
                            predictions.reduce(
                              (acc, p) => acc + p.confidence,
                              0
                            ) / predictions.length
                          )}%`
                        : "—",
                    sub: "avg. across all patients",
                    color: "#6366f1",
                  },
                ].map((card, i) => (
                  <motion.div
                    key={card.label}
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                    style={{
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        background: `${card.color}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: card.color,
                        marginBottom: 4,
                      }}
                    >
                      {card.icon}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {card.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: 32,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        lineHeight: 1,
                      }}
                    >
                      {card.value}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                      }}
                    >
                      {card.sub}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results Table ────────────────────────────── */}
        <AnimatePresence>
          {predictions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ marginTop: 40 }}
            >
              <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                {/* Table header bar */}
                <div
                  style={{
                    padding: "16px 24px",
                    borderBottom: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(236, 72, 153, 0.04)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: 16,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    Patient Results
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {predictions.length} records
                  </span>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 14,
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        {[
                          "Patient ID",
                          "Age / Gender",
                          "Primary Diagnosis",
                          "Stay",
                          "Severity",
                          "Prediction",
                          "Confidence",
                          "",
                        ].map((h, hi) => (
                          <th
                            key={hi}
                            style={{
                              padding: "12px 16px",
                              textAlign: "left",
                              fontWeight: 600,
                              fontSize: 11,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "var(--text-muted)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.map((p, i) => (
                        <tr
                          key={`row-${i}`}
                          style={{
                            borderBottom: "1px solid var(--border-subtle)",
                            background:
                              i % 2 === 0
                                ? "transparent"
                                : "rgba(253, 242, 248, 0.3)",
                            transition: "background 0.2s ease",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(236, 72, 153, 0.06)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              i % 2 === 0
                                ? "transparent"
                                : "rgba(253, 242, 248, 0.3)")
                          }
                          onClick={() => setSelectedPatient(p)}
                        >
                          {/* Patient ID */}
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--accent-violet)",
                                background: "rgba(236,72,153,0.07)",
                                padding: "3px 8px",
                                borderRadius: 6,
                              }}
                            >
                              {p.patient_id}
                            </span>
                          </td>

                          {/* Age / Gender */}
                          <td
                            style={{
                              padding: "14px 16px",
                              fontWeight: 500,
                              color: "var(--text-primary)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.age}yo {p.gender}
                          </td>

                          {/* Primary Diagnosis */}
                          <td
                            style={{
                              padding: "14px 16px",
                              color: "var(--text-secondary)",
                              maxWidth: 220,
                            }}
                          >
                            {p.primary_diagnosis}
                          </td>

                          {/* Length of Stay */}
                          <td
                            style={{
                              padding: "14px 16px",
                              fontFamily: "var(--font-mono)",
                              fontSize: 13,
                              color: "var(--text-secondary)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.length_of_stay}d
                          </td>

                          {/* Severity */}
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "4px 10px",
                                borderRadius: 100,
                                fontSize: 12,
                                fontWeight: 600,
                                color: getSeverityColor(p.severity_level),
                                background: `${getSeverityColor(p.severity_level)}15`,
                                border: `1px solid ${getSeverityColor(
                                  p.severity_level
                                )}30`,
                                whiteSpace: "nowrap",
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: getSeverityColor(p.severity_level),
                                  flexShrink: 0,
                                }}
                              />
                              {p.severity_level}
                            </span>
                          </td>

                          {/* Prediction */}
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "6px 14px",
                                borderRadius: 100,
                                fontSize: 13,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                color:
                                  p.prediction === "Readmitted"
                                    ? "#ef4444"
                                    : "#22c55e",
                                background:
                                  p.prediction === "Readmitted"
                                    ? "rgba(239, 68, 68, 0.1)"
                                    : "rgba(34, 197, 94, 0.1)",
                                border: `1px solid ${
                                  p.prediction === "Readmitted"
                                    ? "rgba(239, 68, 68, 0.25)"
                                    : "rgba(34, 197, 94, 0.25)"
                                }`,
                              }}
                            >
                              {p.prediction === "Readmitted" ? (
                                <AlertTriangle size={13} />
                              ) : (
                                <CheckCircle2 size={13} />
                              )}
                              {p.prediction}
                            </span>
                          </td>

                          {/* Confidence */}
                          <td style={{ padding: "14px 16px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 52,
                                  height: 6,
                                  borderRadius: 3,
                                  background: "rgba(236, 72, 153, 0.12)",
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                <div
                                  style={{
                                    width: `${p.confidence}%`,
                                    height: "100%",
                                    borderRadius: 3,
                                    background:
                                      p.confidence >= 80
                                        ? "var(--gradient-primary)"
                                        : p.confidence >= 50
                                        ? "#eab308"
                                        : "#94a3b8",
                                    transition: "width 0.6s ease",
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {p.confidence}%
                              </span>
                            </div>
                          </td>

                          {/* View Graph button */}
                          <td style={{ padding: "14px 16px" }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedPatient(p); }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "5px 12px",
                                borderRadius: 100,
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: "pointer",
                                color: "var(--accent-violet)",
                                background: "rgba(236,72,153,0.08)",
                                border: "1px solid rgba(236,72,153,0.2)",
                                whiteSpace: "nowrap",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(236,72,153,0.18)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(236,72,153,0.08)")}
                            >
                              <Network size={11} />
                              Graph
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Knowledge Graph Modal */}
        <AnimatePresence>
          {selectedPatient && (
            <KnowledgeGraph
              patient={selectedPatient}
              onClose={() => setSelectedPatient(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}