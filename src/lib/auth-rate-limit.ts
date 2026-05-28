type AttemptEntry = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, AttemptEntry>();

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}

function getBucketKey(request: Request, username: string) {
  return `${getClientIp(request)}:${username.toLowerCase()}`;
}

export function checkLoginRateLimit(request: Request, username: string) {
  const now = Date.now();
  const key = getBucketKey(request, username);
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false };
  }

  if (current.count >= MAX_ATTEMPTS) {
    return { limited: true, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  }

  current.count += 1;
  attempts.set(key, current);
  return { limited: false };
}

export function resetLoginRateLimit(request: Request, username: string) {
  attempts.delete(getBucketKey(request, username));
}
