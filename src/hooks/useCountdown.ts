import { useEffect, useMemo, useState } from 'react';

export type CountdownVariant = 'large' | 'compact';

const getTimeParts = (target: Date | null, now: number) => {
  if (!target) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false };
  }

  const diff = target.getTime() - now;
  const total = Math.max(diff, 0);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return { total, days, hours, minutes, seconds, isPast: diff <= 0 };
};

const useCountdown = (targetDate: Date | null) => {
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimestamp(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const breakdown = useMemo(() => getTimeParts(targetDate, timestamp), [targetDate, timestamp]);

  return breakdown;
};

export default useCountdown;
