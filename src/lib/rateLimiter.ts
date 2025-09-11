interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const attempts = new Map<string, RateLimitEntry>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes

export function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry) {
    attempts.set(key, {
      attempts: 1,
      lastAttempt: now
    });
    return { allowed: true };
  }

  // Check if locked
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) 
    };
  }

  // Reset if window expired
  if (now - entry.lastAttempt > WINDOW_MS) {
    attempts.set(key, {
      attempts: 1,
      lastAttempt: now
    });
    return { allowed: true };
  }

  // Increment attempts
  entry.attempts++;
  entry.lastAttempt = now;

  // Lock if exceeded
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    return { 
      allowed: false, 
      retryAfter: Math.ceil(LOCKOUT_MS / 1000) 
    };
  }

  attempts.set(key, entry);
  return { allowed: true };
}

export function resetRateLimit(key: string): void {
  attempts.delete(key);
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of attempts.entries()) {
    if (now - entry.lastAttempt > WINDOW_MS && (!entry.lockedUntil || now > entry.lockedUntil)) {
      attempts.delete(key);
    }
  }
}, 60000); // Every minute