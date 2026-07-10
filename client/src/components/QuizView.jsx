import { useEffect, useState } from 'react';

export default function QuizView({ questions }) {
  const [activeQuestions, setActiveQuestions] = useState(questions);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [finished, setFinished] = useState(false);

  // New generation came in — start a fresh full run.
  useEffect(() => {
    resetTo(questions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  function resetTo(list) {
    setActiveQuestions(list);
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setWrong([]);
    setFinished(false);
  }

  const current = activeQuestions[index];

  function choose(optionIndex) {
    if (revealed) return;
    setSelected(optionIndex);
    setRevealed(true);
    if (optionIndex === current.answerIndex) {
      setScore((s) => s + 1);
    } else {
      setWrong((w) => [...w, current]);
    }
  }

  function nextQuestion() {
    if (index + 1 < activeQuestions.length) {
      setIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setFinished(true);
    }
  }

  // Re-run the quiz using only the questions missed this round.
  // No new AI call needed — we already have the question data.
  function retestWrong() {
    resetTo(wrong);
  }

  function restartAll() {
    resetTo(questions);
  }

  if (finished) {
    return (
      <div className="quiz-result">
        <p className="score">
          {score} / {activeQuestions.length} correct
        </p>
        <div className="quiz-result-actions">
          <button onClick={restartAll}>Restart full quiz</button>
          <button onClick={retestWrong} disabled={wrong.length === 0}>
            Retest {wrong.length} wrong answer{wrong.length === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="quiz">
      <p className="progress-label">
        Question {index + 1} of {activeQuestions.length} · Score {score}
      </p>
      <p className="question">{current.question}</p>

      <div className="options">
        {current.options.map((opt, i) => {
          const isCorrect = i === current.answerIndex;
          const isSelected = i === selected;
          let cls = 'option';
          if (revealed && isCorrect) cls += ' correct';
          else if (revealed && isSelected && !isCorrect) cls += ' incorrect';
          return (
            <button key={i} className={cls} onClick={() => choose(i)} disabled={revealed}>
              {opt}
            </button>
          );
        })}
      </div>

      {revealed && (
        <button className="next-btn" onClick={nextQuestion}>
          {index + 1 < activeQuestions.length ? 'Next question' : 'See results'}
        </button>
      )}
    </div>
  );
}
