export default function PlayerCard({
  player,
  isHost,
  index = 0,
  onVote,
  isSelf = false,
  votedByMe = false,
}) {
  const classes = [
    "note-card",
    isHost ? "host" : "",
    !player.connected ? "disconnected" : "",
    player.isEliminated ? "eliminated" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const serial = String(player.id || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toUpperCase()
    .padEnd(8, "0");

  return (
    <div className={classes} style={{ animationDelay: `${index * 0.05}s` }}>
      <span className="note-serial mono">{serial}</span>
      <div className="note-name">
        {player.name}
        {isSelf && <span style={{ color: "var(--bone-dim)" }}> (أنت)</span>}
      </div>
      <div className="note-status">
        {player.isEliminated
          ? "مُقصى"
          : !player.connected
          ? "غير متصل"
          : player.revealedCard
          ? `الكارت المكشوف: ${player.revealedCard}`
          : "بانتظار الجولة"}
      </div>

      {typeof player.voteCount === "number" && player.voteCount > 0 && (
        <div
          className="mono"
          style={{
            position: "absolute",
            top: 8,
            left: 10,
            fontSize: 11,
            color: "var(--blood-bright)",
          }}
        >
          {player.voteCount} صوت
        </div>
      )}

      {onVote && !isSelf && !player.isEliminated && player.connected && (
        <button
          className="btn-ghost"
          style={{
            marginTop: 10,
            padding: "6px 10px",
            fontSize: 13,
            borderColor: votedByMe ? "var(--blood-bright)" : undefined,
            color: votedByMe ? "var(--blood-bright)" : undefined,
          }}
          onClick={() => onVote(player.id)}
        >
          {votedByMe ? "✓ صوّتّ عليه" : "صوّت للإقصاء"}
        </button>
      )}

      {player.isEliminated && <div className="stamp">مُقصى</div>}
    </div>
  );
}
