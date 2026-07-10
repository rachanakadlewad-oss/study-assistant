import { useEffect, useState } from 'react';

export default function FlashcardsView({ cards }) {
  const [order, setOrder] = useState(cards.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // New generation came in — reset to a fresh, unshuffled run.
  useEffect(() => {
    setOrder(cards.map((_, i) => i));
    setIndex(0);
    setFlipped(false);
  }, [cards]);

  const card = cards[order[index]];

  function next() {
    setFlipped(false);
    setIndex((i) => (i + 1) % order.length);
  }
  function prev() {
    setFlipped(false);
    setIndex((i) => (i - 1 + order.length) % order.length);
  }
  function shuffle() {
    setOrder([...order].sort(() => Math.random() - 0.5));
    setIndex(0);
    setFlipped(false);
  }
  function onKeyDown(e) {
    if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === ' ') {
      e.preventDefault();
      setFlipped((f) => !f);
    }
  }

  if (!card) return null;

  return (
    <div className="flashcards" onKeyDown={onKeyDown} tabIndex={0}>
      <span className="progress-badge">
        Card {index + 1} of {order.length}
      </span>

      <div
        className={`flashcard ${flipped ? 'is-flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        aria-label="Flip flashcard"
      >
        <div className="flashcard-inner">
          <div className="flashcard-face flashcard-front">{card.front}</div>
          <div className="flashcard-face flashcard-back">{card.back}</div>
        </div>
      </div>

      <p className="hint">Tap the card to flip · ← → to move · space to flip</p>

      <div className="flashcard-controls">
        <button onClick={prev}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Previous
        </button>
        <button onClick={shuffle}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
          Shuffle
        </button>
        <button onClick={next}>
          Next
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
