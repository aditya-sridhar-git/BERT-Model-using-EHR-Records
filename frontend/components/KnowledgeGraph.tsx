"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { X, Loader2, AlertTriangle, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ─────────────────────────────────────────────────────────────── */
interface GraphNode {
  id: string;
  type: "patient" | "diagnosis" | "symptom" | "precaution" | "readmission" | "attribute";
  label: string;
}
interface GraphEdge { source: string; target: string; relation: string; }
interface GraphData  { nodes: GraphNode[]; edges: GraphEdge[]; patient_id: string; }
interface PatientRecord {
  patient_id: string; admission_id: string; primary_diagnosis: string;
  age: string; gender: string; length_of_stay: string;
  severity_level: string; prediction: string; confidence: number;
}

/* ── Design tokens ─────────────────────────────────────────────────────── */
const COLORS: Record<string, { fill: string; stroke: string }> = {
  patient:     { fill: "#7c3aed", stroke: "#c4b5fd" },
  diagnosis:   { fill: "#db2777", stroke: "#f9a8d4" },
  symptom:     { fill: "#ea580c", stroke: "#fdba74" },
  precaution:  { fill: "#16a34a", stroke: "#86efac" },
  readmission: { fill: "#dc2626", stroke: "#fca5a5" },
  attribute:   { fill: "#0284c7", stroke: "#7dd3fc" },
};

// Radius is based on label length so text fits
function nodeRadius(type: string, label: string): number {
  const base: Record<string, number> = {
    patient: 38, diagnosis: 34, symptom: 28, precaution: 28, readmission: 32, attribute: 24,
  };
  const b = base[type] ?? 26;
  // Grow radius if label is long
  const words = label.split(" ");
  const longest = Math.max(...words.map(w => w.length));
  return Math.max(b, longest * 4.2);
}

/* ── Multi-line SVG text ───────────────────────────────────────────────── */
function NodeText({ label, x, y, type }: { label: string; x: number; y: number; type: string }) {
  const fontSize = type === "patient" ? 11 : type === "diagnosis" ? 10 : 9;
  const lineH    = fontSize + 3;
  const words    = label.split(" ");

  // Pack words into lines of max ~12 chars
  const lines: string[] = [];
  let cur = "";
  words.forEach(w => {
    const test = cur ? `${cur} ${w}` : w;
    if (test.length > 12 && cur) { lines.push(cur); cur = w; }
    else cur = test;
  });
  if (cur) lines.push(cur);

  const totalH = (lines.length - 1) * lineH;
  return (
    <text
      textAnchor="middle"
      fontSize={fontSize}
      fontWeight={type === "patient" ? 700 : 500}
      fill="#fff"
      style={{ pointerEvents: "none", userSelect: "none", fontFamily: "system-ui, sans-serif" }}
    >
      {lines.map((ln, i) => (
        <tspan key={i} x={x} y={y - totalH / 2 + i * lineH}>
          {ln}
        </tspan>
      ))}
    </text>
  );
}

/* ── Force layout (synchronous, memoised) ──────────────────────────────── */
function useForceLayout(nodes: GraphNode[], edges: GraphEdge[], W: number, H: number) {
  return useMemo(() => {
    if (!nodes.length) return {} as Record<string, { x: number; y: number }>;
    const pos: Record<string, { x: number; y: number; vx: number; vy: number }> = {};
    nodes.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / nodes.length;
      pos[n.id] = { x: W / 2 + Math.min(W, H) * 0.28 * Math.cos(angle), y: H / 2 + Math.min(W, H) * 0.28 * Math.sin(angle), vx: 0, vy: 0 };
    });
    const em = edges.map(e => ({ s: e.source, t: e.target }));
    const IDEAL = 130, REPEL = 5000, DAMP = 0.65;
    for (let it = 0; it < 300; it++) {
      const ids = Object.keys(pos);
      for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
        const a = pos[ids[i]], b = pos[ids[j]];
        const dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = REPEL / (d * d), fx = (dx / d) * f, fy = (dy / d) * f;
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
      }
      em.forEach(({ s, t }) => {
        const a = pos[s], b = pos[t]; if (!a || !b) return;
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - IDEAL) * 0.04, fx = (dx / d) * f, fy = (dy / d) * f;
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
      });
      ids.forEach(id => {
        pos[id].vx += (W / 2 - pos[id].x) * 0.004;
        pos[id].vy += (H / 2 - pos[id].y) * 0.004;
        pos[id].x = Math.max(55, Math.min(W - 55, pos[id].x + pos[id].vx));
        pos[id].y = Math.max(55, Math.min(H - 55, pos[id].y + pos[id].vy));
        pos[id].vx *= DAMP; pos[id].vy *= DAMP;
      });
    }
    return Object.fromEntries(Object.entries(pos).map(([k, v]) => [k, { x: v.x, y: v.y }]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);
}

