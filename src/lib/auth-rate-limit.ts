type AttemptEntry = {
  count: number;
  resetAt: number;
};

export const LOGIN_RATE_LIMIT_WINDOW_MS = 60_000;
export const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5;

type LoginRateLimitBucket = {
  ip: string;
  username: string;
};

export type LoginRiskLevel = "low" | "medium" | "high";

export type LoginRiskSignals = {
  ipSwitchCountLastMinute: number;
  usernameBurstLastMinute: number;
  failedStreak: number;
  suspiciousUserAgent?: boolean;
};

export type LoginRiskScoreResult = {
  score: number;
  level: LoginRiskLevel;
  reasons: string[];
};

type CreateLoginRateLimiterOptions = {
  windowMs?: number;
  maxAttempts?: number;
  now?: () => number;
};

export function createLoginRateLimiter(options?: CreateLoginRateLimiterOptions) {
  const windowMs = options?.windowMs ?? LOGIN_RATE_LIMIT_WINDOW_MS;
  const maxAttempts = options?.maxAttempts ?? LOGIN_RATE_LIMIT_MAX_ATTEMPTS;
  const now = options?.now ?? Date.now;
  const attempts = new Map<string, AttemptEntry>();

  return {
    check(bucket: LoginRateLimitBucket) {
      const currentNow = now();
      const key = `${bucket.ip}:${bucket.username.toLowerCase()}`;
      const current = attempts.get(key);

      if (!current || current.resetAt <= currentNow) {
        attempts.set(key, { count: 1, resetAt: currentNow + windowMs });
        return { limited: false as const };
      }

      if (current.count >= maxAttempts) {
        return {
          limited: true as const,
          retryAfterSeconds: Math.ceil((current.resetAt - currentNow) / 1000),
        };
      }

      current.count += 1;
      attempts.set(key, current);
      return { limited: false as const };
    },
    reset(bucket: LoginRateLimitBucket) {
      attempts.delete(`${bucket.ip}:${bucket.username.toLowerCase()}`);
    },
  };
}

const loginRateLimiter = createLoginRateLimiter();

export function assessLoginRisk(signals: LoginRiskSignals): LoginRiskScoreResult {
  let score = 10;
  const reasons: string[] = [];

  if (signals.ipSwitchCountLastMinute >= 4) {
    score += 35;
    reasons.push("短时多 IP 切换");
  } else if (signals.ipSwitchCountLastMinute >= 2) {
    score += 15;
    reasons.push("IP 波动明显");
  }

  if (signals.usernameBurstLastMinute >= 8) {
    score += 30;
    reasons.push("账号撞库节奏高");
  } else if (signals.usernameBurstLastMinute >= 4) {
    score += 12;
    reasons.push("短时重试较密集");
  }

  if (signals.failedStreak >= 5) {
    score += 28;
    reasons.push("连续失败过多");
  } else if (signals.failedStreak >= 3) {
    score += 14;
    reasons.push("存在连续失败");
  }

  if (signals.suspiciousUserAgent) {
    score += 18;
    reasons.push("可疑 User-Agent");
  }

  const bounded = Math.min(100, Math.max(0, score));
  const level: LoginRiskLevel =
    bounded >= 70 ? "high" : bounded >= 40 ? "medium" : "low";

  return { score: bounded, level, reasons };
}

export function getAdaptiveLoginLimitByRisk(riskLevel: LoginRiskLevel) {
  switch (riskLevel) {
    case "high":
      return 2;
    case "medium":
      return 3;
    case "low":
    default:
      return LOGIN_RATE_LIMIT_MAX_ATTEMPTS;
  }
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}

export function checkLoginRateLimit(request: Request, username: string) {
  return loginRateLimiter.check({ ip: getClientIp(request), username });
}

export function resetLoginRateLimit(request: Request, username: string) {
  loginRateLimiter.reset({ ip: getClientIp(request), username });
}
