const configuredApiUrl = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
)
  .trim()
  .replace(/\/+$/, '');

export const API_URL = configuredApiUrl.endsWith('/api')
  ? configuredApiUrl
  : `${configuredApiUrl}/api`;
