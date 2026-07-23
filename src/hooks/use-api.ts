import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function usePatients(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: ["patients", params],
    queryFn: () => api.getPatients(params),
  });
}

export function usePatientAppointments(patientId: number | null) {
  return useQuery({
    queryKey: ["patient-appointments", patientId],
    queryFn: () => api.getPatientAppointments(patientId!),
    enabled: patientId != null,
  });
}

// --- Doctors ---

export function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: api.getDoctors,
  });
}

export function useDoctorAppointments(doctorId: number | null, params: Record<string, string> = {}) {
  return useQuery({
    queryKey: ["doctor-appointments", doctorId, params],
    queryFn: () => api.getDoctorAppointments(doctorId!, params),
    enabled: doctorId != null,
  });
}

export function useUpdateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { notAvailableDate: string | null } }) =>
      api.updateDoctor(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}
