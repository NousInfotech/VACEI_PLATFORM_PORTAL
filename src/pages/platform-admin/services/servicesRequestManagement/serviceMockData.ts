import type { ServiceRequest } from '../../../../types/service-request-template';

export const mockRequests: ServiceRequest[] = [
  {
    id: 'req_1',
    companyId: 'company_1',
    clientId: 'client_1',
    templateId: 'template_1',
    service: 'ACCOUNTING',
    status: 'PENDING',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
    clientName: 'TechCorp Solutions',
    submittedBy: 'John Doe',
    statusHistory: [],
  },
  {
    id: 'req_2',
    companyId: 'company_2',
    clientId: 'client_2',
    templateId: 'template_2',
    service: 'VAT',
    status: 'IN_PROGRESS',
    createdAt: '2026-01-22T14:30:00Z',
    updatedAt: '2026-01-22T14:30:00Z',
    clientName: 'Global Logistics',
    submittedBy: 'Sarah Smith',
    statusHistory: [],
  },
  {
    id: 'req_3',
    companyId: 'company_3',
    clientId: 'client_3',
    templateId: 'template_3',
    service: 'LEGAL',
    status: 'COMPLETED',
    createdAt: '2026-01-18T09:15:00Z',
    updatedAt: '2026-01-18T09:15:00Z',
    clientName: 'Apex Innovations',
    submittedBy: 'Mike Johnson',
    statusHistory: [],
  },
  {
    id: 'req_4',
    companyId: 'company_4',
    clientId: 'client_4',
    templateId: 'template_4',
    service: 'PAYROLL',
    status: 'REJECTED',
    createdAt: '2026-01-25T11:45:00Z',
    updatedAt: '2026-01-25T11:45:00Z',
    clientName: 'Oceanic Ventures',
    submittedBy: 'Emma Wilson',
    statusHistory: [],
  }
];

export const mockQuestions = [
  {
    "question": "Proposed company name",
    "required": true,
    "maxLength": 30,
    "input_type": "text",
    "placeholder": "Enter the proposed company name"
  },
  {
    "options": [
      "Private Limited Liability Company (Ltd)",
      "Public Limited Company (PLC)",
      "Branch of Foreign Company"
    ],
    "question": "Type of company",
    "required": true,
    "input_type": "radio"
  },
  {
    "question": "Business activity description",
    "required": true,
    "input_type": "text_area",
    "placeholder": "Briefly describe the main business activities"
  },
  {
    "question": "Share capital amount (EUR)",
    "required": true,
    "input_type": "number",
    "placeholder": "e.g. 1200"
  },
  {
    "question": "Number of shareholders",
    "required": true,
    "input_type": "number"
  },
  {
    "options": [
      "Yes",
      "No"
    ],
    "question": "Are any shareholders corporate entities?",
    "required": true,
    "input_type": "radio"
  },
  {
    "question": "Director full name",
    "required": true,
    "input_type": "text",
    "placeholder": "First and last name"
  },
  {
    "question": "Registered office address in Malta",
    "required": true,
    "input_type": "text_area",
    "placeholder": "Full registered address in Malta"
  },
  {
    "options": [
      "Yes",
      "No"
    ],
    "question": "Do you require a company secretary service?",
    "required": true,
    "input_type": "checkbox"
  }
];

export const mockAnswersByRequestId: Record<string, Record<string, string | number | boolean>> = {
  'req_1': {
    "Proposed company name": "TechSphere International Ltd",
    "Type of company": "Private Limited Liability Company (Ltd)",
    "Business activity description": "Software development and cloud infrastructure consultancy services for global enterprise clients.",
    "Share capital amount (EUR)": "5000",
    "Number of shareholders": "2",
    "Are any shareholders corporate entities?": "No",
    "Director full name": "John Michael Doe",
    "Registered office address in Malta": "Level 4, Quantum Towers, Dragonara Road, St. Julians, STJ 3141, Malta",
    "Do you require a company secretary service?": "Yes"
  }
};
