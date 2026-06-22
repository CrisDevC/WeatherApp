import {OPENWEATHERMAP_API_KEY} from '@env';
import {IWeatherService} from './IWeatherService';
import {Location, WeatherData, WeatherServiceError} from './types';

interface OWMResponse {
  name: string;
  sys: {country: string};
  main: {temp: number};
  weather: Array<{description: string}>;
}

export class OpenWeatherMapService implements IWeatherService {
  readonly name = 'OpenWeatherMap';

  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

  async fetchWeather(location: Location): Promise<WeatherData> {
    const apiKey = OPENWEATHERMAP_API_KEY;

    if (!apiKey) {
      throw new WeatherServiceError(
        'OpenWeatherMap API key is missing. Add OPENWEATHERMAP_API_KEY to your .env file.',
        'SERVICE_UNAVAILABLE',
      );
    }

    const url =
      `${this.baseUrl}?q=${encodeURIComponent(location.query)}` +
      `&appid=${apiKey}&units=metric`;

    let data: OWMResponse;
    try {
      const res = await fetch(url);

      if (res.status === 404) {
        throw new WeatherServiceError(
          `Location "${location.query}" not found`,
          'NOT_FOUND',
        );
      }
      if (res.status === 401) {
        throw new WeatherServiceError(
          'Invalid OpenWeatherMap API key',
          'SERVICE_UNAVAILABLE',
        );
      }
      if (!res.ok) {
        throw new WeatherServiceError(
          `OpenWeatherMap request failed (HTTP ${res.status})`,
          'SERVICE_UNAVAILABLE',
        );
      }

      data = (await res.json()) as OWMResponse;
    } catch (err) {
      if (err instanceof WeatherServiceError) throw err;
      throw new WeatherServiceError(
        'Network error fetching weather',
        'NETWORK',
      );
    }

    // Capitalise first letter of condition description
    const raw = data.weather[0]?.description ?? 'Unknown';
    const condition = raw.charAt(0).toUpperCase() + raw.slice(1);

    return {
      temperature: data.main.temp,
      condition,
      location: `${data.name}, ${data.sys.country}`,
      source: this.name,
    };
  }
}
