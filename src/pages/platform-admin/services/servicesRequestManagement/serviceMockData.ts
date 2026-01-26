import type { ServiceRequest } from '../../../../types/service-request-template';

export const mockRequests: ServiceRequest[] = [
  {
    id: 'req_1',
    clientName: 'TechCorp Solutions',
    service: 'ACCOUNTING',
    status: 'PENDING',
    submittedAt: '2026-01-20T10:00:00Z',
    submittedBy: 'John Doe',
  },
  {
    id: 'req_2',
    clientName: 'Global Logistics',
    service: 'VAT',
    status: 'IN_PROGRESS',
    submittedAt: '2026-01-22T14:30:00Z',
    submittedBy: 'Sarah Smith',
  },
  {
    id: 'req_2',
    clientName: 'Global Logistics',
    service: 'VAT',
    status: 'IN_PROGRESS',
    submittedAt: '2026-01-22T14:30:00Z',
    submittedBy: 'Sarah Smith',
  },
  {
    id: 'req_3',
    clientName: 'Apex Innovations',
    service: 'LEGAL',
    status: 'COMPLETED',
    submittedAt: '2026-01-18T09:15:00Z',
    submittedBy: 'Mike Johnson',
  },
  {
    id: 'req_4',
    clientName: 'Oceanic Ventures',
    service: 'PAYROLL',
    status: 'REJECTED',
    submittedAt: '2026-01-25T11:45:00Z',
    submittedBy: 'Emma Wilson',
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
