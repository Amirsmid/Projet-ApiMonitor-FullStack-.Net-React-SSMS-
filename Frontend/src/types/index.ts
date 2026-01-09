export interface ApiLog {
  id: number;
  timestampUtc: string;
  method: string;
  path: string;
  queryString?: string;
  statusCode: number;
  durationMs?: number;
  clientIp?: string;
  userAgent?: string;
  tokenHash?: string;
  extraJson?: string;
}

export interface OverviewData {
  total: number;
  okCount: number;
  errorCount: number;
  avgDurationMs: number;
  p95DurationMs: number;
  errorRate: number;
  alerts: string[];
}

export interface TimeSeriesPoint {
  timestampUtc: string;
  count: number;
  avgDurationMs: number;
}

export interface EndpointStats {
  path: string;
  count: number;
  avgDurationMs: number;
  errorCount: number;
  successRate: number;
}

export interface TokenStats {
  tokenHash: string;
  usageCount: number;
  lastUsed: string;
  firstUsed: string;
  avgDurationMs: number;
  errorCount: number;
  successRate: number;
}

export interface AuthResponse {
  token: string;
  user: {
    email: string;
    displayName: string;
    role: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface FilterOptions {
  method?: string;
  statusCode?: number;
  fromDate?: string;
  toDate?: string;
  path?: string;
}
