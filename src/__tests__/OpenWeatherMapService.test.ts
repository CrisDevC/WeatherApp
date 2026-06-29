/**
 * OpenWeatherMapService tests.
 * The API key is passed directly to the constructor so tests are independent
 * of how Jest resolves the @env virtual module.
 */
jest.mock('@env', () => ({OPENWEATHERMAP_API_KEY: ''}), {virtual: true});

import {OpenWeatherMapService} from '../services/OpenWeatherMapService';
import {WeatherServiceError} from '../services/types';

const TEST_KEY = 'test-api-key';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const OWM_CURRENT_BODY = {
  name: 'London',
  sys: {country: 'GB'},
  main: {temp: 15.3},
  weather: [{description: 'light rain'}],
};

const OWM_FORECAST_BODY = {
  list: [
    {dt: 1700000000, main: {temp_max: 17, temp_min: 12}, weather: [{description: 'light rain'}]},
    {dt: 1700086400, main: {temp_max: 18, temp_min: 13}, weather: [{description: 'clear sky'}]},
  ],
};

/**
 * Mocks fetch — routes by URL substring so Promise.all gets the right body
 * for /weather vs /forecast.
 */
function mockFetchBoth(
  currentOk: boolean,
  currentStatus: number,
  currentBody: unknown,
  forecastOk = true,
  forecastBody: unknown = OWM_FORECAST_BODY,
) {
  global.fetch = jest.fn().mockImplementation((url: string) => {
    const isForecast = url.includes('/forecast');
    return Promise.resolve({
      ok: isForecast ? forecastOk : currentOk,
      status: isForecast ? 200 : currentStatus,
      json: () => Promise.resolve(isForecast ? forecastBody : currentBody),
    });
  }) as jest.Mock;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('OpenWeatherMapService', () => {
  let service: OpenWeatherMapService;

  beforeEach(() => {
    // Pass key directly — no @env module resolution needed
    service = new OpenWeatherMapService(TEST_KEY);
    jest.resetAllMocks();
  });

  it('has the correct name', () => {
    expect(service.name).toBe('OpenWeatherMap');
  });

  it('returns weather data for a valid location', async () => {
    mockFetchBoth(true, 200, OWM_CURRENT_BODY);

    const result = await service.fetchWeather({query: 'London'});

    expect(result.location).toBe('London, GB');
    expect(result.temperature).toBe(15.3);
    expect(result.condition).toBe('Light rain');
    expect(result.source).toBe('OpenWeatherMap');
  });

  it('returns forecast data', async () => {
    mockFetchBoth(true, 200, OWM_CURRENT_BODY);

    const result = await service.fetchWeather({query: 'London'});

    expect(result.forecast).toBeDefined();
    expect(result.forecast!.length).toBeGreaterThan(0);
  });

  it('capitalises the first letter of the condition description', async () => {
    mockFetchBoth(true, 200, {...OWM_CURRENT_BODY, weather: [{description: 'scattered clouds'}]});

    const result = await service.fetchWeather({query: 'London'});
    expect(result.condition).toBe('Scattered clouds');
  });

  it('includes the API key in the request URL', async () => {
    mockFetchBoth(true, 200, OWM_CURRENT_BODY);

    await service.fetchWeather({query: 'London'});

    const urls = (global.fetch as jest.Mock).mock.calls.map(c => c[0] as string);
    expect(urls.some(u => u.includes(`appid=${TEST_KEY}`))).toBe(true);
    expect(urls.some(u => u.includes('units=metric'))).toBe(true);
  });

  it('URL-encodes the location query', async () => {
    mockFetchBoth(true, 200, OWM_CURRENT_BODY);

    await service.fetchWeather({query: 'New York'});

    const urls = (global.fetch as jest.Mock).mock.calls.map(c => c[0] as string);
    expect(urls.some(u => u.includes(encodeURIComponent('New York')))).toBe(true);
  });

  it('throws NOT_FOUND on HTTP 404', async () => {
    mockFetchBoth(false, 404, {});

    await expect(service.fetchWeather({query: 'Zzznotaplace'})).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('throws SERVICE_UNAVAILABLE on HTTP 401', async () => {
    mockFetchBoth(false, 401, {});

    await expect(service.fetchWeather({query: 'London'})).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
    });
  });

  it('throws SERVICE_UNAVAILABLE on other HTTP errors', async () => {
    mockFetchBoth(false, 500, {});

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
    mockFetchBoth(false, 404, {});

    await expect(service.fetchWeather({query: 'Nowhere'})).rejects.toBeInstanceOf(
      WeatherServiceError,
    );
  });
});

// ── Missing API key ───────────────────────────────────────────────────────────

describe('OpenWeatherMapService — missing API key', () => {
  it('throws SERVICE_UNAVAILABLE when the API key is empty', async () => {
    // Pass empty key directly — no module reset needed
    const svc = new OpenWeatherMapService('');
    await expect(svc.fetchWeather({query: 'London'})).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
    });
  });
});
