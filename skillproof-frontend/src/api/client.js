/**
 * SkillProof API Client
 * Centralized async fetch wrapper connecting the continuous study journal frontend
 * to the FastAPI backend endpoints (/api/v1/*).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('skillproof_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let errorMessage = 'Request failed';
      if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMessage = data.detail
          .map(err => (err.msg ? (err.loc ? `${err.loc[err.loc.length - 1]}: ${err.msg}` : err.msg) : JSON.stringify(err)))
          .join(', ');
      } else if (data.detail && typeof data.detail === 'object') {
        errorMessage = data.detail.message || JSON.stringify(data.detail);
      } else if (typeof data.message === 'string') {
        errorMessage = data.message;
      } else {
        errorMessage = `Request failed with status ${response.status}`;
      }

      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Handle network or connection errors
    throw new ApiError(
      'Unable to connect to SkillProof backend service. Ensure FastAPI server is running.',
      0,
      { originalError: err.message }
    );
  }
}

export const api = {
  // Authentication & 2FA
  auth: {
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),

    signup: (userData) =>
      request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),

    verify2FA: (data) =>
      request('/auth/verify-2fa', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    getMe: () => request('/auth/me')
  },

  // Student Endpoints
  student: {
    getProfile: () => request('/student/profile'),
    updateSkills: (skills) =>
      request('/student/skills', {
        method: 'PUT',
        body: JSON.stringify({ skills })
      }),
    getJobs: () => request('/student/jobs'),
    applyJob: (jobId) =>
      request(`/student/apply/${jobId}`, {
        method: 'POST'
      }),
    getApplications: () => request('/student/applications'),
    verifyGithub: (username) =>
      request('/student/verify-github', {
        method: 'POST',
        body: JSON.stringify({ username })
      })
  },

  // Recruiter Endpoints
  recruiter: {
    getPipeline: () => request('/recruiter/pipeline'),
    createJob: (jobData) =>
      request('/recruiter/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData)
      }),
    updateApplicationStatus: (applicationId, status) =>
      request(`/recruiter/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
  },

  // Institution Admin Endpoints
  admin: {
    getAnalytics: () => request('/admin/analytics'),
    verifyStudent: (verificationId) =>
      request(`/admin/verify/${verificationId}`, {
        method: 'POST'
      })
  }
};

export default api;
