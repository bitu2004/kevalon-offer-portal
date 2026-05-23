export default function Select({ label, error, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</label>
      <select
        {...props}
        style={{
          padding: "11px 14px",
          borderRadius: 10,
          border: `2px solid ${error ? "#fca5a5" : "#e2e8f0"}`,
          fontSize: 14,
          background: "#fff",
          color: "#0f172a",
          outline: "none",
          transition: "border-color 0.2s",
          fontFamily: "'Inter', sans-serif",
          cursor: "pointer",
        }}
        onFocus={e => { e.target.style.borderColor = error ? "#fca5a5" : "#1a56db"; }}
        onBlur={e => { e.target.style.borderColor = error ? "#fca5a5" : "#e2e8f0"; }}
      >
        {children}
      </select>
      {error && (
        <span style={{ fontSize: 12, color: "#dc2626", display: "flex", alignItems: "center", gap: 4 }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}
