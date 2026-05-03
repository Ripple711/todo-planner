import type { CSSProperties } from 'react';

type ProgressBarProps = {
  percent: number;
  color?: string;
};

export function ProgressBar({ percent, color }: ProgressBarProps) {
  return (
    <div className="progress-wrap" aria-label={`进度 ${percent}%`} style={{ '--progress-color': color } as CSSProperties}>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <span>{percent}%</span>
    </div>
  );
}
