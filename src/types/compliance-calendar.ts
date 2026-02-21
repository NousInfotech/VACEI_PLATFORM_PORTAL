/** Calendar scope */
export type ComplianceCalendarType = 'GLOBAL' | 'COMPANY';

/** Recurrence */
export type ComplianceCalendarFrequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY'
  | 'CUSTOM';

/** Custom period unit when frequency is CUSTOM */
export type CustomFrequencyPeriodUnit = 'DAYS' | 'WEEK' | 'MONTH' | 'YEAR';

/** Service category enum from API */
export type ServiceCategory =
  | 'ACCOUNTING'
  | 'AUDITING'
  | 'VAT'
  | 'CFO'
  | 'CSP'
  | 'LEGAL'
  | 'PAYROLL'
  | 'PROJECTS_TRANSACTIONS'
  | 'TECHNOLOGY'
  | 'GRANTS_AND_INCENTIVES'
  | 'INCORPORATION'
  | 'MBR'
  | 'TAX'
  | 'CUSTOM';

export interface ComplianceCalendarCompany {
  id: string;
  name: string;
}

export interface ComplianceCalendarCustomServiceCycle {
  id: string;
  title: string;
}

export interface ComplianceCalendarCreatedBy {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ComplianceCalendar {
  id: string;
  type: ComplianceCalendarType;
  companyId: string | null;
  title: string;
  description: string | null;
  startDate: string;
  dueDate: string;
  frequency: ComplianceCalendarFrequency;
  customFrequencyPeriodUnit: CustomFrequencyPeriodUnit | null;
  customFrequencyPeriodValue: number | null;
  serviceCategory: ServiceCategory;
  customServiceCycleId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  company?: ComplianceCalendarCompany | null;
  customServiceCycle?: ComplianceCalendarCustomServiceCycle | null;
  createdBy?: ComplianceCalendarCreatedBy | null;
}

export interface ComplianceCalendarListParams {
  type?: ComplianceCalendarType;
  companyId?: string;
}

export interface CreateComplianceCalendarBody {
  type: ComplianceCalendarType;
  companyId?: string | null;
  title: string;
  description?: string | null;
  startDate: string;
  dueDate: string;
  frequency: ComplianceCalendarFrequency;
  customFrequencyPeriodUnit?: CustomFrequencyPeriodUnit | null;
  customFrequencyPeriodValue?: number | null;
  serviceCategory: ServiceCategory;
  customServiceCycleId?: string | null;
}

export type UpdateComplianceCalendarBody = Partial<CreateComplianceCalendarBody>;

export interface ComplianceCalendarListResponse {
  success: boolean;
  data: ComplianceCalendar[];
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ComplianceCalendarSingleResponse {
  success: boolean;
  data: ComplianceCalendar;
  message?: string;
}

export interface ComplianceCalendarMessageResponse {
  success: boolean;
  message?: string;
  details?: unknown;
}
