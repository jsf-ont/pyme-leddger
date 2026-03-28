import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || '';

const getToken = () => {
  return localStorage.getItem('beanpcge_token');
};

const setToken = (token) => {
  if (token) {
    localStorage.setItem('beanpcge_token', token);
  } else {
    localStorage.removeItem('beanpcge_token');
  }
};

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || 'An error occurred');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

const api = {
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(response);
      if (data.token) setToken(data.token);
      return data;
    },

    register: async (userData) => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await handleResponse(response);
      if (data.token) setToken(data.token);
      return data;
    },

    logout: () => {
      setToken(null);
      localStorage.removeItem('beanpcge_user');
      localStorage.removeItem('beanpcge_company');
    },

    demo: async () => {
      const response = await fetch(`${API_URL}/api/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await handleResponse(response);
      if (data.token) setToken(data.token);
      return data;
    },

    me: async () => {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },

    updateProfile: async (data) => {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
  },

  accounts: {
    list: async (companyId) => {
      const params = companyId ? `?companyId=${companyId}` : '';
      const response = await fetch(`${API_URL}/api/accounts${params}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },

    create: async (accountData) => {
      const response = await fetch(`${API_URL}/api/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(accountData),
      });
      return handleResponse(response);
    },

    update: async (id, accountData) => {
      const response = await fetch(`${API_URL}/api/accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(accountData),
      });
      return handleResponse(response);
    },

    delete: async (id) => {
      const response = await fetch(`${API_URL}/api/accounts/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
  },

  transactions: {
    list: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/api/transactions${query ? `?${query}` : ''}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },

    create: async (transactionData) => {
      const response = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(transactionData),
      });
      return handleResponse(response);
    },

    update: async (id, transactionData) => {
      const response = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(transactionData),
      });
      return handleResponse(response);
    },

    delete: async (id, companyId) => {
      const params = companyId ? `?companyId=${companyId}` : '';
      const response = await fetch(`${API_URL}/api/transactions/${id}${params}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
  },

  dashboard: {
    summary: async (companyId) => {
      const params = companyId ? `?companyId=${companyId}` : '';
      const response = await fetch(`${API_URL}/api/dashboard${params}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },

    charts: async (companyId) => {
      const params = companyId ? `?companyId=${companyId}` : '';
      const response = await fetch(`${API_URL}/api/dashboard/charts${params}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },

    recent: async (companyId) => {
      const params = companyId ? `?companyId=${companyId}` : '';
      const response = await fetch(`${API_URL}/api/dashboard/recent${params}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
  },

  reports: {
    balance: async (companyId) => {
      const params = companyId ? `?companyId=${companyId}` : '';
      const response = await fetch(`${API_URL}/api/reports/balance${params}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },

    income: async (companyId, month) => {
      const query = new URLSearchParams({ companyId, month }).toString();
      const response = await fetch(`${API_URL}/api/reports/income?${query}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },

    sunat: async (companyId, period) => {
      const query = new URLSearchParams({ companyId, ...period }).toString();
      const response = await fetch(`${API_URL}/api/reports/sunat?${query}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },
  },

  company: {
    get: async () => {
      const response = await fetch(`${API_URL}/api/company`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(response);
    },

    update: async (companyData) => {
      const response = await fetch(`${API_URL}/api/company`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(companyData),
      });
      return handleResponse(response);
    },
  },

  supabase: {
    getUser: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },

    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },

    signUp: async (email, password) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    resetPassword: async (email) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return data;
    },
  },
};

export default api;
