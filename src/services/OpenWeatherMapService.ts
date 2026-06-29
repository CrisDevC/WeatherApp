import {OPENWEATHERMAP_API_KEY} from '@env';
import {IWeatherService} from './IWeatherService';
import {DailyForecast, Location, WeatherData, WeatherServiceError} from './types';

interface OWMCurrentResponse {
  name: string;
  sys: {country: string};
  main: {temp: number};
  weather: Array<{description: string}>;
}

interface OWMForecastItem {
  dt: number;
  main: {temp_max: number; temp_min: number};
  weather: Array<{description: string}>;
}

interface OWMForecastResponse {
  list: OWMForecastItem[];
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export class OpenWeatherMapService implements IWeatherService {
  readonly name = 'OpenWeatherMap';

  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';
  private readonly apiKey: string;

  constructor(apiKey: string = OPENWEATHERMAP_API_KEY) {
    this.apiKey = apiKey;
  }

  async fetchWeather(location: Location): Promise<WeatherData> {
    const apiKey = this.apiKey;

    if (!apiKey) {
      throw new WeatherServiceError(
        'OpenWeatherMap API key is missing. Add OPENWEATHERMAP_API_KEY to your .env file.',
        'SERVICE_UNAVAILABLE',
      );
    }

    const query = encodeURIComponent(location.query);

    // Fetch current weather and 5-day forecast in parallel
    let current: OWMCurrentResponse;
    let forecastData: OWMForecastResponse;

    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`${this.baseUrl}/weather?q=${query}&appid=${apiKey}&units=metric`),
        fetch(`${this.baseUrl}/forecast?q=${query}&appid=${apiKey}&units=metric`),
      ]);

      if (currentRes.status === 404) {
        throw new WeatherServiceError(`Location "${location.query}" not found`, 'NOT_FOUND');
      }
      if (currentRes.status === 401) {
        throw new WeatherServiceError('Invalid OpenWeatherMap API key', 'SERVICE_UNAVAILABLE');
      }
      if (!currentRes.ok) {
        throw new WeatherServiceError(`Request failed (HTTP ${currentRes.status})`, 'SERVICE_UNAVAILABLE');
      }

      current = (await currentRes.json()) as OWMCurrentResponse;
      forecastData = forecastRes.ok
        ? ((await forecastRes.json()) as OWMForecastResponse)
        : {list: []};
    } catch (err) {
      if (err instanceof WeatherServiceError) throw err;
      throw new WeatherServiceError('Network error fetching weather', 'NETWORK');
    }

    // Group 3-hourly items by day and extract max/min per day
    const dayMap = new Map<string, {tempMax: number; tempMin: number; condition: string}>();
    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000);
      const key = date.toISOString().slice(0, 10);
      const existing = dayMap.get(key);
      if (!existing) {
        dayMap.set(key, {
          tempMax: item.main.temp_max,
          tempMin: item.main.temp_min,
          condition: capitalize(item.weather[0]?.description ?? 'Unknown'),
        });
      } else {
        existing.tempMax = Math.max(existing.tempMax, item.main.temp_max);
        existing.tempMin = Math.min(existing.tempMin, item.main.temp_min);
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const forecast: DailyForecast[] = Array.from(dayMap.entries()).map(
      ([dateStr, vals], i) => ({
        day: dateStr === today ? 'Today' : i === 1 ? 'Tomorrow' : DAY_NAMES[new Date(dateStr).getDay()],
        tempMax: Math.round(vals.tempMax),
        tempMin: Math.round(vals.tempMin),
        condition: vals.condition,
      }),
    );

    const condition = capitalize(current.weather[0]?.description ?? 'Unknown');

    return {
      temperature: current.main.temp,
      condition,
      location: `${current.name}, ${current.sys.country}`,
      source: this.name,
      forecast,
    };
  }
}
