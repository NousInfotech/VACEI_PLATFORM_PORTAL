export interface EmployeeUser {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  role: 'PLATFORM_ADMIN' | 'PLATFORM_EMPLOYEE' | 'ORG_ADMIN' | 'ORG_EMPLOYEE' | 'CLIENT';
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

export interface EmployeeOrganization {
  id: string;
  name: string;
  type: string;
}

export interface Employee {
  id: string;
  userId: string;
  user: EmployeeUser;
  organization?: EmployeeOrganization;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeResponse {
  data: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
  };
}

