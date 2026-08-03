import { socket } from "../socket.js";

export default function FinalRound({ code, state }) {
  const finalists = state.finalPlayers
    .map((id) => state.players.find((p) => p.id === id))
    .filter(Boolean);
  const iAmFinalist = state.finalPlayers.includes(socket.id);
  const iSubmitted = state.finalSubmitted.includes(socket.id);

  function choose(choice) {
    socket.emit("cast_final_choice", { code, choice }, () => {});
  }

  return (
    <div className="screen">
      <div className="brand">
        <div className="brand-seal">ق</div>
        <div className="brand-title">لعبة القاتل</div>
      </div>

      <h2 style={{ color: "var(--brass)", marginBottom: 6 }}>الجولة الحاسمة</h2>
      <p style={{ color: "var(--bone-dim)", marginBottom: 28, textAlign: "center", maxWidth: 380 }}>
        وصل {finalists.map((f) => f.name).join(" و ")} للنهائي — قرار سرّي: شاركني أو اسرقني
      </p>

      <div className="panel" style={{ maxWidth: 480 }}>
        <div className="player-grid" style={{ marginBottom: 22 }}>
          {finalists.map((p, i) => (
            <div key={p.id} className="note-card" style={{ textAlign: "center", padding: "20px 10px" }}>
              <div className="note-name" style={{ marginTop: 0 }}>
                {p.name} {p.id === socket.id && <span style={{ color: "var(--bone-dim)" }}>(أنت)</span>}
              </div>
              <div className="note-status" style={{ marginTop: 8 }}>
                {state.finalSubmitted.includes(p.id) ? "✓ اختار" : "بينتظر..."}
              </div>
            </div>
          ))}
        </div>

        {iAmFinalist && !iSubmitted && (
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-primary" style={{ background: "var(--brass)" }} onClick={() => choose("split")}>
              شاركني
            </button>
            <button
              className="btn-primary"
              style={{ background: "linear-gradient(180deg, var(--blood-bright), var(--blood))" }}
              onClick={() => choose("steal")}
            >
              اسرقني
            </button>
          </div>
        )}

        {iAmFinalist && iSubmitted && (
          <p style={{ textAlign: "center", color: "var(--bone-dim)" }}>
            اخترت — بننتظر الطرف الثاني يقرر
          </p>
        )}

        {!iAmFinalist && (
          <p style={{ textAlign: "center", color: "var(--bone-dim)" }}>
            أنت مُقصى — انتظر النتيجة النهائية
          </p>
        )}
      </div>
    </div>
  );
}
