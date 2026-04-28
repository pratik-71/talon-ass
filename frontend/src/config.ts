export const CONFIG = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  // BACKEND_URL: 'http://localhost:5000',
  APP_NAME: 'Talon',
  API_ENDPOINTS: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    CHARITIES: '/api/charities',
    SCORES: '/api/scores',
    DASHBOARD: '/api/dashboard',
    UPLOAD_PROOF: '/api/dashboard/upload-proof',
  },
};

