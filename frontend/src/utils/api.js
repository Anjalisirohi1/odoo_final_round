/**
 * api.js — Centralized fetch wrapper with automatic JWT refresh.
 *
 * If any request returns 401, it will attempt to refresh the access token
 * using the HttpOnly refresh token cookie, then retry the original request
 * once. If the refresh also fails, it clears localStorage and redirects to
 * the login page.
 */

const BASE_URL = 'http://localhost:5000';

let isRefreshing = false;
let refreshPromise = null;

const getToken = () => localStorage.getItem('dealflow_token') || '';
const setToken = (t) => localStorage.setItem('dealflow_token', t);
const clearSession = () => {
  localStorage.removeItem('dealflow_token');
  window.location.href = '/';
};

const refreshAccessToken = async () => {
  if (isRefreshing) return refreshPromise;

  isRefreshing = true;
  refreshPromise = fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // sends the HttpOnly refreshToken cookie
  })
    .then(async (res) => {
      const data = await res.json();
      if (res.ok && data.accessToken) {
        setToken(data.accessToken);
        return data.accessToken;
      }
      throw new Error('Refresh failed');
    })
    .catch(() => {
      clearSession();
      return null;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
};

/**
 * apiFetch(path, options)
 *
 * Drop-in replacement for fetch() that:
 *  - Automatically adds Authorization header
 *  - Retries once after refreshing token on 401
 *
 * @param {string} path   e.g. '/api/deal-health/dashboard'
 * @param {object} options  standard fetch options
 */
const apiFetch = async (path, options = {}) => {
  const doRequest = (token) =>
    fetch(`${BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

  let response = await doRequest(getToken());

  if (response.status === 401) {
    // Try to silently refresh
    const newToken = await refreshAccessToken();
    if (!newToken) return response; // clearSession already called
    response = await doRequest(newToken);
  }

  return response;
};

export default apiFetch;
