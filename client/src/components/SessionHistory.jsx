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
              <div className="session-chip-icon">
                <svg className="book-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div className="session-chip-info">
                <span className="session-chip-topic">{s.topic || 'Untitled'}</span>
                <span className="session-chip-time">{timeAgo(s.createdAt)}</span>
              </div>
            </button>
            <button
              className="session-chip-delete"
              onClick={() => onDelete(s.id)}
              aria-label={`Delete "${s.topic}" from history`}
            >
              <svg className="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
