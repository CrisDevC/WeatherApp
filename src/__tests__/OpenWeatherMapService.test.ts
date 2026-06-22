/**
 * OpenWeatherMapService tests.
 *
 * @env is mocked via jest.mock so we don't need a real .env file in CI.
 */
jest.mock('@env', () => ({OPENWEATHERMAP_API_KEY: 'test-api-key'}), {
  virtual: true,
});

import {OpenWeatherMapService} from '../services/OpenWeatherMapService';
import {WeatherServiceError} from '../services/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch(ok: boolean, status: number, body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  }) as jest.Mock;
}

const OWM_SUCCESS_BODY = {
  name: 'London',
  sys: {country: 'GB'},
  main: {temp: 15.3},
  weather: [{description: 'light rain'}],
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe('OpenWeatherMapService', () => {
  let service: OpenWeatherMapService;

  beforeEach(() => {
    service = new OpenWeatherMapService();
    jest.resetAllMocks();
  });

  it('has the correct name', () => {
    expect(service.name).toBe('OpenWeatherMap');
  });

  it('returns weather data for a valid location', async () => {
    mockFetch(true, 200, OWM_SUCCESS_BODY);

    const result = await service.fetchWeather({query: 'London'});

    expect(result.location).toBe('London, GB');
    expect(result.temperature).toBe(15.3);
    expect(result.condition).toBe('Light rain'); // capitalised
    expect(result.source).toBe('OpenWeatherMap');
  });

  it('capitalises the first letter of the condition description', async () => {
    mockFetch(true, 200, {
      ...OWM_SUCCESS_BODY,
      weather: [{description: 'scattered clouds'}],
    });

    const result = await service.fetchWeather({query: 'London'});
    expect(result.condition).toBe('Scattered clouds');
  });

  it('includes the API key in the request URL', async () => {
    mockFetch(true, 200, OWM_SUCCESS_BODY);

    await service.fetchWeather({query: 'London'});

    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('appid=test-api-key');
    expect(url).toContain('units=metric');
  });

  it('URL-encodes the location query', async () => {
    mockFetch(true, 200, OWM_SUCCESS_BODY);

    await service.fetchWeather({query: 'New York'});

    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain(encodeURIComponent('New York'));
  });

  it('throws NOT_FOUND on HTTP 404', async () => {
    mockFetch(false, 404, {});

    await expect(service.fetchWeather({query: 'Zzznotaplace'})).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('throws SERVICE_UNAVAILABLE on HTTP 401 (invalid key)', async () => {
    mockFetch(false, 401, {});

    await expect(service.fetchWeather({query: 'London'})).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
    });
  });

  it('throws SERVICE_UNAVAILABLE on other HTTP errors', async () => {
    mockFetch(false, 500, {});

    await expect(service.fetchWeather({query: 'London'})).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
    });
  });

  it('throws NETWORK on fetch rejection', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch'));

    await expect(service.fetchWeather({query: 'London'})).rejects.toMatchObject({
      code: 'NETWORK',
    });
  });

  it('throws an instance of WeatherServiceError on failure', async () => {
    mockFetch(false, 404, {});

    await expect(service.fetchWeather({query: 'Nowhere'})).rejects.toBeInstanceOf(
      WeatherServiceError,
    );
  });
});

// ── Missing API key ───────────────────────────────────────────────────────────

describe('OpenWeatherMapService — missing API key', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.mock('@env', () => ({OPENWEATHERMAP_API_KEY: ''}), {virtual: true});
  });

  it('throws SERVICE_UNAVAILABLE when the API key is empty', async () => {
    // Re-import after resetting modules so the new mock takes effect.
    const {OpenWeatherMapService: Fresh} =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../services/OpenWeatherMapService') as typeof import('../services/OpenWeatherMapService');

    const svc = new Fresh();
    await expect(svc.fetchWeather({query: 'London'})).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
    });
  });
});
