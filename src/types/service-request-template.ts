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

export type ServiceRequestStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface ServiceRequest {
  id: string;
  clientName: string;
  service: string;
  status: ServiceRequestStatus;
  submittedAt: string;
  submittedBy: string;
}
