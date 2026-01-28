export interface DocumentRequestDocumentSingle {
  _id?: string;
  name: string;
  description?: string;
  status?: string;
  url?: string;
  uploadedAt?: string;
  uploadedFileName?: string;
  type?: string | { type: string };
  template?: {
    url: string;
  };
}

export interface MultipleDocumentItem {
  label: string;
  status?: string;
  url?: string;
  uploadedAt?: string;
  uploadedFileName?: string;
  template?: {
    url?: string;
    instruction?: string;
  };
}

export interface DocumentRequestDocumentMultiple {
  _id: string;
  name: string;
  instruction?: string;
  type?: string | { type: string };
  multiple: MultipleDocumentItem[];
}

export interface KycPerson {
  _id: string;
  name: string;
  nationality?: string;
  address?: string;
  id?: string;
}

export interface DocumentRequest {
  _id: string;
  category: string;
  status: string;
  documents: DocumentRequestDocumentSingle[];
  multipleDocuments: DocumentRequestDocumentMultiple[];
}

export interface KycRequestFull {
  _id: string;
  documentRequest: DocumentRequest;
  person?: KycPerson;
}

export interface KycWorkflow {
  _id: string;
  companyId: string;
  workflowType: 'Shareholder' | 'Representative' | 'Company';
  documentRequests: KycRequestFull[];
  status: string;
}
