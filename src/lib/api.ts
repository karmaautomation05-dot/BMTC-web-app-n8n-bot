const BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }

  return res.json();
}

// --- Types ---

export interface Stats {
  todayAppointments: number;
  totalAppointments: number;
  totalPatient: number;
  totalRevenue: number;
}

export interface CallLog {
  id: number;
  callID: string;
  sourceNumber: string | null;
  destinationNumber: string | null;
  displayNumber: string | null;
  direction: string | null;
  callType: string | null;
  leg: string | null;
  status: string | null;
  agentStatus: string | null;
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
  accountID: string | null;
  eventID: string | null;
  resourceURL: string | null;
  dtmf: string | null;
  callBackParentID: string | null;
  callBackParams: Record<string, unknown> | null;
  dataSource: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// --- Auth ---

export const login = (username: string, password: string) =>
  request<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

// --- Stats ---

export const getStats = () => request<Stats>("/stats");

// --- Call Logs ---

export const getCallLogs = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<PaginatedResponse<CallLog>>(`/call-logs${qs ? "?" + qs : ""}`);
};
