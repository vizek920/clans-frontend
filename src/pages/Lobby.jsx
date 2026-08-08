import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket.js";
import PlayerCard from "../components/PlayerCard.jsx";
import GameRound from "../components/GameRound.jsx";
import FinalRound from "../components/FinalRound.jsx";
import ResultsView from "../components/ResultsView.jsx";

const nameKey = (code) => `killer_name_${code}`;

export default function Lobby() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [needsName, setNeedsName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [slow, setSlow] = useState(false);
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [kicked, setKicked] = useState(false);
  const attemptedRef = useRef(false);

  function attemptJoin(name) {
    setError("");
    setNeedsName(false);
    setRejected(false);
    socket.emit("join_room", { code, name, type: "player" }, (res) => {
      if (res?.error) {
        setError(res.error);
        setNeedsName(true);
        return;
      }
      sessionStorage.setItem(nameKey(code), name);
      if (res?.pending) setAwaitingApproval(true);
    });
  }

  useEffect(() => {
    function onState(payload) {
      if (payload.code === code) {
        setState(payload);
        setSlow(false);
        setAwaitingApproval(false);
      }
    }
    function onPending(payload) {
      if (payload.code === code) setAwaitingApproval(true);
    }
    function onRejected(payload) {
      if (payload.code === code) {
        setAwaitingApproval(false);
        setRejected(true);
        sessionStorage.removeItem(nameKey(code));
      }
    }
    function onKicked(payload) {
      if (payload.code === code) {
        setKicked(true);
        sessionStorage.removeItem(nameKey(code));
      }
    }

    socket.on("state_update", onState);
    socket.on("pending_update", onPending);
    socket.on("join_rejected", onRejected);
    socket.on("kicked", onKicked);

    // مؤشر تأخير لو السيرفر نايم (خطة Render المجانية) وياخذ وقت يصحى
    const slowTimer = setTimeout(() => setSlow(true), 4000);

    // لو دخلنا الصفحة مباشرة (رابط/تحديث) بدون ما نمر بصفحة الدخول
    if (!attemptedRef.current) {
      attemptedRef.current = true;
      const savedName = sessionStorage.getItem(nameKey(code));
      if (savedName) {
        attemptJoin(savedName);
      } else {
        setTimeout(() => {
          setState((current) => {
            if (!current) setNeedsName(true);
            return current;
          });
        }, 1200);
      }
    }

    return () => {
      socket.off("state_update", onState);
      socket.off("pending_update", onPending);
      socket.off("join_rejected", onRejected);
      socket.off("kicked", onKicked);
      clearTimeout(slowTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  function goHome() {
    navigate("/");
  }

  if (kicked) {
    return (
      <div className="screen">
        <div className="brand">
          <div className="brand-seal">ق</div>
          <div className="brand-title">لعبة القاتل</div>
        </div>
        <div className="panel" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--blood-bright)", marginBottom: 18 }}>تم طردك من الغرفة بواسطة المضيف</p>
          <button className="btn-primary" onClick={goHome}>الرجوع للرئيسية</button>
        </div>
      </div>
    );
  }

  if (rejected) {
    return (
      <div className="screen">
        <div className="brand">
          <div className="brand-seal">ق</div>
          <div className="brand-title">لعبة القاتل</div>
        </div>
        <div className="panel" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--blood-bright)", marginBottom: 18 }}>رفض المضيف طلب انضمامك</p>
          <button className="btn-primary" onClick={goHome}>الرجوع للرئيسية</button>
        </div>
      </div>
    );
  }

  if (needsName) {
    return (
      <div className="screen">
        <div className="brand">
          <div className="brand-seal">ق</div>
          <div className="brand-title">لعبة القاتل</div>
        </div>
        <div className="panel">
          <p style={{ color: "var(--bone-dim)", marginBottom: 18, textAlign: "center" }}>
            دخلت رابط الغرفة <span className="mono" style={{ color: "var(--brass)" }}>{code}</span> مباشرة —
            اكتب اسمك للانضمام
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!nameInput.trim()) return;
              attemptJoin(nameInput.trim());
            }}
          >
            <input
              className="field-input"
              value={nameInput}
              maxLength={20}
              autoFocus
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="اسمك"
            />
            {error && <div className="error-text">{error}</div>}
            <button className="btn-primary" type="submit">
              انضمام
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (awaitingApproval && !state) {
    return (
      <div className="screen">
        <div className="brand">
          <div className="brand-seal">ق</div>
          <div className="brand-title">لعبة القاتل</div>
        </div>
        <p className="waiting-dots" style={{ color: "var(--bone-dim)" }}>
          بانتظار موافقة المضيف على دخولك
        </p>
      </div>
    );
  }

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
        {slow && (
          <p style={{ color: "var(--bone-dim)", fontSize: 14, marginTop: 10, maxWidth: 320, textAlign: "center" }}>
            السيرفر قد يكون بوضع خمول ويحتاج حتى دقيقة ليصحى — لو استمر التأخير طويل، حدّث الصفحة بعد قليل.
          </p>
        )}
        {error && <div className="error-text" style={{ marginTop: 12 }}>{error}</div>}
      </div>
    );
  }

  const isHost = state.hostId === socket.id;
  const connectedCount = state.players.filter((p) => p.connected).length;

  if (state.phase === "discussion" || state.phase === "voting") {
    return <GameRound code={code} state={state} />;
  }
  if (state.phase === "final") {
    return <FinalRound code={code} state={state} />;
  }
  if (state.phase === "ended") {
    return <ResultsView state={state} />;
  }

  function handleStartGame() {
    setError("");
    socket.emit("start_game", { code }, (res) => {
      if (res?.error) setError(res.error);
    });
  }

  function handleApprove(targetId) {
    socket.emit("approve_join", { code, targetId }, () => {});
  }

  function handleReject(targetId) {
    socket.emit("reject_join", { code, targetId }, () => {});
  }

  function handleKick(targetId) {
    socket.emit("kick_player", { code, targetId }, () => {});
  }

  return (
    <div className="screen" style={{ justifyContent: "flex-start", paddingTop: 60 }}>
      <div className="brand">
        <div className="brand-seal">ق</div>
        <div className="brand-title">لعبة القاتل</div>
      </div>

      <div className="room-code">{code}</div>
      <p style={{ color: "var(--bone-dim)", marginTop: 8, marginBottom: 4 }}>
        المراقب: {state.hostName || "—"}
      </p>
      <p style={{ color: "var(--bone-dim)", marginBottom: 32 }}>
        شارك هذا الكود مع الجميع بالفويس • {connectedCount} لاعب متصل
      </p>

      {isHost && state.pendingRequests?.length > 0 && (
        <div className="panel" style={{ maxWidth: 720, marginBottom: 20, borderColor: "var(--blood-bright)" }}>
          <h2 style={{ fontSize: 16, color: "var(--blood-bright)", marginBottom: 14 }}>
            طلبات انضمام بانتظار موافقتك ({state.pendingRequests.length})
          </h2>
          {state.pendingRequests.map((req) => (
            <div
              key={req.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderTop: "1px solid rgba(212,175,106,0.15)",
              }}
            >
              <span>{req.name}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn-primary"
                  style={{ padding: "6px 16px", width: "auto" }}
                  onClick={() => handleApprove(req.id)}
                >
                  قبول
                </button>
                <button
                  className="btn-ghost"
                  style={{ padding: "6px 16px", width: "auto", margin: 0, borderColor: "var(--blood-bright)", color: "var(--blood-bright)" }}
                  onClick={() => handleReject(req.id)}
                >
                  رفض
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="panel" style={{ maxWidth: 720 }}>
        <h2 style={{ fontSize: 18, color: "var(--brass)", marginBottom: 18 }}>
          اللاعبون بالغرفة
        </h2>
        <div className="player-grid">
          {state.players.map((p, i) => (
            <PlayerCard
              key={p.id}
              player={p}
              isHost={p.id === state.hostId}
              index={i}
              isSelf={p.id === socket.id}
              onKick={isHost && p.id !== state.hostId ? handleKick : null}
            />
          ))}
        </div>

        {isHost ? (
          <>
            <button
              className="btn-primary"
              style={{ marginTop: 26 }}
              disabled={connectedCount < 3}
              title={connectedCount < 3 ? "تحتاج 3 لاعبين على الأقل" : ""}
              onClick={handleStartGame}
            >
              {connectedCount < 3 ? "بانتظار المزيد من اللاعبين..." : "ابدأ اللعبة"}
            </button>
            {error && <div className="error-text" style={{ marginTop: 10 }}>{error}</div>}
          </>
        ) : (
          <p style={{ marginTop: 26, color: "var(--bone-dim)", textAlign: "center" }}>
            بانتظار المضيف ليبدأ اللعبة...
          </p>
        )}
      </div>
    </div>
  );
}
