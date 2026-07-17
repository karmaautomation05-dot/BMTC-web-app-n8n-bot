import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: api.getStats,
    refetchInterval: 10_000,
  });
}

export function useCallLogs(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: ["call-logs", params],
    queryFn: () => api.getCallLogs(params),
    refetchInterval: 10_000,
  });
}

export function usePayments(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => api.getPayments(params),
  });
}

export function useChatStats() {
  return useQuery({
    queryKey: ["chat-stats"],
    queryFn: api.getChatStats,
    refetchInterval: 10_000,
  });
}

export function useAppointments(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => api.getAppointments(params),
  });
}
