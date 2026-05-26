import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WelcomePage from "./pages/WelcomePage";
import RequestForm from "./pages/RequestForm";
import TrackDownload from "./pages/TrackDownload";
import AdminPanel from "./pages/AdminPanel";
import VerifyPage from "./pages/VerifyPage";
import ContactPage from "./pages/ContactPage";

export default function App() {
  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verify")) return "verify";
    return "home";
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page]);

  if (page === "admin") return <AdminPanel onNavigate={setPage} />;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar page={page} onNavigate={setPage} />
      <div style={{ flex: 1 }}>
        {page === "home"     && <WelcomePage onNavigate={setPage} />}
        {page === "request"  && <RequestForm onNavigate={setPage} />}
        {(page === "track" || page === "download") && <TrackDownload onNavigate={setPage} />}
        {page === "verify"   && <VerifyPage />}
        {page === "contact"  && <ContactPage />}
      </div>
      <Footer />
    </div>
  );
}
