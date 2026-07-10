export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-panel error-state" role="alert">
      <p className="error-title">That didn't generate correctly.</p>
      <p className="error-message">{message}</p>
      <button className="retry-btn" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
