import {
  AdminMetrics,
  AdminUser,
  ClassRegistration,
  GymClass,
  GymProgram,
  Lead,
  Membership,
  MembershipPlan,
  NotificationLog,
  SettingItem,
  Trainer,
  User,
} from '../types/index.ts';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('forge_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Public
  getPrograms: () => request<GymProgram[]>('/api/programs'),
  getMembershipPlans: () => request<MembershipPlan[]>('/api/membership-plans'),
  getTrainers: () => request<Trainer[]>('/api/trainers'),
  getClasses: (category?: string, date?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (date) params.append('date', date);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<GymClass[]>(`/api/classes${query}`);
  },
  getSettings: () => request<Record<string, string>>('/api/settings'),

  // Free Trial Lead
  submitFreeTrial: (payload: {
    name: string;
    phone: string;
    email: string;
    age?: number;
    fitnessGoal: string;
    preferredTime: string;
    previousExperience: string;
  }) =>
    request<{ success: boolean; lead: Lead; message: string }>('/api/leads/free-trial', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Auth Customer
  register: (payload: { name: string; email: string; password: string; phone?: string; fitnessGoal?: string; age?: number }) =>
    request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMe: () => request<{ user: User }>('/api/auth/me'),
  updateProfile: (payload: { name?: string; phone?: string; fitnessGoal?: string; age?: number }) =>
    request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  logout: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),

  // Customer Memberships & Bookings
  getMyMembership: () =>
    request<{ currentMembership: Membership | null; history: Membership[] }>('/api/memberships/my'),
  subscribeMembership: (planId: number, paymentMethod?: string) =>
    request<{ success: boolean; membership: Membership; message: string }>('/api/memberships/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planId, paymentMethod }),
    }),
  registerForClass: (classId: number) =>
    request<{ success: boolean; registration: ClassRegistration; message: string }>(
      `/api/classes/${classId}/register`,
      { method: 'POST' }
    ),
  cancelClassRegistration: (classId: number) =>
    request<{ success: boolean; message: string }>(`/api/classes/${classId}/cancel`, {
      method: 'POST',
    }),
  getMyBookings: () => request<ClassRegistration[]>('/api/classes/my'),

  // Admin Auth
  adminLogin: (payload: { email: string; password: string }) =>
    request<{ admin: AdminUser; token: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAdminMe: () => request<{ admin: AdminUser }>('/api/admin/me'),

  // Admin Metrics & Management
  getAdminMetrics: () => request<AdminMetrics>('/api/admin/metrics'),
  getAdminCustomers: () => request<User[]>('/api/admin/customers'),
  getAdminMemberships: () => request<Membership[]>('/api/admin/memberships'),
  updateMembershipStatus: (id: number, status: string, notes?: string) =>
    request<Membership>(`/api/admin/memberships/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),

  // Admin Leads
  getAdminLeads: (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Lead[]>(`/api/admin/leads${query}`);
  },
  updateLead: (id: number, payload: Partial<Lead>) =>
    request<Lead>(`/api/admin/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteLead: (id: number) =>
    request<{ success: boolean }>(`/api/admin/leads/${id}`, {
      method: 'DELETE',
    }),

  // Admin Trainers
  createTrainer: (payload: Partial<Trainer>) =>
    request<Trainer>('/api/admin/trainers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTrainer: (id: number, payload: Partial<Trainer>) =>
    request<Trainer>(`/api/admin/trainers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteTrainer: (id: number) =>
    request<{ success: boolean }>(`/api/admin/trainers/${id}`, {
      method: 'DELETE',
    }),

  // Admin Classes
  createClass: (payload: any) =>
    request<GymClass>('/api/admin/classes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateClass: (id: number, payload: any) =>
    request<GymClass>(`/api/admin/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteClass: (id: number) =>
    request<{ success: boolean }>(`/api/admin/classes/${id}`, {
      method: 'DELETE',
    }),

  // Admin Notifications & Settings
  getNotificationLogs: () => request<NotificationLog[]>('/api/admin/notifications'),
  sendTestNotification: (payload: { type: string; recipient?: string; message: string }) =>
    request<{ success: boolean; log: any }>('/api/admin/notifications/test', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAllSettings: () => request<SettingItem[]>('/api/admin/settings'),
  updateSetting: (key: string, value: string, description?: string) =>
    request<{ success: boolean; key: string; value: string }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ key, value, description }),
    }),

  // Analytics
  trackEvent: (eventName: string, properties?: Record<string, any>) =>
    request('/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ eventName, properties }),
    }).catch(() => {}),
};
