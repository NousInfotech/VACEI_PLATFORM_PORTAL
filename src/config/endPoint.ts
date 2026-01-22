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
};
