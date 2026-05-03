type FlipClockDisplayProps = {
  value: string;
  unitLabels?: string[];
  className?: string;
  ariaLabel?: string;
};

export function FlipClockDisplay({ value, unitLabels = [], className, ariaLabel }: FlipClockDisplayProps) {
  const units = value.split(':');

  return (
    <div className={`flip-clock-display${className ? ` ${className}` : ''}`} aria-label={ariaLabel}>
      {units.map((unit, index) => (
        <div className="flip-clock-group" key={`${index}-${unitLabels[index] ?? 'unit'}`}>
          <div className="flip-card" key={`${index}-${unit}`}>
            <span className="flip-card-number">{unit}</span>
          </div>
          {unitLabels[index] ? <span className="flip-card-label">{unitLabels[index]}</span> : null}
          {index < units.length - 1 ? <span className="flip-clock-separator">:</span> : null}
        </div>
      ))}
    </div>
  );
}
