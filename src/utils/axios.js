import axios from 'axios';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------
// Create a shared axios instance used across the app
// const axiosInstance = Axios.create();
const axiosInstance = axios.create({
  baseURL: CONFIG.site.serverUrl,
  withCredentials: true,
});

// ---------------------------
// Basic Auth credential store
// ---------------------------
const BASIC_AUTH_STORAGE_KEY = 'pev_basic_auth';

let basicAuth = null;

function loadBasicAuthFromStorage() {
  try {
    const raw =
      sessionStorage.getItem(BASIC_AUTH_STORAGE_KEY) ||
      localStorage.getItem(BASIC_AUTH_STORAGE_KEY);
    if (raw) {
      basicAuth = JSON.parse(raw);
    }
  } catch {
    // no-op
  }
}

loadBasicAuthFromStorage();

export function setBasicAuthCredentials({ apiKey, secretKey, persist = 'session' }) {
  basicAuth = { apiKey, secretKey };

  // persist can be 'session' | 'local' | false
  if (persist === 'session') {
    sessionStorage.setItem(BASIC_AUTH_STORAGE_KEY, JSON.stringify(basicAuth));
    localStorage.removeItem(BASIC_AUTH_STORAGE_KEY);
  } else if (persist === 'local') {
    localStorage.setItem(BASIC_AUTH_STORAGE_KEY, JSON.stringify(basicAuth));
    sessionStorage.removeItem(BASIC_AUTH_STORAGE_KEY);
  } else {
    sessionStorage.removeItem(BASIC_AUTH_STORAGE_KEY);
    localStorage.removeItem(BASIC_AUTH_STORAGE_KEY);
  }
}

export function clearBasicAuthCredentials() {
  basicAuth = null;
  sessionStorage.removeItem(BASIC_AUTH_STORAGE_KEY);
  localStorage.removeItem(BASIC_AUTH_STORAGE_KEY);
}

// Helper to detect if a request should include Basic Auth
function isSecuredBackendRoute(url) {
  if (!url) return false;
  // Works for absolute and relative URLs
  return url.includes('/api/v1/');
}

// ---------------------------
// Request interceptor
// ---------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    // If the request already has explicit auth, do not override it.
    if (!config.auth && isSecuredBackendRoute(config.url)) {
      // lazy-load if needed
      if (!basicAuth) {
        loadBasicAuthFromStorage();
      }

      if (basicAuth?.apiKey && basicAuth?.secretKey) {
        // Set Authorization header manually to avoid axios altering it
        const token = btoa(`${basicAuth.apiKey}:${basicAuth.secretKey}`);
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Basic ${token}`,
        };
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);
// ----------------------------------------------------------------------

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/auth/verify-session',
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    signOut: '/auth/logout',
    credentials: '/auth/user/credentials', // POST
    updateCredentials: '/auth/user/credentials', // PUT
    timezone: '/auth/user/timezone', // GET & POST
  },
  user: {
    getAll: '/users', // GET
    getByEmail: '/users/email', // POST
  },
  member: {},
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  credit: {
    stats: '/api/v1/email/credit-balance', // GET
  },
  verifyEmail: {
    singleVerify: '/api/v1/email/single/verify', // POST
    uploadEmailList: '/api/v1/email/bulk/upload', // POST
    verifyEmailList: '/api/v1/email/bulk/start', // PATCH
    getEmailListStatus: '/api/v1/email/bulk/status', // GET
    downloadEmailListResult: '/api/v1/email/bulk/download', // POST
    deleteEmailList: '/api/v1/email/bulk', // DELETE
  },
  emailList: {
    list: '/api/v1/email-lists', // GET
    listIds: '/api/v1/email-lists/id/name', // GET
    share: '/api/v1/email-lists/share', //  POST
    stats: '/api/v1/email-lists/stats/members', // GET
    updateAccess: '/api/v1/email-lists/change-access-type', // POST
    removeMember: '/api/v1/email-lists/remove-member', //  POST
  },
  logs: {
    activityLogs: '/api/v1/logs/activity-logs', // GET
  },
};

export default axiosInstance;
