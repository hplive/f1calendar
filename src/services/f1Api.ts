const API_URLS = [
  'https://ergast.com/api/f1/current.json',
  'https://api.jolpi.ca/ergast/f1/current.json',
];

export type SessionType = 'FP1' | 'FP2' | 'FP3' | 'QUALIFYING' | 'SPRINT' | 'RACE';

export interface RaceSession {
  key: string;
  type: SessionType;
  label: string;
  start: Date;
}

export interface RaceWeekend {
  id: string;
  season: string;
  round: number;
  raceName: string;
  locality: string;
  country: string;
  circuitName: string;
  sessions: RaceSession[];
}

interface ErgastSession {
  date: string;
  time?: string;
}

interface ErgastRace {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  FirstPractice?: ErgastSession;
  SecondPractice?: ErgastSession;
  ThirdPractice?: ErgastSession;
  Qualifying?: ErgastSession;
  Sprint?: ErgastSession;
  date: string;
  time?: string;
}

const sessionMap = [
  { key: 'FirstPractice', type: 'FP1', label: 'Treino Livre 1' },
  { key: 'SecondPractice', type: 'FP2', label: 'Treino Livre 2' },
  { key: 'ThirdPractice', type: 'FP3', label: 'Treino Livre 3' },
  { key: 'Qualifying', type: 'QUALIFYING', label: 'Qualificação' },
  { key: 'Sprint', type: 'SPRINT', label: 'Sprint' },
  { key: 'Race', type: 'RACE', label: 'Corrida' },
] as const;

const buildDate = (date: string, time?: string) => {
  const normalizedTime = time ? (time.endsWith('Z') ? time : `${time}Z`) : '00:00:00Z';
  return new Date(`${date}T${normalizedTime}`);
};

const mapRace = (race: ErgastRace): RaceWeekend => {
  const sessions: RaceSession[] = [];

  sessionMap.forEach((config) => {
    let sessionData: ErgastSession | undefined;

    if (config.key === 'Race') {
      sessionData = { date: race.date, time: race.time };
    } else if (config.key in race) {
      sessionData = race[config.key as keyof ErgastRace] as ErgastSession | undefined;
    }

    if (!sessionData) return;

    sessions.push({
      key: `${race.round}-${config.type}`,
      type: config.type,
      label: config.label,
      start: buildDate(sessionData.date, sessionData.time),
    });
  });

  sessions.sort((a, b) => a.start.getTime() - b.start.getTime());

  return {
    id: `${race.season}-${race.round}`,
    season: race.season,
    round: Number(race.round),
    raceName: race.raceName,
    circuitName: race.Circuit.circuitName,
    locality: race.Circuit.Location.locality,
    country: race.Circuit.Location.country,
    sessions,
  };
};

export const fetchCurrentSeason = async (): Promise<RaceWeekend[]> => {
  let lastError: unknown;

  for (const url of API_URLS) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Resposta inválida da API (${response.status})`);
      }
      const data = (await response.json()) as {
        MRData?: { RaceTable?: { Races?: ErgastRace[] } };
      };
      const races = data?.MRData?.RaceTable?.Races ?? [];
      if (!races.length) {
        throw new Error('Calendário indisponível');
      }
      return races.map(mapRace);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Não foi possível carregar o calendário da F1');
};
