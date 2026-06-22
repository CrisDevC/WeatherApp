import {IWeatherService} from './IWeatherService';
import {OpenMeteoService} from './OpenMeteoService';
import {OpenWeatherMapService} from './OpenWeatherMapService';

/**
 * Central registry of all weather service implementations.
 *
 * To add a new provider:
 *   1. Create a class that implements IWeatherService
 *   2. Add one line here: 'Your Service Name': new YourService()
 *   3. Nothing else in the app needs to change.
 *
 * Services are singletons — instantiated once at module load time.
 * If a service needs per-request state, move to a factory pattern instead.
 */
const registry: Record<string, IWeatherService> = {
  'Open-Meteo': new OpenMeteoService(),
  OpenWeatherMap: new OpenWeatherMapService(),
};

/** Ordered list of service names for the UI toggle. */
export const SERVICE_NAMES = Object.keys(registry) as string[];

/** Returns the service for the given name. Throws if unknown. */
export function getService(name: string): IWeatherService {
  const service = registry[name];
  if (!service) {
    throw new Error(
      `Unknown weather service: "${name}". Available: ${SERVICE_NAMES.join(', ')}`,
    );
  }
  return service;
}
