export default function LoadingState() {
  return (
    <div className="state-panel loading-state" role="status" aria-live="polite">
      <div className="chalk-spinner" />
      <p>Writing your flashcards and quiz…</p>
    </div>
  );
}
