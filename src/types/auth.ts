export interface Organization {
    id: string;
    name: string;
    type: string;
    status: string;
    availableServices: string[];
}

export interface OrganizationMember {
    id: string;
    userId: string;
    organizationId: string;
    role: string;
    allowedServices: string[];
    organization: Organization;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    role: string;
    status: string;
}

export interface LoginResponse {
    data: {
        user: User;
        organizationMember: OrganizationMember;
        token: string;
    };
    message?: string;
}

export interface AuthMeResponse {
    data: {
        user: User;
        organizationMember: OrganizationMember;
    };
    message?: string;
}
