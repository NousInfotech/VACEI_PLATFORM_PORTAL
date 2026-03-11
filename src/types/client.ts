export type OnboardingType = 'CLIENT_INVITED_ORG' | 'ORG_ONBOARDED_CLIENT';

export const OnboardingType = {
  CLIENT_INVITED_ORG: 'CLIENT_INVITED_ORG' as OnboardingType,
  ORG_ONBOARDED_CLIENT: 'ORG_ONBOARDED_CLIENT' as OnboardingType,
};

export interface Onboarding {
  id: string;
  clientId: string;
  organizationId: string;
  type: OnboardingType;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  role: 'PLATFORM_ADMIN' | 'PLATFORM_EMPLOYEE' | 'CLIENT' | 'ORG_ADMIN' | 'ORG_EMPLOYEE';
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

export interface Client {
  id: string;
  userId: string;
  user: User;
  preferences: Record<string, unknown>;
  isActive: boolean;
  companies?: Array<{
    id: string;
    name: string;
    incorporationStatus: boolean;
  }>;
  onboardings?: Onboarding[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientResponse {
  data: Client[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
