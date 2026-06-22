/**
 * Shared types for the weather services.
 */

export interface Location {
  /** Raw user-entered location string. */
  query: string;
}

export interface WeatherData {
  /** Temperature in degrees Celsius. */
  temperature: number;
  /** Short textual description of conditions (e.g. "Clear", "Cloudy"). */
  condition: string;
  /** Location label as resolved by the service (may differ from query). */
  location: string;
  /** Name of the service that produced this data — useful for the UI. */
  source: string;
}

/**
 * Error thrown by service implementations. Use (or replace with) something
 * that lets the UI distinguish user-fixable errors (bad location) from
 * service errors (provider down, network issue).
 */
export class WeatherServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'NETWORK' | 'SERVICE_UNAVAILABLE' | 'UNKNOWN',
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}
