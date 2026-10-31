export function requireAccountOwner(isOwner: boolean) {
  if (!isOwner) throw new Error('Only the restaurant owner can manage accounts.');
}

export function requireDeletableAccount(callerId: string, targetId: string, targetIsOwner: boolean) {
  if (callerId === targetId || targetIsOwner) throw new Error('The owner account cannot be deleted here.');
}

export function requireConfirmedEmail(confirmedAt: string | null | undefined) {
  if (!confirmedAt) throw new Error('Confirm your email address before signing in. Check your inbox for the confirmation link.');
}