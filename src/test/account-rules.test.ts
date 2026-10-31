import { describe, expect, it } from 'vitest';
import { requireAccountOwner, requireDeletableAccount, requireConfirmedEmail, requireVerificationCode, requireVerifiedOwnerEmail } from '@/lib/account-rules';

describe('Account permissions', () => {
  it('allows only the owner to manage accounts, not approved meal admins', () => {
    expect(() => requireAccountOwner(false)).toThrow();
    expect(() => requireAccountOwner(true)).not.toThrow();
  });
  it('never lets the owner delete their own account', () => {
    expect(() => requireDeletableAccount('owner', 'owner', false)).toThrow();
  });
  it('protects the owner account even when another target ID is supplied', () => {
    expect(() => requireDeletableAccount('caller', 'owner', true)).toThrow();
  });
  it('lets the owner delete another admin account', () => {
    expect(() => requireDeletableAccount('owner', 'admin', false)).not.toThrow();
  });
  it('requires email confirmation for new admins', () => {
    expect(() => requireConfirmedEmail(null)).toThrow();
    expect(() => requireConfirmedEmail('2026-10-31T06:34:00Z')).not.toThrow();
  });
  it('requires email confirmation for the owner too, with no email-based exception', () => {
    expect(() => requireConfirmedEmail(undefined)).toThrow();
  });
  it('accepts complete numeric codes and rejects incomplete or nonnumeric codes', () => {
    expect(requireVerificationCode('123456')).toBe('123456');
    expect(requireVerificationCode('12345678')).toBe('12345678');
    expect(() => requireVerificationCode('12345')).toThrow();
    expect(() => requireVerificationCode('abcdef')).toThrow();
  });
  it('never reports handover complete while the old email remains on the account', () => {
    expect(() => requireVerifiedOwnerEmail('original@example.com', 'buyer@example.com')).toThrow();
    expect(() => requireVerifiedOwnerEmail('buyer@example.com', 'buyer@example.com')).not.toThrow();
  });
});