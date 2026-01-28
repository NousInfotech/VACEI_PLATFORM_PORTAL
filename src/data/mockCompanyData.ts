import type { Company, KycCycle, IncorporationCycle } from '../types/company';
import type { Client } from '../types/client';

/**
 * Global toggle to control whether mock data should be used in the application.
 */
export const USE_MOCK_DATA = false;

const generateCompanies = (clientId: string, count: number): Company[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `mock-company-${clientId}-${i}`,
    name: `Enterprise ${clientId.charAt(0).toUpperCase()}${clientId.slice(1)} ${i + 1} Ltd`,
    registrationNumber: `REG-${clientId.toUpperCase()}-${1000 + i}`,
    address: `${100 + i} Business Park, Industrial Zone`,
    companyType: 'PRIMARY',
    legalType: 'LTD',
    summary: 'A high-growth enterprise focused on digital transformation and innovative scale-up strategies.',
    industry: ['Technology', 'Consulting'],
    authorizedShares: 500000,
    issuedShares: 300000,
    incorporationStatus: i % 2 === 0,
    kycStatus: i % 3 === 0,
    clientId: clientId,
    createdAt: new Date(Date.now() - (i + 1) * 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    shareClasses: [
      { id: `sc-${clientId}-${i}-1`, class: 'CLASS_A', issued: 100000 },
      { id: `sc-${clientId}-${i}-2`, class: 'CLASS_B', issued: 80000 },
      { id: `sc-${clientId}-${i}-3`, class: 'CLASS_C', issued: 60000 },
      { id: `sc-${clientId}-${i}-4`, class: 'ORDINARY', issued: 60000 },
    ],
    involvements: [
      {
        id: `inv-${clientId}-${i}-1`,
        role: ['SHAREHOLDER', 'DIRECTOR'],
        classA: 50000,
        classB: 0,
        classC: 0,
        ordinary: 20000,
        person: {
          id: `pers-${clientId}-${i}-1`,
          name: `Founder ${i + 1}`,
          address: 'Main Street 1, Capital City',
          nationality: 'British',
        },
      },
      {
        id: `inv-${clientId}-${i}-2`,
        role: ['SHAREHOLDER'],
        classA: 0,
        classB: 40000,
        classC: 20000,
        ordinary: 0,
        person: {
          id: `pers-${clientId}-${i}-2`,
          name: `Investor ${i + 1}`,
          address: 'Bay View 5, Seaside Town',
          nationality: 'French',
        },
      },
      {
        id: `inv-${clientId}-${i}-3`,
        role: ['SECRETARY'],
        classA: 0,
        classB: 0,
        classC: 0,
        ordinary: 0,
        person: {
          id: `pers-${clientId}-${i}-3`,
          name: `Admin ${i + 1}`,
          address: 'Office Plaza 2, Uptown',
          nationality: 'German',
        },
      },
      {
        id: `inv-${clientId}-${i}-4`,
        role: ['LEGAL_REPRESENTATIVE'],
        classA: 0,
        classB: 0,
        classC: 0,
        ordinary: 0,
        person: {
          id: `pers-${clientId}-${i}-4`,
          name: `Lawyer ${i + 1}`,
          address: 'Legal Chambers 8, Downtown',
          nationality: 'Swiss',
        },
      },
    ],
  }));
};

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Olivia', 'William', 'Sophia', 'Thomas', 'Isabella'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez'];

export const mockClients: Client[] = Array.from({ length: 12 }).map((_, i) => {
  const clientId = `mock-client-${i + 1}`;
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[i % lastNames.length];
  
  return {
    id: clientId,
    userId: `mock-user-${i + 1}`,
    user: {
      id: `mock-user-${i + 1}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+1 555-010${i}`,
      firstName: firstName,
      lastName: lastName,
      role: 'CLIENT',
      status: 'ACTIVE',
    },
    preferences: {},
    isActive: true,
    createdAt: new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    companies: generateCompanies(clientId, (i % 3) + 1).map(c => ({
      id: c.id,
      name: c.name,
      incorporationStatus: c.incorporationStatus,
    })),
  };
});

// Flat list of all companies for quick lookup
export const mockCompanies: Company[] = mockClients.flatMap(client => {
  const idNum = parseInt(client.id.split('-')[2]);
  return generateCompanies(client.id, (idNum % 3) + 1);
});

export const getMockCompanyById = (id: string): Company | undefined => {
  return mockCompanies.find(c => c.id === id);
};

export const getMockClientById = (id: string): Client | undefined => {
  return mockClients.find(c => c.id === id);
};

export const getMockCompaniesByClientId = (clientId: string): Company[] => {
  return mockCompanies.filter(c => c.clientId === clientId);
};

export const mockKycCycle: KycCycle = {
  id: 'mock-kyc-cycle-1',
  companyId: 'mock-company-1',
  status: 'VERIFIED',
  startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  verifiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
};

export const mockIncorporationCycle: IncorporationCycle = {
  id: 'mock-inc-cycle-1',
  companyId: 'mock-company-1',
  status: 'APPROVED',
  startedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
};
