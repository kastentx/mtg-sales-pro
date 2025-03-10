export const API_CONFIG = {
  baseUrl: 'http://localhost:3000',
  endpoints: {
    setNames: '/api/v1/set-names',
    status: '/admin/status',
    sets: '/api/v1/sets',
  }
} as const;
