export const API_CONFIG = {
  baseUrl: 'http://localhost:3000',
  endpoints: {
    status: '/admin/status',
    sets: '/api/v1/sets',
    cards: '/api/v1/cards',
  }
} as const;
