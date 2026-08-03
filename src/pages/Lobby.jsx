import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket.js";
import PlayerCard from "../components/PlayerCard.jsx";

export default function Lobby() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(null);

  useEffect(() => {
    function onState(payload) {
      if (payload.code === code) setState(payload);
    }
    socket.on("state_update", onState);

    // لو المستخدم فتح الرابط مباشرة بدون ما يمر بصفحة الدخول
    if (!socket.connected || !state) {
      // لا شيء إضافي مطلوب هنا؛ الانضمام يصير من صفحة Home قبل التنقل
    }

    return () => socket.off("state_update", onState);
  }, [code, state]);

  if (!state) {
    return (
      <div className="screen">
        <div className="brand">
          <div className="brand-seal">ق</div>
          <div className="brand-title">لعبة القاتل</div>
        </div>
        <p className="waiting-dots" style={{ color: "var(--bone-dim)" }}>
          جارٍ الاتصال بالغرفة
        </p>
      </div>
    );
  }

  const isHost = state.hostId === socket.id;
  const connectedCount = state.players.filter((p) => p.connected).length;

  return (
    <div className="screen" style={{ justifyContent: "flex-start", paddingTop: 60 }}>
      <div className="brand">
        <div className="brand-seal">ق</div>
        <div className="brand-title">لعبة القاتل</div>
      </div>

      <div className="room-code">{code}</div>
      <p style={{ color: "var(--bone-dim)", marginTop: 8, marginBottom: 32 }}>
        شارك هذا الكود مع الجميع بالفويس • {connectedCount} لاعب متصل
      </p>

      <div className="panel" style={{ maxWidth: 720 }}>
        <h2 style={{ fontSize: 18, color: "var(--brass)", marginBottom: 18 }}>
          اللاعبون بالغرفة
        </h2>
        <div className="player-grid">
          {state.players.map((p, i) => (
            <PlayerCard key={p.id} player={p} isHost={p.id === state.hostId} index={i} />
          ))}
        </div>

        {isHost ? (
          <button
            className="btn-primary"
            style={{ marginTop: 26 }}
            disabled={connectedCount < 3}
            title={connectedCount < 3 ? "تحتاج 3 لاعبين على الأقل" : ""}
          >
            {connectedCount < 3 ? "بانتظار المزيد من اللاعبين..." : "ابدأ اللعبة"}
          </button>
        ) : (
          <p style={{ marginTop: 26, color: "var(--bone-dim)", textAlign: "center" }}>
            بانتظار المضيف ليبدأ اللعبة...
          </p>
        )}
      </div>
    </div>
  );
}
