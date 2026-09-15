import { HashRouter, Routes, Route, useLocation } from "react-router-dom"

import { useEffect } from "react"

import Navigation from "./components/Navigation"

import Footer from "./components/Footer"

import HomePage from "./pages/HomePage"

import LearnPage from "./pages/LearnPage"

import ToolsPage from "./pages/ToolsPage"

import FormulasPage from "./pages/FormulasPage"
import VideosPage from "./pages/VideosPage"

import StressStrainPage from "./pages/tools/StressStrainPage"

import MohrsCirclePage from "./pages/tools/MohrsCirclePage"

import ReynoldsPage from "./pages/tools/ReynoldsPage"

import VibrationPage from "./pages/tools/VibrationPage"

import BeamPage from "./pages/tools/BeamPage"

import BernoulliPage from "./pages/tools/BernoulliPage"

import UnitConverterPage from "./pages/tools/UnitConverterPage"

import { ThemeProvider } from "./context/ThemeContext"

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <ScrollToTop />
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--bg-page)",
            color: "var(--text-primary)",
            transition: "background-color 0.3s ease, color 0.3s ease",
          }}
        >
          <Navigation />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tools/stress-strain" element={<StressStrainPage />} />
            <Route path="/tools/mohrs-circle" element={<MohrsCirclePage />} />
            <Route path="/tools/reynolds" element={<ReynoldsPage />} />
            <Route path="/tools/vibration" element={<VibrationPage />} />
            <Route path="/tools/beam" element={<BeamPage />} />
            <Route path="/tools/bernoulli" element={<BernoulliPage />} />
            <Route path="/tools/unit-converter" element={<UnitConverterPage />} />
            <Route path="/formulas" element={<FormulasPage />} />
            <Route path="/videos" element={<VideosPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  </ThemeProvider>
  )
}
