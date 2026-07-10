import { useState } from 'react';
import InputForm from './components/InputForm.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorState from './components/ErrorState.jsx';
import EmptyState from './components/EmptyState.jsx';
import FlashcardsView from './components/FlashcardsView.jsx';
import QuizView from './components/QuizView.jsx';
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
    loadSession({ topic: session.topic, flashcards: session.flashcards, quiz: session.quiz });
    setLastText(session.text);
    setTab('flashcards');
  }

  function handleDeleteSession(id) {
    setSessions(deleteSession(id));
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
                Flashcards ({data.flashcards.length})
              </button>
              <button
                role="tab"
                aria-selected={tab === 'quiz'}
                className={tab === 'quiz' ? 'tab active' : 'tab'}
                onClick={() => setTab('quiz')}
              >
                Quiz ({data.quiz.length})
              </button>
            </div>

            {tab === 'flashcards' ? (
              <FlashcardsView cards={data.flashcards} />
            ) : (
              <QuizView questions={data.quiz} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
