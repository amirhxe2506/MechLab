import { Link } from "react-router-dom"

const sections: { title: string; links: { label: string; href: string }[]; extras?: string[] }[] = [
  {
    title: "Platform",

    links: [
      { label: "Learn", href: "/learn" },

      { label: "Engineering Tools", href: "/tools" },

      { label: "Formula Library", href: "/formulas" },

      { label: "Video Library", href: "/videos" },
    ],
  },

  {
    title: "Subjects",

    links: [
      { label: "All Subjects", href: "/learn" },
    ],
    extras: ["Statics", "Strength of Materials", "Fluid Mechanics"],
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
]

export default function Footer() {
  return (
    <footer 
      className="border-t border-border pt-14 px-6 pb-8 mt-auto transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="font-display font-bold text-xl text-foreground tracking-tight mb-3">
              Mech<span className="text-primary">Lab</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[260px] m-0">
              A digital engineering workspace for Mechanical Engineering
              students. Learn, calculate, and analyze in one integrated
              platform.
            </p>
          </div>

          {sections.map((s) => (
            <div key={s.title}>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mb-4">
                {s.title}
              </div>
              <div className="flex flex-col gap-2.5">
                {s.links.map((l) => (
                  <Link
                    key={l.label}
                    to={l.href}
                    className="text-sm text-muted-foreground no-underline transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm inline-block w-max"
                  >
                    {l.label}
                  </Link>
                ))}
                {s.extras?.map((name) => (
                  <span
                    key={name}
                    className="text-sm text-muted-foreground/60"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex items-center justify-between flex-wrap gap-3">
          <p className="m-0 text-[13px] text-muted-foreground">
            © {new Date().getFullYear()} MechLab.
          </p>
          <div className="flex gap-6">
            <span className="text-[13px] text-muted-foreground">
              React + Vite + Python + Django
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
