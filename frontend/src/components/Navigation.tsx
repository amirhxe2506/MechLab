import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const navItems = [
  { label: "Learn", href: "/learn" },
  { label: "Tools", href: "/tools" },
  { label: "Formulas", href: "/formulas" },
];

export default function Navigation() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <nav className="sticky top-0 z-50 bg-[#060b18]/92 border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center h-[60px] gap-2">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 no-underline shrink-0 group focus-visible:ring-2 focus-visible:ring-blue-500 rounded focus:outline-none"
          >
            <HexLogo />
            <span className="font-display font-bold text-[18px] text-slate-200 tracking-tight group-hover:text-white transition-colors">
              Mech<span className="text-blue-500 group-hover:text-blue-400 transition-colors">Lab</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex gap-0.5 ml-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium no-underline transition-all duration-150 border-b focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none ${
                  isActive(item.href)
                    ? "text-slate-200 bg-blue-500/10 border-blue-500/50"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border-transparent"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search hint */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-slate-500 text-[13px] cursor-pointer hover:bg-white/10 hover:text-slate-300 transition-colors">
            <SearchIcon />
            <span>Search...</span>
          </div>

          {/* CTA */}
          <Link
            to="/tools"
            className="btn-primary px-4 py-[7px] bg-blue-500 text-white rounded-md text-[13px] font-semibold no-underline shrink-0 tracking-tight focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none ml-2"
          >
            Open Tools
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-1.5 bg-transparent border-none text-slate-500 hover:text-slate-300 cursor-pointer ml-1 focus-visible:ring-2 focus-visible:ring-blue-500 rounded focus:outline-none"
            aria-label="Toggle menu"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#060b18] px-6 py-3 pb-5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className={`block py-2.5 text-[15px] font-medium no-underline border-b border-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none ${
                isActive(item.href) ? "text-blue-500" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

function HexLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className="transition-transform group-hover:scale-105 duration-300">
      <rect width="30" height="30" rx="7" fill="rgba(59,130,246,0.12)" />
      <polygon
        points="15,4 25,9.5 25,20.5 15,26 5,20.5 5,9.5"
        stroke="#3b82f6"
        strokeWidth="1.4"
        fill="rgba(59,130,246,0.08)"
      />
      <circle cx="15" cy="15" r="3" fill="#3b82f6" />
      {[
        [15, 5.5],
        [22.5, 9.75],
        [22.5, 20.25],
        [15, 24.5],
        [7.5, 20.25],
        [7.5, 9.75],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill="#06b6d4" />
      ))}
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
