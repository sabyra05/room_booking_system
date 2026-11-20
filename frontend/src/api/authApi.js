import { getRequest, postRequest } from './generalRequests.js';
import { OPENAPI_PATHS } from './openapiClient.js';

/**
 * Returns the full Google OAuth2 login redirect URL (operationId: google_auth_init).
 * @returns {string}
 */
export const getGoogleAuthLoginUrl = () => {
    return `${import.meta.env.VITE_BASE_BACKEND_URL}api/v1/account/google/login`;
};

/**
 * operationId: v1_account_login_retrieve
 * @returns {Promise<import('axios').AxiosResponse<import('./openapiClient.js').PublicUserData>>}
 */
export const checkUserLogin = () => {
    return getRequest(OPENAPI_PATHS.ACCOUNT_LOGIN, {});
};

/**
 * Used by AuthProvider logout flow (GET /api/v1/account/logout).
 */
export const logoutUserGet = () => {
    return getRequest(OPENAPI_PATHS.ACCOUNT_LOGOUT, {});
};

/**
 * operationId: v1_account_logout_create
 * @returns {Promise<import('axios').AxiosResponse<string>>}
 */
export const logoutUserPost = () => {
    return postRequest('api/v1/account/logout');
};

/**
 * operationId: v1_account_google_google_callback_create
 * @param {string} authentication_code
 * @param {string} [state]
 * @returns {Promise<import('axios').AxiosResponse<import('./openapiClient.js').GoogleAuthCallbackResponse>>}
 */
export const sendGoogleAuthCode = (authentication_code, state) => {
    return postRequest(OPENAPI_PATHS.GOOGLE_AUTH_CALLBACK, {
        authentication_code,
        state,
    });
};
