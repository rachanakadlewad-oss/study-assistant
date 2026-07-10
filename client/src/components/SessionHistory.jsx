function timeAgo(timestamp) {
  const diffMs = Date.now() - timestamp;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function SessionHistory({ sessions, onLoad, onDelete }) {
  if (sessions.length === 0) return null;

  return (
    <div className="session-history">
      <p className="session-history-label">Recent sets</p>
      <div className="session-chips">
        {sessions.map((s) => (
          <div key={s.id} className="session-chip">
            <button className="session-chip-main" onClick={() => onLoad(s)}>
              <span className="session-chip-topic">{s.topic || 'Untitled'}</span>
              <span className="session-chip-time">{timeAgo(s.createdAt)}</span>
            </button>
            <button
              className="session-chip-delete"
              onClick={() => onDelete(s.id)}
              aria-label={`Delete "${s.topic}" from history`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
