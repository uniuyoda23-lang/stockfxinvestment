import { authService } from "../services/authService";

export async function adminLogin(
  email: string,
  password: string,
): Promise<boolean> {
  const response = await authService.adminLogin(email, password);
  return Boolean(response?.success && response?.token);
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(localStorage.getItem("admin_token"));
}

export function logoutAdmin(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("admin_token");
}

export async function apiListUsers(): Promise<any[]> {
  return authService.listUsers();
}

export async function apiUpdateBalance(
  userId: string,
  balance: number,
): Promise<any> {
  return authService.updateBalance(userId, balance);
}

export async function apiSendNotification(
  userId: string,
  message: string,
): Promise<any> {
  return authService.sendNotification(userId, message);
}

export async function apiDeleteUser(userId: string): Promise<any> {
  return authService.deleteUser(userId);
}
