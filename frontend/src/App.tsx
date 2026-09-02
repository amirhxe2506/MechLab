import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LearnPage from "./pages/LearnPage";
import ToolsPage from "./pages/ToolsPage";
import FormulasPage from "./pages/FormulasPage";
import StressStrainPage from "./pages/tools/StressStrainPage";
import MohrsCirclePage from "./pages/tools/MohrsCirclePage";
import ReynoldsPage from "./pages/tools/ReynoldsPage";
import VibrationPage from "./pages/tools/VibrationPage";
import BeamPage from "./pages/tools/BeamPage";
import BernoulliPage from "./pages/tools/BernoulliPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#060b18", color: "#cbd5e1" }}>
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
            <Route path="/formulas" element={<FormulasPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}
