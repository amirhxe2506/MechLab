import { Link } from "react-router-dom";

const sections = [
  {
    title: "Platform",
    links: [
      { label: "Learn", href: "/learn" },
      { label: "Engineering Tools", href: "/tools" },
      { label: "Formula Library", href: "/formulas" },
    ],
  },
  {
    title: "Subjects",
    links: [
      { label: "Statics", href: "/learn" },
      { label: "Strength of Materials", href: "/learn" },
      { label: "Fluid Mechanics", href: "/learn" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Stress & Strain", href: "/tools/stress-strain" },
      { label: "Mohr's Circle", href: "/tools/mohrs-circle" },
      { label: "Reynolds Number", href: "/tools/reynolds" },
      { label: "Vibration Analysis", href: "/tools/vibration" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#060b18] border-t border-white/5 pt-14 px-6 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="font-display font-bold text-xl text-slate-200 tracking-tight mb-3">
              Mech<span className="text-blue-500">Lab</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-[260px] m-0">
              A digital engineering workspace for Mechanical Engineering students.
              Learn, calculate, and analyze in one integrated platform.
            </p>
          </div>

          {sections.map((s) => (
            <div key={s.title}>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-600 mb-4">
                {s.title}
              </div>
              <div className="flex flex-col gap-2.5">
                {s.links.map((l) => (
                  <Link
                    key={l.label}
                    to={l.href}
                    className="text-sm text-slate-500 no-underline transition-colors duration-150 hover:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm inline-block w-max"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-6 flex items-center justify-between flex-wrap gap-3">
          <p className="m-0 text-[13px] text-slate-600">
            © {new Date().getFullYear()} MechLab.
          </p>
          <div className="flex gap-6">
            <span className="text-[13px] text-slate-600">
              React + Vite + Python + Django
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
