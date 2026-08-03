import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket.js";
import PlayerCard from "../components/PlayerCard.jsx";

const nameKey = (code) => `killer_name_${code}`;

export default function Lobby() {
  const { code } = useParams();
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [needsName, setNeedsName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [slow, setSlow] = useState(false);
  const attemptedRef = useRef(false);

  function attemptJoin(name) {
    setError("");
    setNeedsName(false);
    socket.emit("join_room", { code, name, type: "player" }, (res) => {
      if (res?.error) {
        setError(res.error);
        setNeedsName(true);
        return;
      }
      sessionStorage.setItem(nameKey(code), name);
    });
  }

  useEffect(() => {
    function onState(payload) {
      if (payload.code === code) {
        setState(payload);
        setSlow(false);
      }
    }
    socket.on("state_update", onState);

    // مؤشر تأخير لو السيرفر نايم (خطة Render المجانية) وياخذ وقت يصحى
    const slowTimer = setTimeout(() => setSlow(true), 4000);

    // لو دخلنا الصفحة مباشرة (رابط/تحديث) بدون ما نمر بصفحة الدخول
    if (!attemptedRef.current) {
      attemptedRef.current = true;
      const savedName = sessionStorage.getItem(nameKey(code));
      if (savedName) {
        attemptJoin(savedName);
      } else {
        // نعطي فرصة قصيرة لبث الحالة (لو كنا انضممنا فعلاً من صفحة الدخول
        // بنفس الجلسة)؛ لو ما وصل شي، نطلب الاسم بدل ما نعلّق للأبد
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
      clearTimeout(slowTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

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
