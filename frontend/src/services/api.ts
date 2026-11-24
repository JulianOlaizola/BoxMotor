/// <reference types="vite/client" />

const API_BASE = import.meta.env.VITE_API_URL || '';

function baseUrl(input: RequestInfo | URL): string {
  const u = input instanceof URL ? input : new URL(String(input), API_BASE || undefined);
  if (API_BASE && !String(input).startsWith('http')) {
    return API_BASE.endsWith('/') ? API_BASE + String(input).replace(/^\//, '') : API_BASE + String(input);
  }
  return String(input);
}

function getToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('boxmotor_token');
}

async function request(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const url = baseUrl(input);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('boxmotor_token');
    }
    window.location.href = '/login';
  }

  return response;
}

export async function json<T = unknown>(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<T> {
  const response = await request(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(body || `Error ${response.status}`);
  }

  if (response.status === 204) return undefined as unknown as T;
  return response.json();
}

export const api = {
  health: () => json<{ status: string }>('/health'),

  authRegister: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
  }) => json('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  authLogin: (body: { email: string; password: string }) =>
    json<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  authMe: () => json<{ user: any }>('/auth/me'),

  vehiclesList: () => json<any[]>('/vehicles'),
  vehiclesCreate: (body: any) =>
    json('/vehicles', { method: 'POST', body: JSON.stringify(body) }),

  servicesList: () => json<any[]>('/services'),

  appointmentsList: () => json<any[]>('/appointments'),
  appointmentsCreate: (body: any) =>
    json('/appointments', { method: 'POST', body: JSON.stringify(body) }),

  workOrdersList: () => json<any[]>('/work-orders'),

  estimatesList: () => json<any[]>('/estimates'),

  partsList: () => json<any[]>('/parts'),

  customersList: () => json<any[]>('/customers'),
  mechanicsList: () => json<any[]>('/mechanics'),
  inventoryMovementsList: () => json<any[]>('/inventory-movements'),
  auditLogsList: () => json<any[]>('/audit-logs'),
};
