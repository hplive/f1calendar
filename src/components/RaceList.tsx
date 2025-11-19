import Countdown from './Countdown';
import type { RaceWeekend } from '../services/f1Api';

interface RaceListProps {
  races: RaceWeekend[];
  timezone: string;
}

const RaceList = ({ races, timezone }: RaceListProps) => {
  if (!races.length) {
    return <p className="status-card">No more races scheduled.</p>;
  }

  const rangeFormatter = new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    timeZone: timezone,
  });

  return (
    <div className="race-list">
      {races.map((race) => {
        const firstSession = race.sessions[0];
        const lastSession = race.sessions[race.sessions.length - 1];
        return (
          <article key={race.id} className="race-card">
            <div className="race-card-header">
              <div>
                <p className="tag">Round {race.round}</p>
                <h4>{race.raceName}</h4>
                <p className="location">
                  {race.locality}, {race.country}
                </p>
              </div>
              <p className="race-dates">
                {rangeFormatter.format(firstSession.start)} — {rangeFormatter.format(lastSession.start)}
              </p>
            </div>
            <div className="race-card-countdown">
              <Countdown targetDate={firstSession.start} variant="compact" label="Starts in" />
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default RaceList;
