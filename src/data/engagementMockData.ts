import { Services } from '../types/service-request-template';

export interface Engagement {
  id: string;
  companyId: string;
  companyName: string;
  organizationId: string;
  organizationName: string;
  serviceCategory: keyof typeof Services;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export const mockEngagements: Engagement[] = [
  {
    id: 'eng_1',
    companyId: 'company_1',
    companyName: 'TechCorp Solutions',
    organizationId: 'org_1',
    organizationName: 'VACEI HQ',
    serviceCategory: 'ACCOUNTING',
    status: 'ACTIVE',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'eng_2',
    companyId: 'company_2',
    companyName: 'Global Logistics',
    organizationId: 'org_2',
    organizationName: 'Malta Business Pros',
    serviceCategory: 'VAT',
    status: 'ACTIVE',
    createdAt: '2026-01-22T14:30:00Z',
    updatedAt: '2026-01-22T14:30:00Z',
  }
];
