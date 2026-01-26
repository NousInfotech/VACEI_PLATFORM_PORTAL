export const endPoints = {
  AUTH: {
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    ME: '/auth/me',
  },
  ORGANIZATION: {
    BASE: '/organizations',
    GET_ALL: '/organizations',
    GET_BY_ID: (id: string) => `/organizations/${id}`,
    CREATE: '/organizations',
    UPDATE: (id: string) => `/organizations/${id}`,
    DELETE: (id: string) => `/organizations/${id}`,
    HARD_DELETE: (id: string) => `/organizations/${id}/hard`,
  },
  SERVICE_REQUEST_TEMPLATE: {
    BASE: '/service-request-templates',
    GET_ACTIVE_GENERAL: '/service-request-templates/active/general',
    GET_ACTIVE_SERVICE: (service: string) => `/service-request-templates/active/service/${service}`,
    GET_ALL: '/service-request-templates',
    GET_BY_ID: (id: string) => `/service-request-templates/${id}`,
    CREATE: '/service-request-templates',
    UPDATE: (id: string) => `/service-request-templates/${id}`,
  },
};
