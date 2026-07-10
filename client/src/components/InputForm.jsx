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
          {disabled ? 'Generating…' : 'Generate study set'}
        </button>
      </div>
    </form>
  );
}
