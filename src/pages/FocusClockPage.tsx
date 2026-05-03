import { useEffect, useState } from 'react';
import { BeijingClock } from '../components/clock/BeijingClock';
import { PomodoroTimer } from '../components/clock/PomodoroTimer';
import { getDailyQuote, strayBirdsQuotes, type StrayBirdsQuote } from '../data/strayBirdsQuotes';
import '../components/clock/focusClock.css';

type ClockMode = 'beijing' | 'countdown';

const quoteStoragePrefix = 'focusClock.dailyQuote.';

const beijingDateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Shanghai',
});

function getBeijingDateKey(date = new Date()) {
  const parts = beijingDateFormatter.formatToParts(date);
  const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? '';

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
}

function getStoredQuote(dateKey: string): StrayBirdsQuote {
  const fallbackQuote = getDailyQuote(dateKey, strayBirdsQuotes);

  try {
    const storedQuoteId = Number(window.localStorage.getItem(`${quoteStoragePrefix}${dateKey}`));
    return strayBirdsQuotes.find((quote) => quote.id === storedQuoteId) ?? fallbackQuote;
  } catch {
    return fallbackQuote;
  }
}

function getInitialQuoteState() {
  const dateKey = getBeijingDateKey();

  return {
    dateKey,
    quote: getStoredQuote(dateKey),
  };
}

export function FocusClockPage() {
  const [mode, setMode] = useState<ClockMode>('beijing');
  const [dailyQuote, setDailyQuote] = useState(getInitialQuoteState);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const nextDateKey = getBeijingDateKey();

      if (nextDateKey !== dailyQuote.dateKey) {
        setDailyQuote({
          dateKey: nextDateKey,
          quote: getStoredQuote(nextDateKey),
        });
      }
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [dailyQuote.dateKey]);

  function handleChangeQuote() {
    const currentIndex = strayBirdsQuotes.findIndex((quote) => quote.id === dailyQuote.quote.id);
    const nextQuote = strayBirdsQuotes[(currentIndex + 1) % strayBirdsQuotes.length];

    setDailyQuote((currentQuote) => ({
      ...currentQuote,
      quote: nextQuote,
    }));

    try {
      window.localStorage.setItem(`${quoteStoragePrefix}${dailyQuote.dateKey}`, String(nextQuote.id));
    } catch {
      // The quote can still change for this session if browser storage is unavailable.
    }
  }

  return (
    <section className="focus-clock-page" aria-labelledby="daily-stray-birds-quote">
      <div className="focus-clock-panel">
        <figure className="focus-clock-quote">
          <p className="focus-clock-kicker">Daily Stray Birds</p>
          <blockquote id="daily-stray-birds-quote">{dailyQuote.quote.text}</blockquote>
          <figcaption>
            <span>
              — {dailyQuote.quote.author}, {dailyQuote.quote.source}
            </span>
            <button type="button" className="quote-refresh-button" onClick={handleChangeQuote}>
              换一句
            </button>
          </figcaption>
        </figure>

        <div className="focus-clock-mode-switch" role="tablist" aria-label="时钟模式">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'beijing'}
            className={mode === 'beijing' ? 'active' : ''}
            onClick={() => setMode('beijing')}
          >
            北京时间
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'countdown'}
            className={mode === 'countdown' ? 'active' : ''}
            onClick={() => setMode('countdown')}
          >
            倒计时
          </button>
        </div>

        <div className="focus-clock-stage">{mode === 'beijing' ? <BeijingClock /> : <PomodoroTimer />}</div>
      </div>
    </section>
  );
}
