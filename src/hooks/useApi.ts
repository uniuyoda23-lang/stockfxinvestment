import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";

// --- Dashboard Hooks ---

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => authService.getDashboard(),
    refetchInterval: 30000, // Refetch every 30s
  });
}

// --- Admin Hooks ---

export function useUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => authService.listUsers(),
  });
}

export function useAllTransactions() {
  return useQuery({
    queryKey: ["admin", "transactions"],
    queryFn: () => authService.listAllTransactions(),
  });
}

export function useApproveTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (txId: string) => authService.approveTransaction(txId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRejectTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (txId: string) => authService.rejectTransaction(txId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
    },
  });
}

export function useUpdateBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, balance }: { userId: string; balance: number }) =>
      authService.updateBalance(userId, balance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useSendNotification() {
  return useMutation({
    mutationFn: ({ userId, message }: { userId: string; message: string }) =>
      authService.sendNotification(userId, message),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => authService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateStats() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, stats }: { userId: string; stats: any }) =>
      authService.updateStats(userId, stats),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// --- Auth Hooks ---

export function useSignIn() {
  return useMutation({
    mutationFn: ({ email, password }: any) =>
      authService.signIn(email, password),
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: ({ email, password, name }: any) =>
      authService.signUp(email, password, name),
  });
}

export function useRequestOTP() {
  return useMutation({
    mutationFn: ({
      email,
      isRegistration,
    }: {
      email: string;
      isRegistration?: boolean;
    }) => authService.requestOTP(email, isRegistration),
  });
}

export function useVerifyOTP() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authService.verifyOTP(email, code),
  });
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: ({ email, password }: any) =>
      authService.adminLogin(email, password),
  });
}
