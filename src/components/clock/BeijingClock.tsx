import { useEffect, useMemo, useState } from 'react';
import { FlipClockDisplay } from './FlipClockDisplay';

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'Asia/Shanghai',
});

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
  timeZone: 'Asia/Shanghai',
});

function getBeijingClockSnapshot() {
  const now = new Date();
  const timeParts = timeFormatter.formatToParts(now);
  const timePart = (type: string) => timeParts.find((part) => part.type === type)?.value ?? '00';

  return {
    time: `${timePart('hour')}:${timePart('minute')}:${timePart('second')}`,
    date: dateFormatter.format(now),
  };
}

export function BeijingClock() {
  const [snapshot, setSnapshot] = useState(getBeijingClockSnapshot);
  const labels = useMemo(() => ['时', '分', '秒'], []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSnapshot(getBeijingClockSnapshot());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="beijing-clock">
      <FlipClockDisplay value={snapshot.time} unitLabels={labels} ariaLabel={`北京时间 ${snapshot.time}`} />
      <p className="focus-clock-date">{snapshot.date}</p>
    </div>
  );
}
