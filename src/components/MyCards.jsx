export default function MyCards({ cards = [] }) {
  if (!cards.length) return null;
  return (
    <div style={{ width: "100%", marginBottom: 26 }}>
      <h3 style={{ fontSize: 15, color: "var(--brass)", marginBottom: 12 }}>
        كروتك (سرّية — أنت بس تشوفها)
      </h3>
      <div className="player-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>
        {cards.map((card, i) => (
          <div
            key={i}
            className="note-card"
            style={{
              textAlign: "center",
              padding: "18px 8px",
              borderColor: card.isKiller ? "var(--blood-bright)" : undefined,
              boxShadow: card.isKiller ? "0 0 18px rgba(139,26,26,0.35)" : undefined,
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: card.isKiller ? 15 : 18,
                fontWeight: 700,
                color: card.isKiller ? "var(--blood-bright)" : "var(--brass)",
              }}
            >
              {card.isKiller ? "☠ القاتل" : `${card.value.toLocaleString("en-US")} $`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
