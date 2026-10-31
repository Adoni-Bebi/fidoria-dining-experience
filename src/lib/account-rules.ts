export function requireAccountOwner(isOwner: boolean) {
  if (!isOwner) throw new Error('Only the restaurant owner can manage accounts.');
}

export function requireDeletableAccount(callerId: string, targetId: string, targetIsOwner: boolean) {
  if (callerId === targetId || targetIsOwner) throw new Error('The owner account cannot be deleted here.');
}

export function requireConfirmedEmail(confirmedAt: string | null | undefined) {
  if (!confirmedAt) throw new Error('Verify your email address before signing in. Enter the code sent to your inbox.');
}

export function requireVerificationCode(code: string) {
  const token = code.trim();
  if (!/^\d{6,8}$/.test(token)) throw new Error('Enter the complete 6–8 digit code from your email.');
  return token;
}

export function requireVerifiedOwnerEmail(actualEmail: string | undefined, requestedEmail: string) {
  if (actualEmail?.toLowerCase() !== requestedEmail.trim().toLowerCase()) {
    throw new Error('The new email is not verified yet. Enter the code from the other inbox as well.');
  }
}