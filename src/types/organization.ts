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
  customServiceCycles?: { id: string; title: string; isActive: boolean }[];
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
  customServiceCycleIds?: string[];
}

export interface UpdateOrganizationDto {
  name?: string;
  status?: OrganizationStatus;
  availableServices?: string[];
}
