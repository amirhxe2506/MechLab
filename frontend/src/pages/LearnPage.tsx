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
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Page header */}
      <div className="mb-12">
        <div className="text-[11px] font-mono text-blue-500 tracking-widest mb-2.5">
          LEARNING PLATFORM
        </div>
        <h1 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold text-slate-100 mb-3 tracking-tight">
          Engineering Courses
        </h1>
        <p className="text-[15px] text-slate-600 m-0">
          Structured courses with chapters, topics, and integrated calculators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Sidebar: course list */}
        <aside>
          <div className="bg-[#0c1528] border border-white/5 rounded-xl overflow-hidden mb-4">
            <div className="py-3 px-4 border-b border-white/5 text-[11px] font-mono text-slate-600 tracking-wider">
              COURSES
            </div>
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setActive(c.id);
                  setExpanded([]);
                }}
                className="w-full text-left py-3.5 px-4 bg-transparent border-none border-l-4 cursor-pointer flex items-center justify-between border-b border-white/5 transition-colors focus:outline-none"
                style={{
                  borderLeftColor: active === c.id ? c.accent : "transparent",
                  backgroundColor: active === c.id ? `${c.accent}15` : "transparent",
                }}
              >
                <div>
                  <div className={`text-sm font-semibold font-display ${active === c.id ? 'text-slate-200' : 'text-slate-500 hover:text-slate-400'}`}>
                    {c.title}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                    {c.subtitle}
                  </div>
                </div>
                <span className="text-[11px] text-slate-600 font-mono">
                  {c.topics} topics
                </span>
              </button>
            ))}
          </div>

          {/* Quick links */}
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-4">
            <div className="text-[11px] font-mono text-slate-600 tracking-wider mb-3">
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
                className="flex items-center gap-2 py-2 border-b border-white/5 text-slate-500 hover:text-blue-500 no-underline text-[13px] transition-colors"
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
            className="bg-[#0c1528] border border-white/5 rounded-xl p-7 mb-5"
            style={{ borderTop: `2px solid ${course.accent}` }}
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="text-[11px] font-mono tracking-wider mb-2" style={{ color: course.accent }}>
                  {course.subtitle}
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-100 mb-2.5 tracking-tight">
                  {course.title}
                </h2>
                <p className="text-sm text-slate-500 m-0 leading-relaxed max-w-xl">
                  {course.description}
                </p>
              </div>
              <div className="flex gap-5">
                <div className="text-center">
                  <div className="font-mono text-[22px] font-semibold text-slate-200">
                    {course.chapters.length}
                  </div>
                  <div className="text-[11px] text-slate-600">Chapters</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-[22px] font-semibold text-slate-200">
                    {course.topics}
                  </div>
                  <div className="text-[11px] text-slate-600">Topics</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div className="flex flex-col gap-2">
            {course.chapters.map((chapter, ci) => {
              const isOpen = expanded.includes(chapter.title);
              return (
                <div
                  key={chapter.title}
                  className="bg-[#0c1528] border border-white/5 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleChapter(chapter.title)}
                    className="w-full text-left py-4 px-5 bg-transparent border-none cursor-pointer flex items-center justify-between gap-3 hover:bg-white/5 transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className="font-mono text-[11px] py-0.5 px-2 rounded min-w-[32px] text-center"
                        style={{
                          color: course.accent,
                          backgroundColor: `${course.accent}12`,
                          border: `1px solid ${course.accent}25`,
                        }}
                      >
                        {String(ci + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-[15px] font-semibold text-slate-200">
                        {chapter.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-600">{chapter.topics.length} topics</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#475569"
                        strokeWidth="2"
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-white/5 py-2">
                      {chapter.topics.map((topic) => (
                        <div
                          key={topic}
                          className="flex items-center gap-3.5 py-2.5 px-5 pl-16 cursor-pointer transition-colors hover:bg-white/5 border-b border-white/5 last:border-0"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white/10 shrink-0" />
                          <span className="text-sm text-slate-500">{topic}</span>
                          <div className="ml-auto flex gap-2">
                            <span className="text-[10px] font-mono py-0.5 px-1.5 rounded bg-white/5 border border-white/10 text-slate-600">
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
          <div className="mt-4 flex gap-2.5">
            <button
              onClick={() => setExpanded(course.chapters.map((c) => c.title))}
              className="py-1.5 px-3.5 text-xs bg-white/5 border border-white/10 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/10 cursor-pointer transition-colors focus:outline-none"
            >
              Expand All
            </button>
            <button
              onClick={() => setExpanded([])}
              className="py-1.5 px-3.5 text-xs bg-transparent border border-white/10 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 cursor-pointer transition-colors focus:outline-none"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
