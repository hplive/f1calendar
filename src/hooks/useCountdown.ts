import { useEffect, useMemo, useState } from 'react';

export type CountdownVariant = 'large' | 'compact';

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const getTimeParts = (target: Date | null, now: number) => {
  if (!target) {
    return {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: false,
      progress: { days: 0, hours: 0, minutes: 0, seconds: 0 },
    };
  }

  const diffRaw = target.getTime() - now;
  const total = Math.max(diffRaw, 0);

  const days = Math.floor(total / DAY_MS);
  const remainderAfterDays = total - days * DAY_MS;

  const hours = Math.floor(remainderAfterDays / HOUR_MS);
  const remainderAfterHours = remainderAfterDays - hours * HOUR_MS;

  const minutes = Math.floor(remainderAfterHours / MINUTE_MS);
  const remainderAfterMinutes = remainderAfterHours - minutes * MINUTE_MS;

  const seconds = Math.floor(remainderAfterMinutes / SECOND_MS);
  const remainderAfterSeconds = remainderAfterMinutes - seconds * SECOND_MS;

  const progress = {
    days: remainderAfterDays / DAY_MS,
    hours: remainderAfterHours / HOUR_MS,
    minutes: remainderAfterMinutes / MINUTE_MS,
    seconds: (seconds + remainderAfterSeconds / SECOND_MS) / 60,
  };

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
    isPast: diffRaw <= 0,
    progress,
  };
};

const useCountdown = (targetDate: Date | null) => {
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setTimestamp(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const breakdown = useMemo(() => getTimeParts(targetDate, timestamp), [targetDate, timestamp]);

  return breakdown;
};

export default useCountdown;
