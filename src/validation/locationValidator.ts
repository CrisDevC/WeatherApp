/**
 * Validates a user-entered location string.
 *
 * Rules (documented in NOTES.md):
 *
 * 1. Trimmed value must be between 2 and 100 characters.
 *    - 2 chars: allows single-character city abbreviations like "DC" or "LA".
 *    - 100 chars: prevents absurdly long inputs; no real place name is longer.
 *
 * 2. Allowed characters: Unicode letters, digits, spaces, hyphens (-),
 *    commas (,), periods (.), and apostrophes (').
 *    - Unicode letters (\\p{L}): covers accented and non-Latin scripts so
 *      cities like "Malmö", "São Paulo", "München" all pass.
 *    - Commas/spaces: needed for "Washington, DC", "New York, NY".
 *    - Hyphens: needed for "Saint-Étienne", "Oranjestad-West".
 *    - Periods: needed for "St. Louis", "Washington D.C.".
 *    - Apostrophes: needed for "Coeur d'Alene".
 *    - Digits: needed for "Route 66" style names (edge case, low harm).
 *
 * 3. Must contain at least one Unicode letter. A string of only digits,
 *    spaces, or punctuation is not a valid location.
 *
 * The function does NOT make a network call — it only inspects the string.
 * Downstream services will return a NOT_FOUND error for queries that are
 * syntactically valid but refer to non-existent places.
 */

export type ValidationResult =
  | {valid: true; value: string}
  | {valid: false; reason: string};

// Characters we allow: letters (Unicode), digits, space, hyphen, comma,
// period, apostrophe. The /u flag enables Unicode property escapes.
const ALLOWED_CHARS_RE = /^[\p{L}\d\s\-,.']+$/u;

// Must contain at least one letter.
const HAS_LETTER_RE = /\p{L}/u;

export function validateLocation(input: string): ValidationResult {
  const trimmed = input.trim();

  if (trimmed.length < 2) {
    return {
      valid: false,
      reason: 'Location must be at least 2 characters.',
    };
  }

  if (trimmed.length > 100) {
    return {
      valid: false,
      reason: 'Location must be 100 characters or fewer.',
    };
  }

  if (!ALLOWED_CHARS_RE.test(trimmed)) {
    return {
      valid: false,
      reason:
        'Location contains invalid characters. Use letters, spaces, hyphens, commas, or periods.',
    };
  }

  if (!HAS_LETTER_RE.test(trimmed)) {
    return {
      valid: false,
      reason: 'Location must contain at least one letter.',
    };
  }

  return {valid: true, value: trimmed};
}
