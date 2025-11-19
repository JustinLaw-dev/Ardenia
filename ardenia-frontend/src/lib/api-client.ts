const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  data?: any;
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { data, headers, ...restOptions } = options;

    const config: RequestInit = {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
        ...headers,
      },
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  auth = {
    register: (data: {
      email: string;
      password: string;
      username?: string;
      displayName?: string;
    }) => this.request('/auth/register', { method: 'POST', data }),

    login: (data: { email: string; password: string }) =>
      this.request<{
        user: any;
        accessToken: string;
        refreshToken: string;
      }>('/auth/login', { method: 'POST', data }),

    refresh: (refreshToken: string) =>
      this.request<{ accessToken: string; refreshToken: string }>(
        '/auth/refresh',
        {
          method: 'POST',
          data: { refreshToken },
        },
      ),

    logout: (refreshToken: string) =>
      this.request('/auth/logout', {
        method: 'POST',
        data: { refreshToken },
      }),

    me: () => this.request('/auth/me', { method: 'GET' }),
  };

  // Tasks endpoints
  tasks = {
    getAll: (params?: { status?: string; category?: string; priority?: number }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.category) query.append('category', params.category);
      if (params?.priority) query.append('priority', params.priority.toString());
      return this.request(`/tasks?${query.toString()}`, { method: 'GET' });
    },

    getOne: (id: string) => this.request(`/tasks/${id}`, { method: 'GET' }),

    create: (data: any) => this.request('/tasks', { method: 'POST', data }),

    update: (id: string, data: any) =>
      this.request(`/tasks/${id}`, { method: 'PATCH', data }),

    delete: (id: string) => this.request(`/tasks/${id}`, { method: 'DELETE' }),

    start: (id: string) =>
      this.request(`/tasks/${id}/start`, { method: 'POST' }),

    complete: (id: string, data?: { actualDuration?: number }) =>
      this.request(`/tasks/${id}/complete`, { method: 'POST', data }),

    getStatistics: () =>
      this.request('/tasks/statistics', { method: 'GET' }),
  };

  // Rewards endpoints
  rewards = {
    getStats: () => this.request('/rewards/stats', { method: 'GET' }),

    getHistory: (limit?: number) => {
      const query = limit ? `?limit=${limit}` : '';
      return this.request(`/rewards/history${query}`, { method: 'GET' });
    },

    getAchievements: () =>
      this.request('/rewards/achievements', { method: 'GET' }),

    getAllAchievements: () =>
      this.request('/rewards/achievements/all', { method: 'GET' }),

    getLeaderboard: (limit?: number) => {
      const query = limit ? `?limit=${limit}` : '';
      return this.request(`/rewards/leaderboard${query}`, { method: 'GET' });
    },
  };

  // Focus endpoints
  focus = {
    start: (data: {
      taskId?: string;
      plannedDuration: number;
      sessionType?: string;
    }) => this.request('/focus/start', { method: 'POST', data }),

    end: (
      id: string,
      data: {
        actualDuration: number;
        distractionCount?: number;
        focusQuality?: number;
        completedGoal?: boolean;
      },
    ) => this.request(`/focus/${id}/end`, { method: 'POST', data }),

    getActive: () => this.request('/focus/active', { method: 'GET' }),

    getHistory: (limit?: number) => {
      const query = limit ? `?limit=${limit}` : '';
      return this.request(`/focus/history${query}`, { method: 'GET' });
    },

    getStatistics: () => this.request('/focus/statistics', { method: 'GET' }),
  };

  // Analytics endpoints
  analytics = {
    getDashboard: () => this.request('/analytics/dashboard', { method: 'GET' }),

    getProgress: (days?: number) => {
      const query = days ? `?days=${days}` : '';
      return this.request(`/analytics/progress${query}`, { method: 'GET' });
    },

    getWeeklyReport: () =>
      this.request('/analytics/weekly-report', { method: 'GET' }),

    getInsights: () => this.request('/analytics/insights', { method: 'GET' }),
  };
}

export const apiClient = new ApiClient(API_URL);
