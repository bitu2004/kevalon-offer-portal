export default function Badge({ status }) {
  const map = {
    pending:  { color: "#92400e", bg: "#fef3c7", border: "#fcd34d", dot: "#f59e0b" },
    approved: { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", dot: "#10b981" },
    rejected: { color: "#991b1b", bg: "#fee2e2", border: "#fca5a5", dot: "#ef4444" },
  };
  const s = map[status] || { color: "#374151", bg: "#f3f4f6", border: "#d1d5db", dot: "#9ca3af" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 12, padding: "4px 10px", borderRadius: 20,
      background: s.bg, color: s.color, fontWeight: 700,
      border: `1px solid ${s.border}`, textTransform: "capitalize",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}
