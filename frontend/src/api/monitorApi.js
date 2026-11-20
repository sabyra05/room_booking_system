import axios from 'axios';
import { getRequest, monitorGetRequest } from './generalRequests.js';
import { OPENAPI_PATHS } from './openapiClient.js';

const baseServerURL = import.meta.env.VITE_BASE_BACKEND_URL;

/**
 * operationId: v1_monitor_retrieve
 * @param {string} password
 * @param {string|number} room
 * @returns {Promise<import('axios').AxiosResponse<import('./openapiClient.js').MonitorResponse>>}
 */
export const fetchMonitorRoomData = (password, room) => {
    return monitorGetRequest(`${OPENAPI_PATHS.MONITOR}?password=` + password + '&room=' + room);
};

/**
 * operationId: v1_monitor_big_retrieve
 * @returns {Promise<import('axios').AxiosResponse<import('./openapiClient.js').BigMonitorResponse>>}
 */
export const fetchBigMonitorData = () => {
    return getRequest(OPENAPI_PATHS.MONITOR_BIG);
};

/**
 * Fetches hourly temperature forecast for Vienna from Open-Meteo API.
 */
export const fetchViennaWeatherData = () => {
    return axios.get(
        'https://api.open-meteo.com/v1/forecast?latitude=48.2085&longitude=16.3721&hourly=temperature_2m&forecast_days=1'
    );
};

/**
 * Submits monitor login credentials.
 * @param {string} password
 * @param {number} room
 * @param {() => void} onUnauthorized
 */
export const submitMonitorLoginRequest = (password, room, onUnauthorized) => {
    const request = axios.create({
        withCredentials: true,
        baseURL: baseServerURL,
    });
    request.interceptors.response.use(
        function (response) {
            return response;
        },
        function (error) {
            if (401 === error.response.status) {
                onUnauthorized();
            } else {
                return Promise.reject(error);
            }
        }
    );
    return request.post('api/v1/monitor', {
        password: password,
        room: room,
    });
};
