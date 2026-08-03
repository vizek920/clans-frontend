export default function PlayerCard({ player, isHost, index = 0 }) {
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
      <div className="note-name">{player.name}</div>
      <div className="note-status">
        {player.isEliminated
          ? "مُقصى"
          : !player.connected
          ? "غير متصل"
          : player.revealedCard
          ? `الكارت المكشوف: ${player.revealedCard}`
          : "بانتظار الجولة"}
      </div>
      {player.isEliminated && <div className="stamp">مُقصى</div>}
    </div>
  );
}
