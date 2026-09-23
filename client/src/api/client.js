// API Client communicating with Express Backend

const getUserId = () => {
  return localStorage.getItem('campus_active_user_id') || '11111111-1111-1111-1111-111111111111';
};

const getHeaders = (isMultipart = false) => {
  const headers = {
    'x-user-id': getUserId()
  };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

async function request(endpoint, options = {}) {
  const isMultipart = options.body instanceof FormData;
  const config = {
    ...options,
    headers: {
      ...getHeaders(isMultipart),
      ...(options.headers || {})
    }
  };

  const response = await fetch(`/api${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Server error occurred');
  }

  return data;
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Auth & Demo switcher
  getMe: () => request('/users/me'),
  getDemoUsers: () => request('/users/demo-list'),

  // Items
  getItems: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') {
        query.append(k, v);
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/items${qs}`);
  },

  getItemById: (id) => request(`/items/${id}`),

  createItem: (formData) => {
    return request('/items', {
      method: 'POST',
      body: formData
    });
  },

  deleteItem: (id) => {
    return request(`/items/${id}`, {
      method: 'DELETE'
    });
  },

  getItemMatches: (id) => request(`/items/${id}/matches`),

  // Matches & Claims
  getMatchById: (id) => request(`/matches/${id}`),

  submitClaim: (matchId, proofDescription) => {
    return request('/claims', {
      method: 'POST',
      body: JSON.stringify({
        match_id: matchId,
        proof_description: proofDescription
      })
    });
  },

  // Personal Dashboard
  getDashboard: () => request('/dashboard'),

  // Admin
  getAdminReports: () => request('/admin/reports'),

  updateClaimStatus: (claimId, status) => {
    return request(`/admin/claims/${claimId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};
