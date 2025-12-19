const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
  }

  async getAuthToken() {
    const { auth } = await import('./firebase');
    const user = auth.currentUser;
    if (user) {
      return user.getIdToken();
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const token = await this.getAuthToken();
    
    const headers = {
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  }

  // Auth endpoints
  async verifyToken() {
    return this.request('/auth/verify', { method: 'POST' });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // Upload endpoints
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);

    return this.request('/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async extractText(file) {
    const formData = new FormData();
    formData.append('resume', file);

    return this.request('/upload/extract-text', {
      method: 'POST',
      body: formData,
    });
  }

  // Resume endpoints
  async getResumes() {
    return this.request('/resumes');
  }

  async getResume(resumeId) {
    return this.request(`/resumes/${resumeId}`);
  }

  async createResume(resumeData) {
    return this.request('/resumes', {
      method: 'POST',
      body: JSON.stringify(resumeData),
    });
  }

  async updateResume(resumeId, updates) {
    return this.request(`/resumes/${resumeId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteResume(resumeId) {
    return this.request(`/resumes/${resumeId}`, {
      method: 'DELETE',
    });
  }

  // AI Enhancement endpoints
  async enhanceResume(resumeText, preferences) {
    return this.request('/enhance', {
      method: 'POST',
      body: JSON.stringify({ resumeText, preferences }),
    });
  }

  async generateSummary(resumeText, jobRole) {
    return this.request('/enhance/summary', {
      method: 'POST',
      body: JSON.stringify({ resumeText, jobRole }),
    });
  }

  async getSuggestions(resumeText, jobRole) {
    return this.request('/enhance/suggestions', {
      method: 'POST',
      body: JSON.stringify({ resumeText, jobRole }),
    });
  }
}

export const api = new ApiClient();
export default api;
