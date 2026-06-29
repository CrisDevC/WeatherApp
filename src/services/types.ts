export interface Location {
  query: string;
}

export interface DailyForecast {
  /** Day label e.g. "Mon", "Tue" */
  day: string;
  tempMax: number;
  tempMin: number;
  condition: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  source: string;
  /** Optional 7-day daily forecast — provided by services that support it */
  forecast?: DailyForecast[];
}

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'NETWORK' | 'SERVICE_UNAVAILABLE' | 'UNKNOWN',
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}
