import { useState } from 'react';

export default function InputForm({ onSubmit, disabled }) {
  const [text, setText] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSubmit(text.trim());
  }

  return (
    <form className="input-panel" onSubmit={handleSubmit}>
      <label htmlFor="notes" className="input-label">
        Paste your notes, or just name a topic
      </label>
      <textarea
        id="notes"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. The French Revolution — or paste your lecture notes here..."
        rows={6}
        disabled={disabled}
        maxLength={6000}
      />
      <div className="input-footer">
        <span className="char-count">{text.length}/6000</span>
        <button type="submit" className="generate-btn" disabled={disabled || !text.trim()}>
          {disabled ? (
            <span className="btn-loading-content">
              <svg className="spinner-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2"/>
                <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Generating…
            </span>
          ) : (
            'Generate study set'
          )}
        </button>
      </div>
    </form>
  );
}
