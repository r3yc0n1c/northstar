import { describe, expect, it } from 'vitest';
import { MIN_PASSWORD_LENGTH, getPasswordStrength, validatePassword } from './password';

describe('password domain logic', () => {
  it('enforces minimum 10 characters length', () => {
    expect(validatePassword('').valid).toBe(false);
    expect(validatePassword('123456789').valid).toBe(false);
    expect(validatePassword('123456789').error).toBe(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    );

    const validResult = validatePassword('1234567890');
    expect(validResult.valid).toBe(true);
    expect(validResult.error).toBeUndefined();
  });

  it('computes 0 segments for passwords under 10 characters', () => {
    const strength = getPasswordStrength('Short1!');
    expect(strength.hasMinLength).toBe(false);
    expect(strength.segments).toBe(0);
    expect(strength.label).toBe('WEAK');
  });

  it('computes FAIR/GOOD/STRONG for varied passwords over 10 characters', () => {
    const fair = getPasswordStrength('abcdefghij');
    expect(fair.hasMinLength).toBe(true);
    expect(fair.segments).toBeGreaterThanOrEqual(1);

    const strong = getPasswordStrength('Kestrel#2025_Obsidian');
    expect(strong.hasMinLength).toBe(true);
    expect(strong.segments).toBe(4);
    expect(strong.label).toBe('STRONG');
  });
});
