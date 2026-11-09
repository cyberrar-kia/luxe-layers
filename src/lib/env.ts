interface Env {
  DATABASE_URL: string;
  SESSION_SECRET: string;
  ADMIN_PASSWORD_HASH: string;
  APP_URL: string;
  MONNIFY_API_KEY: string | null;
  MONNIFY_SECRET_KEY: string | null;
  MONNIFY_CONTRACT_CODE: string | null;
  MONNIFY_BASE_URL: string;
}

let cached: Env | null = null;

/** Monnify mock mode is on whenever the real keys haven't been set yet
 * (she's still creating the account) — same pattern Selmo uses for
 * WhatsApp/Instagram before a merchant connects. Flip to live the moment
 * the three MONNIFY_* vars are filled in; no code change needed. */
export function monnifyMockMode(): boolean {
  const e = env();
  return !e.MONNIFY_API_KEY || !e.MONNIFY_SECRET_KEY || !e.MONNIFY_CONTRACT_CODE;
}

export function env(): Env {
  if (cached) return cached;
  const required = (name: string): string => {
    const v = process.env[name];
    if (!v) throw new Error(`Missing required env var ${name}`);
    return v;
  };
  cached = {
    DATABASE_URL: required("DATABASE_URL"),
    SESSION_SECRET: required("SESSION_SECRET"),
    ADMIN_PASSWORD_HASH: required("ADMIN_PASSWORD_HASH"),
    APP_URL: process.env.APP_URL || "http://localhost:3000",
    MONNIFY_API_KEY: process.env.MONNIFY_API_KEY || null,
    MONNIFY_SECRET_KEY: process.env.MONNIFY_SECRET_KEY || null,
    MONNIFY_CONTRACT_CODE: process.env.MONNIFY_CONTRACT_CODE || null,
    MONNIFY_BASE_URL: process.env.MONNIFY_BASE_URL || "https://sandbox.monnify.com",
  };
  return cached;
}
