export type OrganizationStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Organization {
  id: string;
  name: string;
  status: OrganizationStatus;
  availableServices: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members?: OrganizationMember[];
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateOrganizationDto {
  name: string;
  availableServices: string[];
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPassword?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  status?: OrganizationStatus;
  availableServices?: string[];
}
