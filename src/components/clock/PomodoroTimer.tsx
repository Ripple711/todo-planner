import { useEffect, useMemo, useRef, useState } from 'react';
import { FlipClockDisplay } from './FlipClockDisplay';

const presets = [5, 15, 25, 45, 60];
const maxMinutes = 240;

type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

function clampMinutes(value: number) {
  if (!Number.isFinite(value)) {
    return 25;
  }

  return Math.min(maxMinutes, Math.max(1, Math.round(value)));
}

function formatRemainingTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (safeSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState('25');
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const endTimeRef = useRef<number | null>(null);
  const remainingSecondsRef = useRef(25 * 60);
  const labels = useMemo(() => ['分', '秒'], []);

  useEffect(() => {
    remainingSecondsRef.current = remainingSeconds;
  }, [remainingSeconds]);

  useEffect(() => {
    if (status !== 'running') {
      return undefined;
    }

    endTimeRef.current = Date.now() + remainingSecondsRef.current * 1000;

    const tick = () => {
      if (!endTimeRef.current) {
        return;
      }

      const nextRemaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 0) {
        endTimeRef.current = null;
        setStatus('completed');
      }
    };

    const intervalId = window.setInterval(tick, 250);
    tick();

    return () => window.clearInterval(intervalId);
  }, [status]);

  function setDuration(nextMinutes: number) {
    const safeMinutes = clampMinutes(nextMinutes);
    setMinutes(safeMinutes);
    setCustomMinutes(String(safeMinutes));

    if (status !== 'running') {
      setRemainingSeconds(safeMinutes * 60);
      setStatus('idle');
    }
  }

  function handleCustomChange(value: string) {
    setCustomMinutes(value);
    const parsedMinutes = Number(value);

    if (value.trim() && Number.isFinite(parsedMinutes)) {
      setDuration(parsedMinutes);
    }
  }

  function handleStart() {
    if (status === 'running') {
      return;
    }

    if (remainingSeconds <= 0 || status === 'completed') {
      setRemainingSeconds(minutes * 60);
    }

    setStatus('running');
  }

  function handlePause() {
    if (status === 'running' && endTimeRef.current) {
      setRemainingSeconds(Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000)));
    }

    endTimeRef.current = null;
    setStatus((currentStatus) => (currentStatus === 'running' ? 'paused' : currentStatus));
  }

  function handleReset() {
    endTimeRef.current = null;
    setRemainingSeconds(minutes * 60);
    setStatus('idle');
  }

  return (
    <div className={`pomodoro-timer${status === 'completed' ? ' completed' : ''}`}>
      <FlipClockDisplay
        value={formatRemainingTime(remainingSeconds)}
        unitLabels={labels}
        ariaLabel={`倒计时剩余 ${formatRemainingTime(remainingSeconds)}`}
      />

      <p className="timer-state">
        {status === 'completed' ? '完成了，稍微停一停。' : status === 'running' ? '雨声里专注中' : '设定一段安静时间'}
      </p>

      <div className="timer-presets" aria-label="倒计时预设">
        {presets.map((preset) => (
          <button
            type="button"
            key={preset}
            className={minutes === preset ? 'active' : ''}
            onClick={() => setDuration(preset)}
            disabled={status === 'running'}
          >
            {preset}
          </button>
        ))}
      </div>

      <label className="timer-custom-input">
        <span>自定义分钟</span>
        <input
          type="number"
          min="1"
          max={maxMinutes}
          step="1"
          value={customMinutes}
          onBlur={() => setDuration(Number(customMinutes))}
          onChange={(event) => handleCustomChange(event.target.value)}
          disabled={status === 'running'}
        />
      </label>

      <div className="timer-controls">
        <button type="button" onClick={handleStart} disabled={status === 'running'}>
          Start
        </button>
        <button type="button" className="secondary-button" onClick={handlePause} disabled={status !== 'running'}>
          Pause
        </button>
        <button type="button" className="secondary-button" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
