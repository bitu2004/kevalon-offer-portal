/**
 * Returns the best URL for QR codes — must be a real http:// URL
 * so phone cameras auto-open the browser.
 *
 * Uses VITE_NETWORK_IP (your WiFi IP) so any phone on the same
 * network can scan and open the verify page directly.
 *
 * For production: set VITE_PUBLIC_URL to your deployed domain.
 */
export function getBaseUrl() {
  // Production / deployed domain takes priority
  const publicUrl = import.meta.env.VITE_PUBLIC_URL;
  if (publicUrl && !publicUrl.includes("loca.lt")) {
    return publicUrl.replace(/\/$/, "");
  }

  // Local network IP — works for any phone on same WiFi
  const networkIp = import.meta.env.VITE_NETWORK_IP;
  if (networkIp) {
    return `http://${networkIp}:5173`;
  }

  // Fallback (only works on same machine)
  return window.location.origin;
}
