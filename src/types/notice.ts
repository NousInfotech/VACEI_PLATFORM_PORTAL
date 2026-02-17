export interface Notice {
  id: string;
  title: string;
  description: string;
  targetRoles: string[];
  type: string;
  status: string;
  scheduledAt: string;
  createdAt: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateNoticeData {
  title: string;
  description: string;
  targetRoles: string[];
  type: string;
  scheduledAt: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface UpdateNoticeData {
  title?: string;
  description?: string;
  targetRoles?: string[];
  type?: string;
  scheduledAt?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface NoticeListResponse {
  success: boolean;
  data: Notice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
