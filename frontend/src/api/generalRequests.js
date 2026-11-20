import axios from 'axios';

const baseServerURL = import.meta.env.VITE_BASE_BACKEND_URL
const baseClientURL = import.meta.env.VITE_BASE_FRONTEND_URL

const api = axios.create({
    baseURL: baseServerURL,
    withCredentials: true,
});

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._isRetry) {
            originalRequest._isRetry = true;

            try {
                await axios.post(
                    baseServerURL + 'api/v1/account/google/refresh-token',
                    {},
                    { withCredentials: true }
                );
                return api(originalRequest);
            } catch (refreshError) {
                console.log('Failed to refresh token', refreshError);
                window.location.href = baseClientURL;
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const getRequest = async (url, data) => {
    return api.get(url, data);
};

export const postRequest = async (url, data) => {
    return api.post(url, data);
};

// === MONITOR REQUESTS ===

const apiMonitor = axios.create({
    baseURL: baseServerURL,
    withCredentials: true,
});

apiMonitor.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            console.log('Failed to login as monitor');
        }
        return Promise.reject(error);
    }
);

export const monitorGetRequest = async (url, data) => {
    return apiMonitor.get(url, data);
};

export const monitorPostRequest = async (url, data) => {
    return apiMonitor.post(url, data);
};