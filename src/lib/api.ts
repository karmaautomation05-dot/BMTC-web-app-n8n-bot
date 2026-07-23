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
  stats?: {
    inbound: number;
    outbound: number;
    answered: number;
    missed: number;
    total: number;
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

// --- Payments ---

export interface RazorpayPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  description: string | null;
  email: string | null;
  contact: string | null;
  created_at: number;
  fee: number | null;
  tax: number | null;
  error_description: string | null;
  card_id: string | null;
  bank: string | null;
  order_id: string | null;
  invoice_id: string | null;
  vpa: string | null;
  wallet: string | null;
  acquirer_data: {
    rrn?: string | null;
    bank_transaction_id?: string | null;
    upi_transaction_id?: string | null;
    upi?: {
      payer_account_type?: string | null;
      vpa?: string | null;
    } | null;
  } | null;
}

export interface RazorpayPaymentsResponse {
  items: RazorpayPayment[];
  count: number;
  totalAmount: number;
  page: number;
  perPage: number;
}

export const getPayments = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<RazorpayPaymentsResponse>(`/payments${qs ? "?" + qs : ""}`);
};

// --- Chat Stats ---

export interface ChatStats {
  inbound: number;
  outbound: number;
  sent: number;
  delivered: number;
  read: number;
}

export const getChatStats = () => request<ChatStats>("/chat-stats");

// --- Appointments ---

export interface Appointment {
  id: number;
  appointmentId: string;
  doctorId: number;
  patientId: number;
  patientName: string;
  location: string;
  timestamp: string;
  timeSlot: string;
  phone: string;
  fees: number;
  rzpTxnId: string | null;
  doctor: { id: number; name: string };
  patient: { id: number; name: string; phone: string };
}

export const getAppointments = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<PaginatedResponse<Appointment>>(`/appointments${qs ? "?" + qs : ""}`);
};
