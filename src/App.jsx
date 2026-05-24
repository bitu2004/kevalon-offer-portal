import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import WelcomePage from "./pages/WelcomePage";
import RequestForm from "./pages/RequestForm";
import DownloadSection from "./pages/DownloadSection";
import TrackStatus from "./pages/TrackStatus";
import AdminPanel from "./pages/AdminPanel";
import VerifyPage from "./pages/VerifyPage";
import ContactPage from "./pages/ContactPage";

export default function App() {
  const [page, setPage] = useState(() => {
    // Auto-open verify page if URL has ?verify= param
    const params = new URLSearchParams(window.location.search);
    if (params.get("verify")) return "verify";
    return "home";
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page]);

  // Admin panel gets full screen (no navbar)
  if (page === "admin") return <AdminPanel onNavigate={setPage} />;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar page={page} onNavigate={setPage} />
      <div style={{ flex: 1 }}>
        {page === "home"     && <WelcomePage onNavigate={setPage} />}
        {page === "request"  && <RequestForm onNavigate={setPage} />}
        {page === "track"    && <TrackStatus onNavigate={setPage} />}
        {page === "download" && <DownloadSection onNavigate={setPage} />}
        {page === "verify"   && <VerifyPage />}
        {page === "contact"  && <ContactPage />}
      </div>
    </div>
  );
}
