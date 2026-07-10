import { useState } from 'react';

export default function BlocksView({ blocks }) {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (blockIdx, itemIdx) => {
    const key = `${blockIdx}-${itemIdx}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="blocks-view">
      {blocks.map((block, idx) => {
        if (block.type === 'card') {
          return (
            <div key={idx} className="block-card block-item">
              <h3 className="block-title">{block.title}</h3>
              <p className="block-content">{block.content}</p>
            </div>
          );
        }

        if (block.type === 'chart') {
          if (block.chartType === 'pie') {
            return (
              <div key={idx} className="block-chart block-item">
                <h3 className="block-title">{block.title}</h3>
                <div className="pie-charts-grid">
                  {block.labels.map((label, i) => {
                    const val = block.values[i] || 0;
                    const radius = 28;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - (Math.min(100, Math.max(0, val)) / 100) * circumference;
                    return (
                      <div key={i} className="pie-chart-item">
                        <svg width="72" height="72" viewBox="0 0 72 72" className="pie-gauge">
                          <circle cx="36" cy="36" r={radius} stroke="rgba(255, 255, 255, 0.05)" strokeWidth="5" fill="transparent" />
                          <circle
                            cx="36"
                            cy="36"
                            r={radius}
                            stroke="var(--accent)"
                            strokeWidth="5"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            transform="rotate(-90 36 36)"
                            style={{ transition: 'stroke-dashoffset 0.8s ease-out-stroke' }}
                          />
                          <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">
                            {val}%
                          </text>
                        </svg>
                        <span className="pie-chart-label" title={label}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Default to Bar chart
          return (
            <div key={idx} className="block-chart block-item">
              <h3 className="block-title">{block.title}</h3>
              <div className="chart-container">
                {block.labels.map((label, i) => {
                  const val = block.values[i] || 0;
                  return (
                    <div key={i} className="chart-row">
                      <span className="chart-label" title={label}>{label}</span>
                      <div className="chart-bar-outer">
                        <div
                          className="chart-bar-inner"
                          style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                        />
                      </div>
                      <span className="chart-value">{val}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        if (block.type === 'checklist') {
          return (
            <div key={idx} className="block-checklist block-item">
              <h3 className="block-title">{block.title}</h3>
              <div className="checklist-items">
                {block.items.map((item, i) => {
                  const isChecked = !!checkedItems[`${idx}-${i}`];
                  return (
                    <label key={i} className={`checklist-item ${isChecked ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheck(idx, i)}
                      />
                      <span className="checkbox-custom">
                        {isChecked && (
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span className="checklist-text">{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
