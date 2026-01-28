export type InputType = 'text' | 'number' | 'checkbox' | 'radio' | 'text_area';

export interface FormField {
  question: string;
  input_type: InputType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export type TemplateType = 'GENERAL' | 'SERVICE';

export const Services = {
  ACCOUNTING: 'ACCOUNTING',
  AUDITING: 'AUDITING',
  VAT: 'VAT',
  CFO: 'CFO',
  CSP: 'CSP',
  LEGAL: 'LEGAL',
  PAYROLL: 'PAYROLL',
  PROJECTS_TRANSACTIONS: 'PROJECTS_TRANSACTIONS',
  TECHNOLOGY: 'TECHNOLOGY',
  GRANTS_AND_INCENTIVES: 'GRANTS_AND_INCENTIVES',
  INCORPORATION: 'INCORPORATION',
} as const;

export type Services = typeof Services[keyof typeof Services];

export interface ServiceRequestTemplate {
  id: string;
  service: string | null;
  type: TemplateType;
  formFields: FormField[];
  version: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateTemplateDto {
  service: string | null;
  type: TemplateType;
  formFields: FormField[];
  isActive?: boolean;
}

export interface UpdateTemplateDto {
  service?: string | null;
  type?: TemplateType;
  formFields?: FormField[];
  isActive?: boolean;
}

export type ServiceRequestStatus = 'DRAFT' | 'SUBMITTED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'APPROVED';

export interface DetailEntry {
  question: string;
  answer: unknown;
  attachedFiles?: string[];
}

export interface ServiceRequest {
  id: string;
  companyId: string;
  clientId: string;
  service: string;
  status: ServiceRequestStatus;
  templateId: string;
  generalDetails?: DetailEntry[];
  serviceDetails?: DetailEntry[];
  statusHistory: unknown;
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  submittedBy?: string;
  company?: {
    id: string;
    name: string;
  };
  client?: {
    id: string;
    user?: { firstName?: string; lastName?: string };
  };
  template?: {
    id: string;
    type: string;
    formFields: FormField[];
  };
}
