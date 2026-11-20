import { getRequest, postRequest } from './generalRequests.js';
import { OPENAPI_PATHS } from './openapiClient.js';

/**
 * operationId: v1_event_list_retrieve
 * @param {{ start: string, end: string, room?: number }} params
 * @returns {Promise<import('axios').AxiosResponse<import('./openapiClient.js').EventData[]>>}
 */
export const fetchEventsList = (params) => {
    return getRequest(OPENAPI_PATHS.EVENT_LIST, { params });
};

/**
 * operationId: v1_event_list_retrieve (used by Home page)
 * @param {{ start: string, end: string, room?: number }} params
 * @returns {Promise<import('axios').AxiosResponse<import('./openapiClient.js').EventData[]>>}
 */
export const fetchHomeEventsList = (params) => {
    return getRequest('api/v1/event-list', { params });
};

/**
 * operationId: v1_modify_event_create
 * @param {import('./openapiClient.js').ModifyEventRequest} body
 * @returns {Promise<import('axios').AxiosResponse<string>>}
 */
export const modifyEventRoomRequest = (body) => {
    return postRequest(OPENAPI_PATHS.MODIFY_EVENT, body);
};

/**
 * operationId: v1_refresh_events_create
 * @returns {Promise<import('axios').AxiosResponse<string>>}
 */
export const refreshEventsRequest = () => {
    return postRequest(OPENAPI_PATHS.REFRESH_EVENTS);
};
