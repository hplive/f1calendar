import type { CSSProperties } from 'react';
import useCountdown from '../hooks/useCountdown';
import type { CountdownVariant } from '../hooks/useCountdown';

interface CountdownProps {
  targetDate: Date | null;
  label?: string;
  variant?: CountdownVariant;
}

const formatValue = (value: number) => value.toString().padStart(2, '0');

const Countdown = ({ targetDate, label, variant = 'large' }: CountdownProps) => {
  const { days, hours, minutes, seconds, isPast, progress } = useCountdown(targetDate);

  const units = [
    { key: 'days', label: 'Days', short: 'D', value: days, progress: progress.days ?? 0 },
    { key: 'hours', label: 'Hours', short: 'H', value: hours, progress: progress.hours ?? 0 },
    { key: 'minutes', label: 'Minutes', short: 'M', value: minutes, progress: progress.minutes ?? 0 },
    { key: 'seconds', label: 'Seconds', short: 'S', value: seconds, progress: progress.seconds ?? 0 },
  ];

  const content = targetDate ? (
    <div className={`countdown-grid ${variant}`}>
      {units.map((unit) => {
        const progressValue = Math.max(0, Math.min(1, unit.progress));
        const style = {
          ['--progress' as '--progress']: progressValue,
        } as CSSProperties;

        return (
          <div key={unit.key} className={`countdown-unit ${variant}`}>
            <div className={`countdown-circle ${variant}`} style={style}>
              <div className="countdown-circle-inner">
                <span className="value">{formatValue(unit.value)}</span>
                <span className="unit">{unit.short}</span>
              </div>
            </div>
            <span className="countdown-unit-label">{unit.label}</span>
          </div>
        );
      })}
    </div>
  ) : (
    <p className="countdown-placeholder">Sem data</p>
  );

  const statusText = !targetDate ? 'No date available' : isPast ? 'Already started' : label ?? 'Countdown';

  return (
    <div className={`countdown ${variant}`}>
      <p className="countdown-label">{statusText}</p>
      {content}
    </div>
  );
};

export default Countdown;