/* ── Component ──────────────────────────────────────────────────────────── */
export default function KnowledgeGraph({ patient, onClose }: { patient: PatientRecord; onClose: () => void }) {
  const [graph, setGraph]     = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const W = 680, H = 400;

  useEffect(() => {
    setLoading(true); setError(null);
    fetch("http://localhost:8000/knowledge-graph", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patient),
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d  => { setGraph(d); setLoading(false); })
      .catch(() => { setError("Backend unreachable — is it running?"); setLoading(false); });
  }, [patient]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const nodes = useMemo(() => graph?.nodes ?? [], [graph]);
  const edges = useMemo(() => graph?.edges ?? [], [graph]);
  const pos   = useForceLayout(nodes, edges, W, H);
  const gp    = (id: string) => pos[id] ?? { x: W / 2, y: H / 2 };

  const hovNode  = useMemo(() => nodes.find(n => n.id === hovered) ?? null, [nodes, hovered]);
  const hovEdges = useMemo(() => edges.filter(e => e.source === hovered || e.target === hovered), [edges, hovered]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(10,5,18,0.80)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
        }}
      >
        {/* Modal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1,    y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 740,
            maxHeight: "90vh",
            display: "flex", flexDirection: "column",
            background: "#fff",
            borderRadius: 20,
            border: "1px solid rgba(219,39,119,0.18)",
            boxShadow: "0 24px 72px rgba(124,58,237,0.22), 0 4px 16px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          {/* ── Header (always visible) ── */}
          <div style={{
            flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid rgba(219,39,119,0.1)",
            background: "linear-gradient(135deg,rgba(236,72,153,0.06),rgba(124,58,237,0.04))",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "linear-gradient(135deg,#ec4899,#7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Network size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", lineHeight: 1.2 }}>
                  Knowledge Graph — Patient {patient.patient_id}
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
                  {patient.primary_diagnosis} · {patient.age}yo {patient.gender}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              title="Close (Esc)"
              style={{
                flexShrink: 0,
                width: 30, height: 30,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(219,39,119,0.2)",
                borderRadius: 8, cursor: "pointer",
                background: "rgba(219,39,119,0.06)",
                color: "#94a3b8",
                transition: "all 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(219,39,119,0.15)"; e.currentTarget.style.color = "#db2777"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(219,39,119,0.06)"; e.currentTarget.style.color = "#94a3b8"; }}
            >
              <X size={15} />
            </button>
          </div>

          {/* ── Scrollable body ── */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {/* Legend */}
            <div style={{ flexShrink: 0, display: "flex", gap: 10, flexWrap: "wrap", padding: "10px 18px 0" }}>
              {Object.entries(COLORS).map(([type, c]) => (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#64748b", textTransform: "capitalize" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.fill, flexShrink: 0 }} />
                  {type}
                </div>
              ))}
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 48, color: "#94a3b8", fontSize: 14 }}>
                <Loader2 size={20} style={{ animation: "spin-slow 1s linear infinite" }} />
                Building knowledge graph…
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ margin: 16, display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "rgba(220,38,38,0.07)", borderRadius: 10, border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626", fontSize: 13 }}>
                <AlertTriangle size={15} /> {error}
              </div>
            )}

            {/* Graph SVG */}
            {graph && !loading && (
              <>
                <div style={{ padding: "8px 12px 0", flexShrink: 0 }}>
                  <svg
                    width="100%" viewBox={`0 0 ${W} ${H}`}
                    style={{ display: "block", borderRadius: 12, border: "1px solid rgba(219,39,119,0.1)", background: "rgba(250,245,255,0.5)" }}
                  >
                    <defs>
                      <marker id="kg-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L7,3 z" fill="rgba(148,163,184,0.7)" />
                      </marker>
                    </defs>

                    {/* Edges */}
                    {edges.map((edge, i) => {
                      const sp = gp(edge.source), tp = gp(edge.target);
                      const tn = nodes.find(n => n.id === edge.target);
                      const tr = nodeRadius(tn?.type ?? "attribute", tn?.label ?? "");
                      const dx = tp.x - sp.x, dy = tp.y - sp.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
                      const ex = tp.x - (dx / d) * (tr + 7), ey = tp.y - (dy / d) * (tr + 7);
                      const isHov = hovered === edge.source || hovered === edge.target;
                      return (
                        <g key={i}>
                          <line x1={sp.x} y1={sp.y} x2={ex} y2={ey}
                            stroke={isHov ? "rgba(219,39,119,0.6)" : "rgba(148,163,184,0.3)"}
                            strokeWidth={isHov ? 2 : 1}
                            markerEnd="url(#kg-arrow)"
                          />
                          {isHov && (
                            <text x={(sp.x + tp.x) / 2} y={(sp.y + tp.y) / 2 - 5}
                              textAnchor="middle" fontSize={8} fill="rgba(100,116,139,0.9)"
                              style={{ pointerEvents: "none", fontFamily: "monospace" }}>
                              {edge.relation.replace(/_/g, " ")}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Nodes */}
                    {nodes.map(node => {
                      const p   = gp(node.id);
                      const c   = COLORS[node.type] ?? COLORS.attribute;
                      const r   = nodeRadius(node.type, node.label);
                      const isHov = hovered === node.id;
                      return (
                        <g key={node.id}
                          onMouseEnter={() => setHovered(node.id)}
                          onMouseLeave={() => setHovered(null)}
                          style={{ cursor: "pointer" }}
                        >
                          {isHov && <circle cx={p.x} cy={p.y} r={r + 7} fill="none" stroke={c.fill} strokeWidth={1.5} opacity={0.25} />}
                          <circle cx={p.x} cy={p.y} r={r}
                            fill={c.fill} stroke={c.stroke}
                            strokeWidth={isHov ? 2 : 1.2}
                            style={{ filter: isHov ? `drop-shadow(0 0 6px ${c.fill}aa)` : "none" }}
                          />
                          <NodeText label={node.label} x={p.x} y={p.y} type={node.type} />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* ── Tooltip bar — always shown, changes on hover ── */}
                <div style={{
                  flexShrink: 0,
                  margin: "10px 12px 14px",
                  padding: "10px 14px",
                  minHeight: 52,
                  borderRadius: 10,
                  background: hovNode ? "rgba(219,39,119,0.05)" : "rgba(241,245,249,0.7)",
                  border: `1px solid ${hovNode ? "rgba(219,39,119,0.18)" : "rgba(226,232,240,0.8)"}`,
                  transition: "all 0.2s",
                }}>
                  {hovNode ? (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[hovNode.type]?.fill, flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e" }}>{hovNode.label}</span>
                        <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", background: "rgba(0,0,0,0.05)", padding: "1px 6px", borderRadius: 100 }}>
                          {hovNode.type}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {hovEdges.map((e, i) => (
                          <span key={i} style={{ fontSize: 10, color: "#64748b", background: "rgba(0,0,0,0.04)", padding: "2px 8px", borderRadius: 100, fontFamily: "monospace" }}>
                            {e.relation.replace(/_/g, " ")} → {e.source === hovered ? e.target : e.source}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", height: "100%" }}>
                      Hover over a node to see its relationships
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
