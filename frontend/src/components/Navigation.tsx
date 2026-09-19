import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { useTheme } from "../context/ThemeContext"

// All searchable tools/pages across the site
const allTools = [
  { label: "Stress & Strain Calculator", href: "/tools/stress-strain", category: "Strength of Materials" },
  { label: "Mohr's Circle", href: "/tools/mohrs-circle", category: "Strength of Materials" },
  { label: "Reynolds Number", href: "/tools/reynolds", category: "Fluid Mechanics" },
  { label: "Vibration Analysis", href: "/tools/vibration", category: "Mechanical Design" },
  { label: "Beam Calculator", href: "/tools/beam", category: "Strength of Materials" },
  { label: "Bernoulli Flow Calculator", href: "/tools/bernoulli", category: "Fluid Mechanics" },
  { label: "Unit Converter", href: "/tools/unit-converter", category: "General" },
  { label: "Engineering Tools", href: "/tools", category: "Tools" },
  { label: "Formula Library", href: "/formulas", category: "Reference" },
  { label: "Video Library", href: "/videos", category: "Learning" },
  { label: "Learn", href: "/learn", category: "Learning" },
]

const navItems = [
  { label: "Learn", href: "/learn" },
  { label: "Tools", href: "/tools" },
  { label: "Formulas", href: "/formulas" },
  { label: "Videos", href: "/videos" },
]

