import { useState } from "react";
import { Link } from "react-router-dom";

// ─── Data ──────────────────────────────────────────────────────────────────────

const courses = [
  {
    id: "statics",
    title: "Statics",
    subtitle: "ME 201",
    description: "Analysis of forces and moments acting on rigid bodies in equilibrium. Foundations for all structural analysis.",
    accent: "#3b82f6",
    topics: 23,
    chapters: [
      {
        title: "Force Systems",
        topics: ["Scalar and Vector Quantities", "Force Resultants", "Moment of a Force", "Couple and Equivalent Systems"],
      },
      {
        title: "Equilibrium of Bodies",
        topics: ["Free Body Diagrams", "2D Equilibrium Equations", "3D Equilibrium", "Constraints and Reactions"],
      },
      {
        title: "Structural Analysis",
        topics: ["Simple Trusses", "Method of Joints", "Method of Sections", "Frames and Machines"],
      },
      {
        title: "Friction",
        topics: ["Dry Friction", "Wedges", "Screws", "Belt Friction"],
      },
      {
        title: "Centroids and Moments of Inertia",
        topics: ["Centroid of Areas", "Moment of Inertia", "Parallel Axis Theorem", "Composite Bodies"],
      },
    ],
  },
  {
    id: "som",
    title: "Strength of Materials",
    subtitle: "ME 301",
    description: "Mechanics of deformable solids. Stress, strain, and failure criteria for structural members under loading.",
    accent: "#f59e0b",
    topics: 31,
    chapters: [
      {
        title: "Stress and Strain",
        topics: ["Normal Stress and Strain", "Shear Stress and Strain", "Mechanical Properties", "Axial Deformation"],
      },
      {
        title: "Torsion",
        topics: ["Torsional Shear Stress", "Angle of Twist", "Statically Indeterminate Shafts"],
      },
      {
        title: "Bending",
        topics: ["Pure Bending", "Transverse Loading", "Bending Stress", "Shear Stress in Beams"],
      },
      {
        title: "Stress Transformation",
        topics: ["Plane Stress", "Principal Stresses", "Mohr's Circle for Stress", "Maximum Shear Stress"],
      },
      {
        title: "Deflection of Beams",
        topics: ["Elastic Curve Equation", "Moment-Area Method", "Castigliano's Theorem"],
      },
      {
        title: "Columns",
        topics: ["Euler's Formula", "Effective Length", "Secant Formula"],
      },
      {
        title: "Failure Criteria",
        topics: ["Von Mises Criterion", "Tresca Criterion", "Fatigue and Fracture Basics"],
      },
    ],
  },
  {
    id: "fluids",
    title: "Fluid Mechanics",
    subtitle: "ME 401",
    description: "Behavior of fluids at rest and in motion. From fluid statics to pipe flow and the Navier-Stokes equations.",
    accent: "#06b6d4",
    topics: 19,
    chapters: [
      {
        title: "Fluid Properties",
        topics: ["Density and Specific Weight", "Viscosity", "Surface Tension", "Compressibility"],
      },
      {
        title: "Fluid Statics",
        topics: ["Pressure Distribution", "Manometry", "Hydrostatic Forces", "Buoyancy"],
      },
      {
        title: "Fluid Kinematics",
        topics: ["Velocity Field", "Streamlines", "Continuity Equation", "Reynolds Transport Theorem"],
      },
      {
        title: "Energy Equation",
        topics: ["Bernoulli Equation", "Energy Line and HGL", "Pump and Turbine Work"],
      },
    ],
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const [active, setActive] = useState("statics");
  const [expanded, setExpanded] = useState<string[]>([]);

  const course = courses.find((c) => c.id === active)!;

  const toggleChapter = (title: string) => {
    setExpanded((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px" }}>
      {/* Page header */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#3b82f6", letterSpacing: "0.1em", marginBottom: 10 }}>
          LEARNING PLATFORM
        </div>
        <h1
          style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            fontWeight: 700,
            color: "#f1f5f9",
            margin: "0 0 12px",
            letterSpacing: "-0.03em",
          }}
        >
          Engineering Courses
        </h1>
        <p style={{ fontSize: 15, color: "#475569", margin: 0 }}>
          Structured courses with chapters, topics, and integrated calculators.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
        {/* Sidebar: course list */}
        <aside>
          <div
            style={{
              backgroundColor: "#0c1528",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontSize: 11,
                fontFamily: "JetBrains Mono, monospace",
                color: "#334155",
                letterSpacing: "0.06em",
              }}
            >
              COURSES
            </div>
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setActive(c.id);
                  setExpanded([]);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "14px 16px",
                  backgroundColor: active === c.id ? `${c.accent}10` : "transparent",
                  border: "none",
                  borderLeft: active === c.id ? `3px solid ${c.accent}` : "3px solid transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (active !== c.id)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.02)";
                }}
                onMouseLeave={(e) => {
                  if (active !== c.id)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: active === c.id ? "#e2e8f0" : "#64748b",
                      fontFamily: "DM Sans, system-ui, sans-serif",
                    }}
                  >
                    {c.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#334155", fontFamily: "JetBrains Mono, monospace", marginTop: 2 }}>
                    {c.subtitle}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "#334155", fontFamily: "JetBrains Mono, monospace" }}>
                  {c.topics} topics
                </span>
              </button>
            ))}
          </div>

          {/* Quick links */}
          <div
            style={{
              backgroundColor: "#0c1528",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 12 }}>
              RELATED TOOLS
            </div>
            {[
              { label: "Stress & Strain Calculator", href: "/tools/stress-strain" },
              { label: "Mohr's Circle", href: "/tools/mohrs-circle" },
              { label: "Reynolds Number", href: "/tools/reynolds" },
              { label: "Vibration Analysis", href: "/tools/vibration" },
            ].map((l) => (
              <Link
                key={l.href}
                to={l.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  color: "#64748b",
                  textDecoration: "none",
                  fontSize: 13,
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "#3b82f6")}
                onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "#64748b")}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
                {l.label}
              </Link>
            ))}
          </div>
        </aside>

        {/* Main: course content */}
        <div>
          {/* Course header */}
          <div
            style={{
              backgroundColor: "#0c1528",
              border: "1px solid rgba(255,255,255,0.07)",
              borderTop: `2px solid ${course.accent}`,
              borderRadius: 10,
              padding: 28,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: course.accent, letterSpacing: "0.06em", marginBottom: 8 }}>
                  {course.subtitle}
                </div>
                <h2
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#f1f5f9",
                    margin: "0 0 10px",
                    letterSpacing: "-0.025em",
                  }}
                >
                  {course.title}
                </h2>
                <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.65, maxWidth: 540 }}>
                  {course.description}
                </p>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 22, fontWeight: 600, color: "#e2e8f0" }}>
                    {course.chapters.length}
                  </div>
                  <div style={{ fontSize: 11, color: "#334155" }}>Chapters</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 22, fontWeight: 600, color: "#e2e8f0" }}>
                    {course.topics}
                  </div>
                  <div style={{ fontSize: 11, color: "#334155" }}>Topics</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {course.chapters.map((chapter, ci) => {
              const isOpen = expanded.includes(chapter.title);
              return (
                <div
                  key={chapter.title}
                  style={{
                    backgroundColor: "#0c1528",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => toggleChapter(chapter.title)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "16px 20px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 11,
                          color: course.accent,
                          backgroundColor: `${course.accent}12`,
                          border: `1px solid ${course.accent}25`,
                          padding: "2px 7px",
                          borderRadius: 4,
                          minWidth: 32,
                          textAlign: "center",
                        }}
                      >
                        {String(ci + 1).padStart(2, "0")}
                      </span>
                      <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>
                        {chapter.title}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "#334155" }}>{chapter.topics.length} topics</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#475569"
                        strokeWidth="2"
                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "8px 0" }}>
                      {chapter.topics.map((topic) => (
                        <div
                          key={topic}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            padding: "10px 20px 10px 60px",
                            cursor: "pointer",
                            transition: "background-color 0.15s ease",
                            borderBottom: "1px solid rgba(255,255,255,0.03)",
                          }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(255,255,255,0.02)")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent")}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              backgroundColor: "rgba(255,255,255,0.12)",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 14, color: "#64748b" }}>{topic}</span>
                          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                            <span
                              style={{
                                fontSize: 10,
                                fontFamily: "JetBrains Mono, monospace",
                                padding: "2px 6px",
                                borderRadius: 3,
                                backgroundColor: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                color: "#334155",
                              }}
                            >
                              Topic
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expand all helper */}
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button
              onClick={() => setExpanded(course.chapters.map((c) => c.title))}
              style={{
                padding: "7px 14px",
                fontSize: 12,
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 6,
                color: "#64748b",
                cursor: "pointer",
              }}
            >
              Expand All
            </button>
            <button
              onClick={() => setExpanded([])}
              style={{
                padding: "7px 14px",
                fontSize: 12,
                backgroundColor: "transparent",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 6,
                color: "#475569",
                cursor: "pointer",
              }}
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
