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
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(6, 11, 24, 0.92)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", height: 60, gap: 8 }}>
          {/* Logo */}
          <Link
            to="/"
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}
          >
            <HexLogo />
            <span
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#e2e8f0",
                letterSpacing: "-0.025em",
              }}
            >
              Mech<span style={{ color: "#3b82f6" }}>Lab</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: "flex", gap: 2, marginLeft: 24 }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive(item.href) ? "#e2e8f0" : "#64748b",
                  backgroundColor: isActive(item.href) ? "rgba(59,130,246,0.1)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  borderBottom: isActive(item.href)
                    ? "1px solid rgba(59,130,246,0.5)"
                    : "1px solid transparent",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Search hint */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 6,
              color: "#475569",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <SearchIcon />
            <span style={{ display: "none" }} className="sm:inline">
              Search...
            </span>
          </div>

          {/* CTA */}
          <Link
            to="/tools"
            style={{
              padding: "7px 18px",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              flexShrink: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Open Tools
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              display: "none",
              padding: 6,
              background: "none",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              marginLeft: 4,
            }}
            aria-label="Toggle menu"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            backgroundColor: "#060b18",
            padding: "12px 24px 20px",
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "10px 0",
                fontSize: 15,
                fontWeight: 500,
                color: isActive(item.href) ? "#3b82f6" : "#94a3b8",
                textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
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
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
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