export default function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/")

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setMenuOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  const filteredResults =
    searchQuery.trim().length > 0
      ? allTools.filter(
          (t) =>
            t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : []

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && filteredResults.length > 0) {
      navigate(filteredResults[0].href)
      setSearchQuery("")
      searchRef.current?.blur()
    }
    if (e.key === "Escape") {
      setSearchQuery("")
      searchRef.current?.blur()
    }
  }

  const showResults = searchFocused && searchQuery.trim().length > 0

  return (
    <nav
      className="sticky top-0 z-50 border-b border-black/5 dark:border-white/5 backdrop-blur-md transition-colors duration-300"
      style={{ backgroundColor: "var(--nav-bg)" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center h-[60px] gap-2">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 no-underline shrink-0 group focus-visible:ring-2 focus-visible:ring-blue-500 rounded focus:outline-none"
          >
            <HexLogo />
            <span className="font-display font-bold text-[18px] text-foreground tracking-tight group-hover:text-primary transition-colors">
              Mech
              <span className="text-primary group-hover:text-primary-hover transition-colors">
                Lab
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex gap-0.5 ml-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium no-underline transition-all duration-150 border-b focus-visible:ring-2 focus-visible:ring-ring focus:outline-none ${
                  isActive(item.href)
                    ? "text-foreground bg-primary/10 border-primary/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary border-transparent"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Mobile Search Box (Icon in header) */}
          <div className="flex sm:hidden flex-1 justify-end mr-2 relative">
            <button
              onClick={() => {
                const searchWrapper = document.getElementById("mobile-search-wrapper");
                if (searchWrapper) {
                  searchWrapper.style.display = searchWrapper.style.display === "none" ? "block" : "none";
                  document.getElementById("mobile-search-input")?.focus();
                }
              }}
              className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer rounded focus-visible:ring-2 focus-visible:ring-ring focus:outline-none bg-transparent border-none"
              aria-label="Toggle search"
            >
              <SearchIcon />
            </button>
            <div
              id="mobile-search-wrapper"
              className="absolute top-[40px] right-0 w-[240px] border border-border shadow-lg rounded-lg overflow-hidden"
              style={{ 
                display: "none", 
                zIndex: 100, 
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                backgroundColor: "rgba(var(--dropdown-bg-rgb), 0.92)" 
              }}
            >
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                <SearchIcon />
                <input
                  id="mobile-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search tools..."
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    color: "var(--color-foreground)",
                    fontSize: 13,
                    width: "100%",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              {searchQuery.trim().length > 0 && filteredResults.length > 0 && (
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  {filteredResults.map((r) => (
                    <Link
                      key={r.href}
                      to={r.href}
                      onClick={() => { 
                        setSearchQuery("");
                        const sw = document.getElementById("mobile-search-wrapper");
                        if(sw) sw.style.display = "none";
                      }}
                      className="flex flex-col gap-0.5 px-4 py-2.5 no-underline transition-colors border-b border-border"
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--dropdown-hover-bg)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <span style={{ fontSize: 13, color: "var(--color-foreground)", fontWeight: 500 }}>{r.label}</span>
                      <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>{r.category}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Search Box — always visible, stays in header */}
          <div className="relative hidden sm:block" style={{ width: 240 }}>
            <div
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border text-muted-foreground text-[13px] transition-colors"
              style={{
                borderRadius: 20,
                width: "100%",
                boxSizing: "border-box",
                outline: searchFocused ? "2px solid var(--color-primary)" : "none",
                outlineOffset: 1,
              }}
            >
              <SearchIcon />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search tools..."
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: "var(--color-foreground)",
                  fontSize: 13,
                  width: "100%",
                  fontFamily: "inherit",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "var(--color-muted-foreground)",
                    lineHeight: 1,
                    fontSize: 16,
                  }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            <div
              className="absolute top-full mt-1 left-0 right-0 border border-border shadow-lg overflow-hidden"
              style={{
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                backgroundColor: "rgba(var(--dropdown-bg-rgb), 0.92)",
                borderRadius: 10,
                zIndex: 100,
                minWidth: 240,
                transformOrigin: "top",
                transition: "opacity 0.18s ease, transform 0.18s ease",
                opacity: showResults ? 1 : 0,
                transform: showResults ? "scaleY(1)" : "scaleY(0.95)",
                pointerEvents: showResults ? "auto" : "none",
              }}
            >
              {filteredResults.length > 0 ? (
                filteredResults.map((r) => (
                  <Link
                    key={r.href}
                    to={r.href}
                    onClick={() => { setSearchQuery(""); setSearchFocused(false); }}
                    className="flex items-start gap-2 px-4 py-2.5 no-underline transition-colors"
                    style={{ display: "flex", flexDirection: "column" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--dropdown-hover-bg)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <span style={{ fontSize: 13, color: "var(--color-foreground)", fontWeight: 500 }}>
                      {r.label}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>
                      {r.category}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-3 text-[13px] text-muted-foreground">
                  No results found
                </div>
              )}
            </div>
          </div>

          {/* Right-side menu dropdown — contains theme, workspace, CTA */}
          <div className="relative hidden sm:block ml-2" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <GridIcon />
            </button>

            {/* Dropdown Panel — always mounted, animated via CSS */}
            <div
              className="absolute top-full right-0 mt-2 border border-border shadow-xl overflow-hidden"
              style={{
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                backgroundColor: "rgba(var(--dropdown-bg-rgb), 0.92)",
                borderRadius: 12,
                minWidth: 200,
                zIndex: 100,
                transformOrigin: "top right",
                transition: "opacity 0.18s ease, transform 0.18s ease",
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(-6px)",
                pointerEvents: menuOpen ? "auto" : "none",
              }}
            >
              {/* Theme toggle row */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none bg-transparent"
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--dropdown-hover-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <span className="flex items-center justify-center w-5">
                  {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </span>
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>

              {/* Workspace (disabled) */}
              <div
                className="flex items-center gap-3 px-4 py-3 text-[13px] cursor-not-allowed"
                title="Sign in to save your work"
                style={{
                  color: "var(--color-muted-foreground)",
                  opacity: 0.45,
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <span className="flex items-center justify-center w-5">
                  <WorkspaceIcon />
                </span>
                <div>
                  <div>Workspace</div>
                  <div style={{ fontSize: 11, marginTop: 1 }}>Sign in to save your work</div>
                </div>
              </div>

              {/* CTA */}
              <div className="px-4 py-3">
                <Link
                  to="/tools"
                  className="btn-primary w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-[13px] font-semibold no-underline tracking-tight"
                >
                  Open Tools
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-1.5 bg-transparent border-none text-muted-foreground hover:text-foreground cursor-pointer ml-1 focus-visible:ring-2 focus-visible:ring-ring rounded focus:outline-none"
            aria-label="Toggle menu"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden absolute right-4 top-[60px] w-64 rounded-xl border border-border shadow-2xl overflow-hidden px-5 py-3 pb-5"
          style={{
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            backgroundColor: "rgba(var(--dropdown-bg-rgb), 0.92)",
            zIndex: 100,
            transformOrigin: "top right",
          }}
        >
          {navItems.map((item) => (
            item.disabled ? (
              <div
                key={item.label}
                className="block py-2.5 text-[15px] font-medium border-b border-border cursor-not-allowed"
                title="Sign in to save your work"
                style={{ color: "var(--color-muted-foreground)", opacity: 0.5 }}
              >
                {item.label}
              </div>
            ) : (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-2.5 text-[15px] font-medium no-underline border-b border-border transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            )
          ))}

          {/* Theme toggle for mobile */}
          <button
            onClick={() => {
              toggleTheme();
              setMobileOpen(false);
            }}
            className="w-full flex items-center gap-3 py-3 mt-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none bg-transparent"
            style={{
              textAlign: "left",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <span className="flex items-center justify-center w-5">
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </span>
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <div className="mt-4">
            <Link
              to="/tools"
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-[14px] font-semibold no-underline"
            >
              Open Tools
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Icons ──────────────────────────────────────────────────────────────────────

function HexLogo() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      className="transition-transform group-hover:scale-105 duration-300"
    >
      <rect width="30" height="30" rx="7" fill="var(--primary-soft)" />
      <polygon
        points="15,4 25,9.5 25,20.5 15,26 5,20.5 5,9.5"
        stroke="var(--color-primary)"
        strokeWidth="1.4"
        fill="var(--primary-soft)"
      />
      <circle cx="15" cy="15" r="3" fill="var(--color-primary)" />
      {[
        [15, 5.5],
        [22.5, 9.75],
        [22.5, 20.25],
        [15, 24.5],
        [7.5, 20.25],
        [7.5, 9.75],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill="var(--color-primary)" />
      ))}
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function WorkspaceIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      <path d="M16 21H8" />
      <path d="M12 17v4" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}
