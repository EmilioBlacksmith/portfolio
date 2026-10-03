export type Service = {
  id: string;
  name: string;
  description?: string;
  /** Public page for the service. */
  url: string;
  /** Endpoint checked for health; defaults to `url`. */
  checkUrl?: string;
  primary?: boolean;
};

/**
 * Services shown on /status. Add entries here as more projects come online
 * (or come back up) — each is checked live, independently.
 */
export const SERVICES: Service[] = [
  {
    id: "portfolio",
    name: "emilioherrera.site",
    description: "Portfolio, blog, and 3D hero.",
    url: "https://emilioherrera.site",
    checkUrl: "https://emilioherrera.site/api/health",
    primary: true,
  },
];

export type CheckResult = {
  id: string;
  name: string;
  description?: string;
  url: string;
  primary: boolean;
  status: "up" | "down";
  httpStatus: number | null;
  responseTimeMs: number;
  checkedAt: string;
};

export type StatusReport = {
  status: "operational" | "degraded";
  checkedAt: string;
  services: CheckResult[];
};

const TIMEOUT_MS = 5000;

async function check(service: Service): Promise<CheckResult> {
  const started = Date.now();
  let httpStatus: number | null = null;

  try {
    const res = await fetch(service.checkUrl ?? service.url, {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "emilio-status/1.0 (+https://emilioherrera.site)" },
    });
    httpStatus = res.status;
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      url: service.url,
      primary: Boolean(service.primary),
      status: res.ok ? "up" : "down",
      httpStatus,
      responseTimeMs: Date.now() - started,
      checkedAt: new Date().toISOString(),
    };
  } catch {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      url: service.url,
      primary: Boolean(service.primary),
      status: "down",
      httpStatus,
      responseTimeMs: Date.now() - started,
      checkedAt: new Date().toISOString(),
    };
  }
}

export async function runChecks(): Promise<StatusReport> {
  const services = await Promise.all(SERVICES.map(check));
  return {
    status: services.every((s) => s.status === "up")
      ? "operational"
      : "degraded",
    checkedAt: new Date().toISOString(),
    services,
  };
}
