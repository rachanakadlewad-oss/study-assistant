export default function EmptyState() {
  return (
    <div className="state-panel empty-state">
      <div className="empty-illustration">
        <svg className="illustration-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <p className="empty-title">Ready to Study?</p>
      <p className="empty-sub">Paste your lecture notes or enter a topic above to generate a custom set of interactive flashcards and quizzes in seconds.</p>
    </div>
  );
}
