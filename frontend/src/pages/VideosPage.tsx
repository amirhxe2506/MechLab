import React from "react"

export default function VideosPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Header */}
      <div 
        className="mb-12"
        style={{
          background: "var(--color-card)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--color-border)",
          borderRadius: 24,
          padding: "40px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)"
        }}
      >
        <div className="text-[11px] font-mono text-primary tracking-widest mb-2.5 uppercase">
          Video Library
        </div>
        <h1 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold text-foreground mb-3 tracking-tight">
          Lectures & Archives
        </h1>
        <p className="text-[15px] text-muted-foreground m-0 max-w-xl">
          Recorded lectures, course archives, and practical demonstrations will be available here.
        </p>
      </div>

      {/* Empty State */}
      <div 
        className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-dashed border-border"
        style={{ backgroundColor: "var(--bg-card-sub)" }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-muted-foreground)"
          strokeWidth="1.5"
          className="mb-4 opacity-50"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
          <path d="M10 8l6 4-6 4V8z" />
        </svg>
        <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          We are currently organizing our video library. Check back later for high-quality engineering lectures and tutorials.
        </p>
      </div>
    </div>
  )
}
