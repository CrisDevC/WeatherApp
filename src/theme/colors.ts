/**
 * Base color palette + per-service theme overrides.
 *
 * The `serviceTheme` map is intentionally kept separate from the base palette
 * so the UI can derive its accent color from the selected service at runtime
 * without coupling component logic to individual service names.
 *
 * In the follow-up: we'd likely make a ThemeContext (or a Zustand selector)
 * that re-exports the merged theme so components don't need to know which
 * service is active — they just read from theme.accent / theme.background.
 */

export const colors = {
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
  accent: '#0066CC',
  error: '#CC0000',
};

export interface ServiceTheme {
  accent: string;
  headerBackground: string;
}

export const serviceThemes: Record<string, ServiceTheme> = {
  'Open-Meteo': {
    accent: '#0066CC',
    headerBackground: '#EBF4FF',
  },
  OpenWeatherMap: {
    accent: '#E8761A',
    headerBackground: '#FFF4EB',
  },
};

/** Returns the theme for the given service, falling back to the base accent. */
export function getServiceTheme(serviceName: string): ServiceTheme {
  return (
    serviceThemes[serviceName] ?? {
      accent: colors.accent,
      headerBackground: colors.background,
    }
  );
}
