import {validateLocation} from '../validation/locationValidator';

describe('validateLocation', () => {
  // ── Valid inputs ────────────────────────────────────────────────────────────

  it('accepts a simple city name', () => {
    const result = validateLocation('Berlin');
    expect(result).toEqual({valid: true, value: 'Berlin'});
  });

  it('accepts a city with a comma and country code', () => {
    const result = validateLocation('London, UK');
    expect(result).toEqual({valid: true, value: 'London, UK'});
  });

  it('accepts a city with accented characters', () => {
    const result = validateLocation('São Paulo');
    expect(result).toEqual({valid: true, value: 'São Paulo'});
  });

  it('accepts a hyphenated city name', () => {
    const result = validateLocation('Saint-Étienne');
    expect(result).toEqual({valid: true, value: 'Saint-Étienne'});
  });

  it('accepts a city with a period', () => {
    const result = validateLocation('St. Louis');
    expect(result).toEqual({valid: true, value: 'St. Louis'});
  });

  it('accepts a city with an apostrophe', () => {
    const result = validateLocation("Coeur d'Alene");
    expect(result).toEqual({valid: true, value: "Coeur d'Alene"});
  });

  it('trims leading and trailing whitespace', () => {
    const result = validateLocation('  Munich  ');
    expect(result).toEqual({valid: true, value: 'Munich'});
  });

  it('accepts exactly 2 characters', () => {
    const result = validateLocation('LA');
    expect(result.valid).toBe(true);
  });

  it('accepts exactly 100 characters', () => {
    // 100 'a' characters
    const result = validateLocation('a'.repeat(100));
    expect(result.valid).toBe(true);
  });

  // ── Invalid: too short ──────────────────────────────────────────────────────

  it('rejects an empty string', () => {
    const result = validateLocation('');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toMatch(/at least 2/i);
    }
  });

  it('rejects a single character', () => {
    const result = validateLocation('A');
    expect(result.valid).toBe(false);
  });

  it('rejects a string that is only whitespace', () => {
    const result = validateLocation('   ');
    expect(result.valid).toBe(false);
  });

  // ── Invalid: too long ───────────────────────────────────────────────────────

  it('rejects a string longer than 100 characters', () => {
    const result = validateLocation('a'.repeat(101));
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toMatch(/100/);
    }
  });

  // ── Invalid: disallowed characters ─────────────────────────────────────────

  it('rejects a string with an exclamation mark', () => {
    const result = validateLocation('Berlin!');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toMatch(/invalid characters/i);
    }
  });

  it('rejects a string with an emoji', () => {
    const result = validateLocation('Berlin 🌤');
    expect(result.valid).toBe(false);
  });

  it('rejects a string with a forward slash', () => {
    const result = validateLocation('New/York');
    expect(result.valid).toBe(false);
  });

  // ── Invalid: no letters ─────────────────────────────────────────────────────

  it('rejects a string of only digits', () => {
    const result = validateLocation('12345');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toMatch(/at least one letter/i);
    }
  });

  it('rejects a string of only hyphens', () => {
    const result = validateLocation('---');
    expect(result.valid).toBe(false);
  });
});
