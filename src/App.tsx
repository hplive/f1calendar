import { useEffect, useMemo, useState } from 'react';
import Countdown from './components/Countdown';
import RaceList from './components/RaceList';
import { fetchCurrentSeason } from './services/f1Api';
import type { RaceSession, RaceWeekend } from './services/f1Api';
import './style.css';

const FALLBACK_TIMEZONES = [
  'UTC',
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Paris',
  'America/Sao_Paulo',
  'America/New_York',
];

const formatSessionDate = (date: Date, timeZone: string) => {
  return new Intl.DateTimeFormat('pt-PT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(date);
};

const getTimezoneOptions = () => {
  const intlWithSupport = Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[];
  };
  const zones = intlWithSupport.supportedValuesOf?.('timeZone');
  if (zones?.length) {
    return zones;
  }
  return FALLBACK_TIMEZONES;
};

const detectTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

type EnrichedSession = RaceSession & { race: RaceWeekend };

function App() {
  const detectedTimezone = useMemo(() => detectTimezone(), []);
  const timezoneOptions = useMemo(() => {
    const options = getTimezoneOptions();
    return options.includes(detectedTimezone) ? options : [detectedTimezone, ...options];
  }, [detectedTimezone]);

  const [races, setRaces] = useState<RaceWeekend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timezone, setTimezone] = useState(detectedTimezone);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const season = await fetchCurrentSeason();
        setRaces(season);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar o calendário da F1.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const nextSession: EnrichedSession | undefined = useMemo(() => {
    const upcoming: EnrichedSession[] = races
      .flatMap((race) => race.sessions.map((session) => ({ ...session, race })))
      .filter((item) => item.start.getTime() > Date.now())
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    return upcoming[0];
  }, [races]);

  const upcomingRaces = useMemo(() => {
    return races.filter((race) =>
      race.sessions.some((session) => session.start.getTime() > Date.now()),
    );
  }, [races]);

  const upcomingSessionsForRace = nextSession?.race.sessions ?? [];

  return (
    <div className="app-shell">
      <main className="app-container">
        <header className="app-header">
          <div>
            <p className="tag">Fórmula 1 • Temporada Atual</p>
            <h1>Próximo fim-de-semana de F1</h1>
            <p className="subtitle">
              Countdown em tempo real para todas as sessões oficiais.
            </p>
          </div>
          <label className="timezone-selector">
            <span>Zona horária</span>
            <select value={timezone} onChange={(event) => setTimezone(event.target.value)}>
              {timezoneOptions.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>
        </header>

        {loading && <div className="status-card">A carregar calendário...</div>}
        {!loading && error && <div className="status-card error">{error}</div>}

        {!loading && !error && nextSession && (
          <section className="highlight-card">
            <div className="highlight-header">
              <div>
                <p className="tag">Próxima sessão</p>
                <h2>{nextSession.race.raceName}</h2>
                <p className="location">
                  {nextSession.race.locality}, {nextSession.race.country}
                </p>
              </div>
              <div className="session-meta">
                <p>{nextSession.label}</p>
                <p>{formatSessionDate(nextSession.start, timezone)}</p>
              </div>
            </div>
            <Countdown targetDate={nextSession.start} label="Tempo restante" variant="large" />
            <div className="session-grid">
              {upcomingSessionsForRace.map((session) => (
                <div
                  key={session.key}
                  className={`session-card ${
                    session.key === nextSession.key ? 'session-active' : ''
                  }`}
                >
                  <span className="session-title">{session.label}</span>
                  <span className="session-time">{formatSessionDate(session.start, timezone)}</span>
                  <Countdown targetDate={session.start} variant="compact" />
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && !error && (
          <section className="list-section">
            <div className="section-heading">
              <h3>Corridas seguintes</h3>
              <p>Calendário completo do resto da temporada.</p>
            </div>
            <RaceList races={upcomingRaces} timezone={timezone} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
