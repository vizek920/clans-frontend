const CHOICE_LABEL = { split: "شاركني", steal: "اسرقني" };

const OUTCOME_HEADLINE = {
  split_split: "اتفقا وتقاسما المبلغ بالعدل",
  steal_steal: "خانا بعض — وضاع كل شي",
  a_stole: "سرقة! استحوذ على المبلغ كامل",
  b_stole: "سرقة! استحوذ على المبلغ كامل",
};

export default function ResultsView({ state }) {
  const result = state.finalResult;
  if (!result) return null;
  const ids = Object.keys(result.players);

  return (
    <div className="screen">
      <div className="brand">
        <div className="brand-seal">ق</div>
        <div className="brand-title">لعبة القاتل</div>
      </div>

      <h2 style={{ color: "var(--brass)", marginBottom: 6 }}>النتيجة النهائية</h2>
      <p style={{ color: "var(--bone-dim)", marginBottom: 28 }}>
        {OUTCOME_HEADLINE[result.outcome]}
      </p>

      <div className="panel" style={{ maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ color: "var(--bone-dim)", fontSize: 13 }}>إجمالي المبلغ بالجولة النهائية</div>
          <div className="mono" style={{ fontSize: 30, color: "var(--brass)", marginTop: 4 }}>
            {result.pot.toLocaleString("en-US")} $
          </div>
        </div>

        <div className="player-grid">
          {ids.map((id, i) => (
            <div key={id} className="note-card" style={{ textAlign: "center", padding: "18px 10px" }}>
              <div className="note-name" style={{ marginTop: 0 }}>{result.players[id].name}</div>
              <div className="note-status" style={{ marginTop: 6 }}>
                اختار: {CHOICE_LABEL[result.choices[id]]}
              </div>
              <div
                className="mono"
                style={{
                  marginTop: 10,
                  fontSize: 18,
                  fontWeight: 700,
                  color: result.payout[id] > 0 ? "var(--brass)" : "var(--blood-bright)",
                }}
              >
                {result.payout[id].toLocaleString("en-US")} $
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
