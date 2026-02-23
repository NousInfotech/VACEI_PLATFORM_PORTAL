export interface PlatformEmployee {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface PlatformEmployeeResponse {
  data: PlatformEmployee[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
