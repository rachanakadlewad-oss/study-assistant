export default function LoadingState() {
  return (
    <div className="state-panel loading-state" role="status" aria-live="polite">
      <div className="loading-card-container">
        <div className="skeleton-card skeleton-pulse">
          <div className="skeleton-line short" />
          <div className="skeleton-line long" />
          <div className="skeleton-line medium" />
        </div>
      </div>
      <div className="loading-status-text">
        <svg className="spinner-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"/>
          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        </svg>
        <span>Writing your flashcards and quiz…</span>
      </div>
    </div>
  );
}
