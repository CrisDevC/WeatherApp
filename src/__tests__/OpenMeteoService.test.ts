import {OpenMeteoService} from '../services/OpenMeteoService';
import {WeatherServiceError} from '../services/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch(...responses: Array<{ok: boolean; status?: number; body: unknown}>) {
  let callCount = 0;
  global.fetch = jest.fn().mockImplementation(() => {
    const resp = responses[callCount++] ?? responses[responses.length - 1];
    return Promise.resolve({
      ok: resp.ok,
      status: resp.status ?? (resp.ok ? 200 : 500),
      json: () => Promise.resolve(resp.body),
    });
  }) as jest.Mock;
}

const GEO_SUCCESS = {
  ok: true,
  body: {
    results: [
      {name: 'Berlin', latitude: 52.52, longitude: 13.405, country: 'Germany'},
    ],
  },
};

const FORECAST_SUCCESS = {
  ok: true,
  body: {
    current: {temperature_2m: 18.5, weather_code: 1},
  },
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe('OpenMeteoService', () => {
  let service: OpenMeteoService;

  beforeEach(() => {
    service = new OpenMeteoService();
    jest.resetAllMocks();
  });

  it('has the correct name', () => {
    expect(service.name).toBe('Open-Meteo');
  });

  it('returns weather data for a valid location', async () => {
    mockFetch(GEO_SUCCESS, FORECAST_SUCCESS);

    const result = await service.fetchWeather({query: 'Berlin'});

    expect(result.location).toBe('Berlin, Germany');
    expect(result.temperature).toBe(18.5);
    expect(result.condition).toBe('Mainly clear');
    expect(result.source).toBe('Open-Meteo');
  });

  it('calls geocoding endpoint first, then forecast endpoint', async () => {
    mockFetch(GEO_SUCCESS, FORECAST_SUCCESS);

    await service.fetchWeather({query: 'Berlin'});

    const calls = (global.fetch as jest.Mock).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][0]).toContain('geocoding-api.open-meteo.com');
    expect(calls[1][0]).toContain('api.open-meteo.com/v1/forecast');
  });

  it('encodes the location query in the geocoding URL', async () => {
    mockFetch(GEO_SUCCESS, FORECAST_SUCCESS);

    await service.fetchWeather({query: 'São Paulo'});

    const geoUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(geoUrl).toContain(encodeURIComponent('São Paulo'));
  });

  it('throws NOT_FOUND when geocoding returns no results', async () => {
    mockFetch({ok: true, body: {results: []}});

    await expect(service.fetchWeather({query: 'Zzznotaplace'})).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('throws NOT_FOUND when geocoding results field is absent', async () => {
    mockFetch({ok: true, body: {}});

    await expect(service.fetchWeather({query: 'Zzznotaplace'})).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('throws SERVICE_UNAVAILABLE when geocoding request fails', async () => {
    mockFetch({ok: false, status: 503, body: {}});

    await expect(service.fetchWeather({query: 'Berlin'})).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
    });
  });

  it('throws SERVICE_UNAVAILABLE when forecast request fails', async () => {
    mockFetch(GEO_SUCCESS, {ok: false, status: 500, body: {}});

    await expect(service.fetchWeather({query: 'Berlin'})).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
    });
  });

  it('throws NETWORK on fetch rejection', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    await expect(service.fetchWeather({query: 'Berlin'})).rejects.toMatchObject({
      code: 'NETWORK',
    });
  });

  it('throws an instance of WeatherServiceError on failure', async () => {
    mockFetch({ok: true, body: {results: []}});

    await expect(service.fetchWeather({query: 'Nowhere'})).rejects.toBeInstanceOf(
      WeatherServiceError,
    );
  });

  // WMO code coverage
  const wmoCases: Array<[number, string]> = [
    [0, 'Clear sky'],
    [2, 'Partly cloudy'],
    [3, 'Overcast'],
    [45, 'Foggy'],
    [51, 'Drizzle'],
    [61, 'Rain'],
    [71, 'Snow'],
    [80, 'Rain showers'],
    [95, 'Thunderstorm'],
    [99, 'Thunderstorm with hail'],
  ];

  it.each(wmoCases)('maps WMO code %i to "%s"', async (code, expected) => {
    mockFetch(GEO_SUCCESS, {
      ok: true,
      body: {current: {temperature_2m: 10, weather_code: code}},
    });

    const result = await service.fetchWeather({query: 'Berlin'});
    expect(result.condition).toBe(expected);
  });
});
