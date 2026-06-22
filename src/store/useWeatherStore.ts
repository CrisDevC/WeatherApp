import {create} from 'zustand';
import {getService} from '../services/serviceRegistry';
import {WeatherData, WeatherServiceError} from '../services/types';
import {validateLocation} from '../validation/locationValidator';

interface WeatherState {
  /** Raw text currently in the location input. */
  locationText: string;
  /** Name of the active weather service (matches serviceRegistry key). */
  selectedServiceName: string;
  /** Last successfully fetched weather data. Null until first successful fetch. */
  weather: WeatherData | null;
  /** True while a fetch is in flight. */
  loading: boolean;
  /**
   * Human-readable error to surface in the UI. Null when no error.
   * Set on validation failure or service error; cleared on new fetch start.
   */
  error: string | null;

  /** Update the raw location text (does not trigger a fetch). */
  setLocationText: (text: string) => void;

  /**
   * Switch to a different service. If a valid location is already set,
   * automatically re-fetches weather from the new service.
   */
  selectService: (name: string) => void;

  /**
   * Validate the current locationText and, if valid, fetch weather from the
   * currently selected service. Exposed so the screen can call it on submit.
   */
  fetchWeather: () => Promise<void>;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  locationText: '',
  selectedServiceName: 'Open-Meteo',
  weather: null,
  loading: false,
  error: null,

  setLocationText: (text: string) => {
    set({locationText: text, error: null});
  },

  selectService: (name: string) => {
    set({selectedServiceName: name});

    // Auto-refresh if a valid location is already showing weather.
    const {locationText} = get();
    const validation = validateLocation(locationText);
    if (validation.valid && get().weather !== null) {
      // Kick off a fetch with the new service; don't await here.
      get().fetchWeather();
    }
  },

  fetchWeather: async () => {
    const {locationText, selectedServiceName} = get();

    const validation = validateLocation(locationText);
    if (!validation.valid) {
      set({error: validation.reason});
      return;
    }

    set({loading: true, error: null});

    try {
      const service = getService(selectedServiceName);
      const weather = await service.fetchWeather({query: validation.value});
      set({weather, loading: false});
    } catch (err) {
      const message =
        err instanceof WeatherServiceError
          ? err.message
          : 'Something went wrong. Please try again.';
      set({loading: false, error: message, weather: null});
    }
  },
}));
