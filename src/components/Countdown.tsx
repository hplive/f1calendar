import useCountdown from '../hooks/useCountdown';
import type { CountdownVariant } from '../hooks/useCountdown';

interface CountdownProps {
  targetDate: Date | null;
  label?: string;
  variant?: CountdownVariant;
}

const formatValue = (value: number) => value.toString().padStart(2, '0');

const Countdown = ({ targetDate, label, variant = 'large' }: CountdownProps) => {
  const { days, hours, minutes, seconds, isPast } = useCountdown(targetDate);

  const content = targetDate ? (
    <div className={`countdown-values ${variant}`}>
      <div>
        <span className="value">{formatValue(days)}</span>
        <span className="unit">d</span>
      </div>
      <div>
        <span className="value">{formatValue(hours)}</span>
        <span className="unit">h</span>
      </div>
      <div>
        <span className="value">{formatValue(minutes)}</span>
        <span className="unit">m</span>
      </div>
      <div>
        <span className="value">{formatValue(seconds)}</span>
        <span className="unit">s</span>
      </div>
    </div>
  ) : (
    <p className="countdown-placeholder">Sem data</p>
  );

  const statusText = !targetDate ? 'Sem data definida' : isPast ? 'Já começou' : label ?? 'Countdown';

  return (
    <div className={`countdown ${variant}`}>
      <p className="countdown-label">{statusText}</p>
      {content}
    </div>
  );
};

export default Countdown;
