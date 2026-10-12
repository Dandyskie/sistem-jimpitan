/**
 * Modul Keamanan Dasar (Basic Cybersecurity & Defense) Sistem Jimpitan Digital.
 * Meliputi perlindungan Anti-Brute Force (Rate Limiting), Anti-XSS (Input Sanitizer),
 * dan Anti-Tampering (Validasi Parameter ID).
 */

interface RateLimitTracker {
  attempts: number;
  lastAttemptTime: number;
  lockoutUntil: number;
}

const loginRateLimitMap = new Map<string, RateLimitTracker>();
const actionThrottleMap = new Map<string, number>();

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 detik lockout
const MIN_ACTION_INTERVAL_MS = 350; // 350ms antar aksi untuk cegah spamming

/**
 * Validasi dan pembatasan percobaan login (Anti-Brute Force / Cracker Lockout).
 * @param identifier Username atau alamat IP pengguna
 * @returns { allowed: boolean, remainingLockoutSeconds?: number }
 */
export function checkLoginRateLimit(identifier: string): {
  allowed: boolean;
  remainingLockoutSeconds?: number;
} {
  const now = Date.now();
  const tracker = loginRateLimitMap.get(identifier);

  if (!tracker) {
    return { allowed: true };
  }

  // Jika sedang masa lockout
  if (tracker.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((tracker.lockoutUntil - now) / 1000);
    return { allowed: false, remainingLockoutSeconds: remainingSeconds };
  }

  // Reset percobaan jika lockout telah berlalu
  if (tracker.lockoutUntil > 0 && tracker.lockoutUntil <= now) {
    loginRateLimitMap.delete(identifier);
    return { allowed: true };
  }

  return { allowed: true };
}

/**
 * Catat percobaan login gagal.
 */
export function recordFailedLogin(identifier: string): { isLockedOut: boolean } {
  const now = Date.now();
  const tracker = loginRateLimitMap.get(identifier) || {
    attempts: 0,
    lastAttemptTime: now,
    lockoutUntil: 0,
  };

  tracker.attempts += 1;
  tracker.lastAttemptTime = now;

  if (tracker.attempts >= MAX_LOGIN_ATTEMPTS) {
    tracker.lockoutUntil = now + LOCKOUT_DURATION_MS;
    loginRateLimitMap.set(identifier, tracker);
    return { isLockedOut: true };
  }

  loginRateLimitMap.set(identifier, tracker);
  return { isLockedOut: false };
}

/**
 * Reset catatan login setelah login berhasil.
 */
export function resetLoginRateLimit(identifier: string): void {
  loginRateLimitMap.delete(identifier);
}

/**
 * Perlindungan Anti-Spam / Anti-DDoS hammer pada tombol aksi (Throttling).
 */
export function checkActionThrottle(actionKey: string, minInterval = MIN_ACTION_INTERVAL_MS): boolean {
  const now = Date.now();
  const lastTime = actionThrottleMap.get(actionKey) || 0;

  if (now - lastTime < minInterval) {
    return false; // Ditolak karena terlalu cepat (indikasi click hammer/spam)
  }

  actionThrottleMap.set(actionKey, now);
  return true;
}

/**
 * Sanitasi string input untuk mencegah Cross-Site Scripting (Anti-XSS).
 */
export function sanitizeInputText(input: string, maxLength = 250): string {
  if (!input) return '';

  const clean = input
    .trim()
    .replace(/<[^>]*>?/gm, '') // Hapus tag HTML
    .replace(/[<>'"]/g, '') // Hapus karakter rentan injeksi
    .substring(0, maxLength);

  return clean;
}

/**
 * Validasi integritas ID warga (Anti-Parameter Tampering).
 * Hanya mengizinkan format UUID standar atau format slug aman: res-a-01.
 */
export function isValidResidentId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  const safeIdPattern = /^[a-zA-Z0-9_-]{3,64}$/;
  return safeIdPattern.test(id);
}
