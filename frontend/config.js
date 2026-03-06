// Frontend Configuration
const CONFIG = {
  // Use relative URL in production, localhost in development
  API_BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api',
  
  // Local storage keys
  STORAGE_KEYS: {
    TOKEN: 'swasthya_sathi_token',
    USER_ID: 'swasthya_sathi_user_id',
    USER_NAME: 'swasthya_sathi_user_name'
  },
  
  // Polling intervals (in milliseconds)
  POLLING: {
    NOTIFICATIONS: 30000, // 30 seconds
    CHAT_RESPONSE: 5000   // 5 seconds
  }
};
