import PlayerCard from "./PlayerCard.jsx";
import MyCards from "./MyCards.jsx";
import { socket } from "../socket.js";

export default function GameRound({ code, state }) {
  const isHost = state.hostId === socket.id;
  const isVoting = state.phase === "voting";
  const activePlayers = state.players.filter((p) => !p.isEliminated);
  const myTarget = state.you?.myVoteTarget;

  function handleStartVoting() {
    socket.emit("start_voting", { code }, () => {});
  }

  function handleVote(targetId) {
    socket.emit("cast_vote", { code, targetId }, () => {});
  }

  function handleKick(targetId) {
    socket.emit("kick_player", { code, targetId }, () => {});
  }

  return (
    <div className="screen" style={{ justifyContent: "flex-start", paddingTop: 50 }}>
      <div className="brand">
        <div className="brand-seal">ق</div>
        <div className="brand-title">لعبة القاتل</div>
      </div>

      <h2 style={{ color: "var(--brass)", marginBottom: 6 }}>الجولة {state.round}</h2>
      <p style={{ color: "var(--bone-dim)", marginBottom: 28 }}>
        {isVoting ? "صوتوا لإقصاء لاعب — بناءً على النقاش" : "ناقشوا وتبادلوا الاتهامات بالفويس الآن"}
      </p>

      <div className="panel" style={{ maxWidth: 760 }}>
        <MyCards cards={state.you?.cards} />

        <h3 style={{ fontSize: 15, color: "var(--brass)", marginBottom: 12 }}>اللاعبون</h3>
        <div className="player-grid">
          {activePlayers.map((p, i) => (
            <PlayerCard
              key={p.id}
              player={p}
              isHost={p.id === state.hostId}
              index={i}
              isSelf={p.id === socket.id}
              onVote={isVoting && !isHost ? handleVote : null}
              votedByMe={myTarget === p.id}
              onKick={isHost && p.id !== state.hostId ? handleKick : null}
            />
          ))}
        </div>

        {isHost && !isVoting && (
          <button className="btn-primary" style={{ marginTop: 26 }} onClick={handleStartVoting}>
            ابدأ التصويت
          </button>
        )}
        {!isHost && !isVoting && (
          <p style={{ marginTop: 26, color: "var(--bone-dim)", textAlign: "center" }}>
            بانتظار المضيف يبدأ التصويت بعد ما تخلصون النقاش
          </p>
        )}
        {isVoting && (
          <p style={{ marginTop: 20, color: "var(--bone-dim)", textAlign: "center", fontSize: 14 }}>
            الإقصاء يصير تلقائياً بمجرد ما يصوّت جميع اللاعبين النشطين
          </p>
        )}
      </div>
    </div>
  );
}
