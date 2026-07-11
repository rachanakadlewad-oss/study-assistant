import { useState } from 'react';
import InputForm from './components/InputForm.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorState from './components/ErrorState.jsx';
import EmptyState from './components/EmptyState.jsx';
import FlashcardsView from './components/FlashcardsView.jsx';
import QuizView from './components/QuizView.jsx';
import BlocksView from './components/BlocksView.jsx';
import SessionHistory from './components/SessionHistory.jsx';
import { useGenerate } from './hooks/useGenerate.js';
import { getSessions, saveSession, deleteSession } from './sessions.js';
import './App.css';

export default function App() {
  const { status, data, error, generate, loadSession } = useGenerate();
  const [tab, setTab] = useState('flashcards');
  const [lastText, setLastText] = useState('');
  const [sessions, setSessions] = useState(() => getSessions());

  // Shared by both "Generate" and "Try again" — runs the request, and if it
  // actually succeeds, persists it to localStorage for next time.
  async function runGenerate(text) {
    setLastText(text);
    const result = await generate(text);
    if (result) {
      const session = {
        id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
        topic: result.topic || text.slice(0, 40),
        text,
        flashcards: result.flashcards,
        quiz: result.quiz,
        blocks: result.blocks,
        createdAt: Date.now(),
      };
      setSessions(saveSession(session));
    }
  }

  function handleSubmit(text) {
    runGenerate(text);
  }

  function handleRetry() {
    if (lastText) runGenerate(lastText);
  }

  function handleLoadSession(session) {
    loadSession({ topic: session.topic, flashcards: session.flashcards, quiz: session.quiz, blocks: session.blocks });
    setLastText(session.text);
    setTab('flashcards');
  }

  function handleDeleteSession(id) {
    setSessions(deleteSession(id));
  }

  async function handleRefine(refineText) {
    const result = await generate(refineText, data);
    if (result) {
      const session = {
        id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
        topic: result.topic || lastText.slice(0, 40),
        text: lastText,
        flashcards: result.flashcards,
        quiz: result.quiz,
        blocks: result.blocks,
        createdAt: Date.now(),
      };
      setSessions(saveSession(session));
    }
  }

  return (
    <div className="app-shell">
      <header className="header">
        <h1>Study Assistant</h1>
        <p className="tagline">Turn any notes into flashcards and a quiz.</p>
      </header>

      <InputForm onSubmit={handleSubmit} disabled={status === 'loading'} />

      <SessionHistory
        sessions={sessions}
        onLoad={handleLoadSession}
        onDelete={handleDeleteSession}
      />

      <main className="results">
        {status === 'idle' && <EmptyState />}
        {status === 'loading' && <LoadingState />}
        {status === 'error' && <ErrorState message={error} onRetry={handleRetry} />}
        {status === 'success' && data && (
          <>
            <div className="tabs" role="tablist">
              <button
                role="tab"
                aria-selected={tab === 'flashcards'}
                className={tab === 'flashcards' ? 'tab active' : 'tab'}
                onClick={() => setTab('flashcards')}
              >
                <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M7 8h10M7 12h10M7 16h6" />
                </svg>
                <span>Flashcards ({data.flashcards.length})</span>
              </button>
              <button
                role="tab"
                aria-selected={tab === 'quiz'}
                className={tab === 'quiz' ? 'tab active' : 'tab'}
                onClick={() => setTab('quiz')}
              >
                <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span>Quiz ({data.quiz.length})</span>
              </button>
              {data.blocks && data.blocks.length > 0 && (
                <button
                  role="tab"
                  aria-selected={tab === 'blocks'}
                  className={tab === 'blocks' ? 'tab active' : 'tab'}
                  onClick={() => setTab('blocks')}
                >
                  <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9" rx="1" />
                    <rect x="14" y="3" width="7" height="5" rx="1" />
                    <rect x="14" y="12" width="7" height="9" rx="1" />
                    <rect x="3" y="16" width="7" height="5" rx="1" />
                  </svg>
                  <span>Overview ({data.blocks.length})</span>
                </button>
              )}
            </div>

            <form className="refine-panel" onSubmit={(e) => {
              e.preventDefault();
              const input = e.target.elements.refinePrompt;
              if (input && input.value.trim() && status !== 'loading') {
                handleRefine(input.value.trim());
                input.value = '';
              }
            }}>
              <div className="refine-input-wrapper">
                <svg className="sparkles-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                <input
                  name="refinePrompt"
                  type="text"
                  placeholder="Ask the AI to refine this study set (e.g. 'add more cards' or 'make quiz harder')..."
                  disabled={status === 'loading'}
                  autoComplete="off"
                />
                <button type="submit" disabled={status === 'loading'}>
                  Refine
                </button>
              </div>
            </form>

            {tab === 'flashcards' && <FlashcardsView cards={data.flashcards} />}
            {tab === 'quiz' && <QuizView questions={data.quiz} />}
            {tab === 'blocks' && data.blocks && <BlocksView blocks={data.blocks} />}
          </>
        )}
      </main>
    </div>
  );
}
