import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

export class ApiError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Direct client for Laravel backend. Used server-side (Server Components,
// Server Actions, route handlers) and client-side ('use client' components).
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
});

async function getAccessToken(): Promise<string | undefined> {
  if (typeof window === 'undefined') {
    const { auth } = await import('@/auth');
    const session = await auth();
    return session?.accessToken;
  }

  const { getSession } = await import('next-auth/react');
  const session = await getSession();
  return session?.accessToken;
}

axiosClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof window !== 'undefined') {
    const { useCompanyStore } = await import('@/store/company-store');
    const activeCompanyId = useCompanyStore.getState().activeCompanyId;
    if (activeCompanyId) {
      config.headers['X-Company-ID'] = activeCompanyId;
    }
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? error.message ?? 'Request failed';
    return Promise.reject(new ApiError(message, status, error.response?.data));
  }
);

export async function apiClient<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await axiosClient.request<T>({ url: endpoint, ...config });
  return res.data;
}
