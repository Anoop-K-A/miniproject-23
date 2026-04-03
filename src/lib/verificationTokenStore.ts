// Shared in-memory verification token store
// In production, use Redis or database storage
export interface VerificationToken {
  email: string;
  firebaseUid: string;
  createdAt: number;
}

const verificationTokens = new Map<string, VerificationToken>();

export function storeVerificationToken(
  token: string,
  data: VerificationToken,
): void {
  verificationTokens.set(token, data);
}

export function getVerificationToken(token: string): VerificationToken | null {
  return verificationTokens.get(token) || null;
}

export function deleteVerificationToken(token: string): void {
  verificationTokens.delete(token);
}

export function isTokenExpired(token: string): boolean {
  const data = verificationTokens.get(token);
  if (!data) return true;

  const tokenAge = Date.now() - data.createdAt;
  const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

  return tokenAge > EXPIRY_TIME;
}

export function cleanupExpiredTokens(): void {
  const now = Date.now();
  const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

  for (const [token, data] of verificationTokens.entries()) {
    if (now - data.createdAt > EXPIRY_TIME) {
      verificationTokens.delete(token);
    }
  }
}
