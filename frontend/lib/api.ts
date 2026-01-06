/**
 * API utility for making requests to the backend
 * This centralizes all API calls and handles authentication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Set authentication token in localStorage and cookies
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
  // Set cookie for middleware access (expires in 7 days)
  document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

/**
 * Remove authentication token from localStorage and cookies
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  // Remove cookie
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

/**
 * Make an API request with automatic authentication
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || data.error || 'Request failed',
        message: data.message,
        data: data, // Include full response data for error cases
      };
    }

    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

/**
 * Auth API functions
 */
export const authApi = {
  register: async (email: string, password: string, firstName: string, lastName: string) => {
    return apiRequest<{ token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
    });
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest<{ access_token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data?.access_token) {
      setAuthToken(response.data.access_token);
    }

    return response;
  },

  logout: () => {
    removeAuthToken();
  },

  getProfile: async () => {
    return apiRequest('/api/auth/profile');
  },

  updateProfile: async (data: { first_name?: string; last_name?: string; email?: string }) => {
    return apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  },
};

/**
 * Projects API functions
 */
export const projectsApi = {
  list: async () => {
    return apiRequest('/api/projects');
  },

  stats: async () => {
    return apiRequest('/api/projects/stats');
  },

  get: async (id: string) => {
    return apiRequest(`/api/projects/${id}`);
  },

  create: async (data: { name: string; description: string; generation_mode?: string }) => {
    return apiRequest('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<{ name: string; description: string; status: string }>) => {
    return apiRequest(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  },

  regenerateKey: async (id: string) => {
    return apiRequest(`/api/projects/${id}/regenerate-key`, {
      method: 'POST',
    });
  },

  preview: async (data: any) => {
    return apiRequest('/api/projects/preview', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  syncFromFiles: async (id: string, data: { files: any }) => {
    return apiRequest(`/api/projects/${id}/sync-from-files`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  download: async (projectInfo: any, features: any[]) => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/projects/download`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ projectInfo, features }),
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  },
};

/**
 * Features API functions
 */
export const featuresApi = {
  list: async (projectId: string) => {
    return apiRequest(`/api/features/project/${projectId}`);
  },

  create: async (data: any) => {
    return apiRequest('/api/features', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return apiRequest(`/api/features/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/api/features/${id}`, {
      method: 'DELETE',
    });
  },

  test: async (endpoint: string, method: string, body?: any, schema?: any, featureType: string = 'CRUD', projectId?: string) => {
    return apiRequest('/api/features/test', {
      method: 'POST',
      body: JSON.stringify({ endpoint, method, body, schema, feature_type: featureType, project_id: projectId }),
    });
  },
};

/**
 * Functions API functions
 */
export const functionsApi = {
  list: async (projectId: string) => {
    return apiRequest(`/api/functions/project/${projectId}`);
  },

  create: async (data: any) => {
    return apiRequest('/api/features', {
      method: 'POST',
      body: JSON.stringify({
        project_id: data.project_id,
        name: data.name,
        feature_type: 'FUNCTIONS',
        generation_mode: data.generation_mode || 'manual',
        configuration: {
          description: data.description || "",
          code: data.function_code || data.code || "",
          path: data.endpoint_path || data.path || "",
          method: data.http_method || data.method || "POST",
          input_schema: data.input_schema || {},
          output_schema: data.output_schema || {}
        },
        schema_definition: {},
      }),
    });
  },

  test: async (id: string, inputData: any) => {
    return apiRequest(`/api/functions/${id}/test`, {
      method: 'POST',
      body: JSON.stringify(inputData),
    });
  },
};

/**
 * AI API functions
 */
export const aiApi = {
  generateConfig: async (featureType: string, prompt: string, baseConfig: any = {}) => {
    return apiRequest('/api/ai/generate-config', {
      method: 'POST',
      body: JSON.stringify({
        feature_type: featureType,
        prompt,
        base_config: baseConfig
      }),
    });
  },

  generatePlan: async (prompt: string, currentContext?: any) => {
    return apiRequest('/api/ai/generate-plan', {
      method: 'POST',
      body: JSON.stringify({ prompt, current_context: currentContext }),
    });
  },

  generateTestData: async (featureType: string, schema: any, prompt: string = '') => {
    return apiRequest('/api/ai/generate-test-data', {
      method: 'POST',
      body: JSON.stringify({
        feature_type: featureType,
        schema,
        prompt
      }),
    });
  },

  generateCode: async (data: any) => {
    return apiRequest('/api/ai/generate-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  sandboxExecute: async (code: string, inputData: any = {}, timeout: number = 5) => {
    return apiRequest('/api/ai/sandbox-execute', {
      method: 'POST',
      body: JSON.stringify({ code, input_data: inputData, timeout }),
    });
  },

  getSuggestedPrompts: async (contextType: 'config' | 'test_data', contextData: any) => {
    return apiRequest('/api/ai/suggested-prompts', {
      method: 'POST',
      body: JSON.stringify({
        context_type: contextType,
        context_data: contextData
      }),
    });
  },
};

