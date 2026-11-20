import { getRequest, postRequest } from './generalRequests.js';
import { OPENAPI_PATHS } from './openapiClient.js';

/**
 * operationId: v1_user_list_retrieve
 * @returns {Promise<import('axios').AxiosResponse<import('./openapiClient.js').UserListItem[]>>}
 */
export const fetchUsersList = () => {
    return getRequest(OPENAPI_PATHS.USER_LIST, {});
};

/**
 * operationId: v1_modify_user_create
 * @param {import('./openapiClient.js').ModifyUserRequest} user
 * @returns {Promise<import('axios').AxiosResponse<import('./openapiClient.js').PublicUserData|string>>}
 */
export const modifyUserRequest = (user) => {
    return postRequest(OPENAPI_PATHS.MODIFY_USER, { ...user });
};

/**
 * operationId: v1_create_user_create
 * @param {import('./openapiClient.js').ChosenUserPayload} chosenUser
 * @returns {Promise<import('axios').AxiosResponse<string>>}
 */
export const createUserRequest = (chosenUser) => {
    return postRequest(OPENAPI_PATHS.CREATE_USER, { chosenUser });
};

/**
 * operationId: v1_delete_user_create
 * @param {import('./openapiClient.js').DeleteUserRequest} user
 * @returns {Promise<import('axios').AxiosResponse<string>>}
 */
export const deleteUserRequest = (user) => {
    return postRequest(OPENAPI_PATHS.DELETE_USER, { ...user });
};
