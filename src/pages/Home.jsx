import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket.js";

export default function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState("create"); // create | join
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return setError("اكتب اسمك أول");
    setError("");
    setLoading(true);
    socket.emit("create_room", { name: name.trim() }, (res) => {
      setLoading(false);
      if (res?.error) return setError(res.error);
      sessionStorage.setItem(`killer_name_${res.code}`, name.trim());
      navigate(`/room/${res.code}/play`);
    });
  }

  function handleJoin(e) {
    e.preventDefault();
    if (!name.trim()) return setError("اكتب اسمك أول");
    if (!joinCode.trim()) return setError("اكتب كود الغرفة");
    setError("");
    setLoading(true);
    socket.emit(
      "join_room",
      { code: joinCode.trim().toUpperCase(), name: name.trim(), type: "player" },
      (res) => {
        setLoading(false);
        if (res?.error) return setError(res.error);
        sessionStorage.setItem(`killer_name_${res.code}`, name.trim());
        navigate(`/room/${res.code}/play`);
      }
    );
  }

  function handleWatch() {
    if (!joinCode.trim()) return setError("اكتب كود الغرفة عشان تشاهد");
    navigate(`/room/${joinCode.trim().toUpperCase()}/watch`);
  }

  return (
    <div className="screen">
      <div className="brand">
        <div className="brand-seal">ق</div>
        <div className="brand-title">لعبة القاتل</div>
      </div>

      <div className="panel">
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <button
            className="btn-ghost"
            style={{
              margin: 0,
              borderColor: mode === "create" ? "var(--brass)" : undefined,
              color: mode === "create" ? "var(--brass)" : undefined,
            }}
            onClick={() => setMode("create")}
          >
            إنشاء غرفة (كمراقب)
          </button>
          <button
            className="btn-ghost"
            style={{
              margin: 0,
              borderColor: mode === "join" ? "var(--brass)" : undefined,
              color: mode === "join" ? "var(--brass)" : undefined,
            }}
            onClick={() => setMode("join")}
          >
            الانضمام كلاعب
          </button>
        </div>

        {mode === "create" && (
          <p style={{ color: "var(--bone-dim)", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
            بصفتك مراقب، تدير اللعبة وما تشارك فيها — اللاعبين ينضمون منفصلين بزر "الانضمام كلاعب"
          </p>
        )}

        <form onSubmit={mode === "create" ? handleCreate : handleJoin}>
          <label className="field-label">{mode === "create" ? "اسمك (كمراقب)" : "اسمك بالجولة"}</label>
          <input
            className="field-input"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً: الذئب"
          />

          {mode === "join" && (
            <>
              <label className="field-label">كود الغرفة</label>
              <input
                className="field-input mono"
                style={{ textAlign: "center", letterSpacing: 4, fontSize: 20 }}
                value={joinCode}
                maxLength={4}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
              />
            </>
          )}

          {error && <div className="error-text">{error}</div>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "جارٍ الدخول..." : mode === "create" ? "إنشاء الغرفة" : "دخول"}
          </button>
        </form>

        <div className="divider">أو</div>

        <label className="field-label">تبي تتفرج بس؟ (شاشة عرض)</label>
        <input
          className="field-input mono"
          style={{ textAlign: "center", letterSpacing: 4, fontSize: 18 }}
          value={joinCode}
          maxLength={4}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="ABCD"
        />
        <button className="btn-ghost" onClick={handleWatch}>
          فتح شاشة العرض
        </button>
      </div>
    </div>
  );
}
