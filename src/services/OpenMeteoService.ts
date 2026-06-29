import {IWeatherService} from './IWeatherService';
import {DailyForecast, Location, WeatherData, WeatherServiceError} from './types';

function wmoCodeToCondition(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 56 && code <= 57) return 'Freezing drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 66 && code <= 67) return 'Freezing rain';
  if (code >= 71 && code <= 75) return 'Snow';
  if (code === 77) return 'Snow grains';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code === 95) return 'Thunderstorm';
  if (code === 96 || code === 99) return 'Thunderstorm with hail';
  return 'Unknown';
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}

export class OpenMeteoService implements IWeatherService {
  readonly name = 'Open-Meteo';

  private readonly geocodingBaseUrl =
    'https://geocoding-api.open-meteo.com/v1/search';
  private readonly forecastBaseUrl = 'https://api.open-meteo.com/v1/forecast';

  async fetchWeather(location: Location): Promise<WeatherData> {
    const geoUrl = `${this.geocodingBaseUrl}?name=${encodeURIComponent(location.query)}&count=1&language=en&format=json`;

    let geoData: GeocodingResponse;
    try {
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) {
        throw new WeatherServiceError('Geocoding request failed', 'SERVICE_UNAVAILABLE');
      }
      geoData = (await geoRes.json()) as GeocodingResponse;
    } catch (err) {
      if (err instanceof WeatherServiceError) throw err;
      throw new WeatherServiceError('Network error during geocoding', 'NETWORK');
    }

    if (!geoData.results || geoData.results.length === 0) {
      throw new WeatherServiceError(`Location "${location.query}" not found`, 'NOT_FOUND');
    }

    const {latitude, longitude, name, country} = geoData.results[0];

    const forecastUrl =
      `${this.forecastBaseUrl}?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
      `&timezone=auto&forecast_days=7`;

    let forecastData: ForecastResponse;
    try {
      const forecastRes = await fetch(forecastUrl);
      if (!forecastRes.ok) {
        throw new WeatherServiceError('Forecast request failed', 'SERVICE_UNAVAILABLE');
      }
      forecastData = (await forecastRes.json()) as ForecastResponse;
    } catch (err) {
      if (err instanceof WeatherServiceError) throw err;
      throw new WeatherServiceError('Network error fetching forecast', 'NETWORK');
    }

    const forecast: DailyForecast[] = forecastData.daily.time.map((dateStr, i) => {
      const dayIndex = new Date(dateStr).getDay();
      return {
        day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_NAMES[dayIndex],
        tempMax: Math.round(forecastData.daily.temperature_2m_max[i]),
        tempMin: Math.round(forecastData.daily.temperature_2m_min[i]),
        condition: wmoCodeToCondition(forecastData.daily.weather_code[i]),
      };
    });

    return {
      temperature: forecastData.current.temperature_2m,
      condition: wmoCodeToCondition(forecastData.current.weather_code),
      location: `${name}, ${country}`,
      source: this.name,
      forecast,
    };
  }
}
