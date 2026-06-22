import {Location, WeatherData} from './types';

/**
 * Contract that every weather service implementation must satisfy.
 *
 * Implementations live alongside this file (see OpenMeteoService and
 * OpenWeatherMapService). You can extend this interface if you need to,
 * but think carefully about leaking provider-specific concepts into it —
 * the whole point of this abstraction is that the rest of the app should
 * not care which provider is in use.
 */
export interface IWeatherService {
  /** Human-readable name shown in the UI (e.g. for the service toggle). */
  readonly name: string;

  /**
   * Fetch current weather for the given location.
   *
   * Should throw a {@link WeatherServiceError} on failure rather than
   * returning a partial / sentinel value.
   */
  fetchWeather(location: Location): Promise<WeatherData>;
}
