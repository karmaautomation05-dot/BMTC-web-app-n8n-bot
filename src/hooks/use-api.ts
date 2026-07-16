import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";

export function useStats() {
  return useQuery({ queryKey: ["stats"], queryFn: api.getStats });
}

export function useCallLogs(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: ["call-logs", params],
    queryFn: () => api.getCallLogs(params),
  });
}
