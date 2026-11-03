export type PasswordStrengthLabel = 'WEAK' | 'FAIR' | 'GOOD' | 'STRONG';

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: PasswordStrengthLabel;
  segments: number; // 0 to 4
  hasMinLength: boolean;
}

export const MIN_PASSWORD_LENGTH = 10;

/**
 * Validates whether a password meets the required minimum length of 10 characters.
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    };
  }
  return { valid: true };
}

/**
 * Computes password strength and returns visual indicator segments (0 to 4)
 * with a semantic strength label.
 */
export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { score: 0, label: 'WEAK', segments: 0, hasMinLength: false };
  }

  const hasMinLength = password.length >= MIN_PASSWORD_LENGTH;
  if (!hasMinLength) {
    return {
      score: 0,
      label: 'WEAK',
      segments: 0,
      hasMinLength: false,
    };
  }

  let score = 1;
  if (password.length >= 14) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Normalize score between 1 and 4
  const normalizedScore = Math.min(4, Math.max(1, score - 1));

  let label: PasswordStrengthLabel = 'WEAK';
  if (normalizedScore === 2) label = 'FAIR';
  else if (normalizedScore === 3) label = 'GOOD';
  else if (normalizedScore === 4) label = 'STRONG';

  return {
    score: normalizedScore,
    label,
    segments: normalizedScore,
    hasMinLength: true,
  };
}
