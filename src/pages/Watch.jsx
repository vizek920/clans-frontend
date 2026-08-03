import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket.js";
import PlayerCard from "../components/PlayerCard.jsx";
import ResultsView from "../components/ResultsView.jsx";

const PHASE_LABEL = {
  lobby: "بانتظار بدء اللعبة...",
  discussion: "جولة نقاش",
  voting: "التصويت جارٍ",
  final: "الجولة الحاسمة",
};

export default function Watch() {
  const { code } = useParams();
  const [state, setState] = useState(null);

  useEffect(() => {
    socket.emit("join_room", { code, type: "display" }, (res) => {
      if (res?.error) console.error(res.error);
    });

    function onState(payload) {
      if (payload.code === code) setState(payload);
    }
    socket.on("state_update", onState);

    return () => {
      socket.emit("leave_room", { code });
      socket.off("state_update", onState);
    };
  }, [code]);

  if (state?.phase === "ended") {
    return <ResultsView state={state} />;
  }

  return (
    <div className="watch-shell">
      <div className="watch-code mono">{code}</div>
      <div className="brand" style={{ marginBottom: 44 }}>
        <div className="brand-seal">ق</div>
        <div className="brand-title" style={{ fontSize: 30 }}>
          لعبة القاتل
        </div>
      </div>

      {!state ? (
        <p className="waiting-dots" style={{ color: "var(--bone-dim)" }}>
          جارٍ الاتصال
        </p>
      ) : (
        <div className="panel" style={{ maxWidth: 900, background: "transparent", border: "none", boxShadow: "none" }}>
          {state.round > 0 && (
            <p style={{ textAlign: "center", color: "var(--brass)", marginBottom: 6 }}>
              الجولة {state.round}
            </p>
          )}
          <div className="player-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
            {state.players
              .filter((p) => state.phase !== "final" || !p.isEliminated)
              .map((p, i) => (
                <PlayerCard key={p.id} player={p} isHost={p.id === state.hostId} index={i} />
              ))}
          </div>
          {PHASE_LABEL[state.phase] && (
            <p style={{ textAlign: "center", marginTop: 30, color: "var(--bone-dim)" }}>
              {PHASE_LABEL[state.phase]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
