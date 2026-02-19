import React, { useState } from 'react';
import { Building2, Shield, ShieldCheck, UserCheck, Plus, Activity } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PillTab from '../../../../common/PillTab';
import CompanyKyc from './CompanyKyc';
import InvolvementsKyc from './InvolvementsKyc';
import type { KycWorkflow, KycBackendResponse } from './types';
import { MOCK_KYC_DATA } from './mockData';
import { USE_MOCK_DATA } from '../../../../../data/mockCompanyData';
import { ShadowCard } from '../../../../../ui/ShadowCard';
import { apiGet, apiPost } from '../../../../../config/base';
import { endPoints } from '../../../../../config/endPoint';
import { Button } from '../../../../../ui/Button';
import KycSkeleton from '../components/skeletons/KycSkeleton';

interface KycSectionProps {
  companyId: string;
}

import { transformBackendDocReq } from '../../../../../utils/documentTransform';

const KycSection: React.FC<KycSectionProps> = ({ companyId }) => {
  const [activeTab, setActiveTab] = useState('Company');
  const queryClient = useQueryClient();
  
  const { data: companyDetails } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => apiGet<{ data: { name: string } }>(endPoints.COMPANY.GET_BY_ID(companyId)).then(res => res.data),
    enabled: !!companyId && !USE_MOCK_DATA,
  });


  const { data: realKycData, isLoading } = useQuery<KycBackendResponse | null>({
    queryKey: ['kyc-cycle', companyId],
    queryFn: () => apiGet<{ data: KycBackendResponse | null }>(endPoints.COMPANY.KYC(companyId)).then(res => res.data),
    enabled: !!companyId && !USE_MOCK_DATA,
  });

  const createKycMutation = useMutation({
    mutationFn: (data: { involvementIds?: string[] }) => 
      apiPost(endPoints.COMPANY.KYC(companyId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-cycle', companyId] });
    }
  });

  const transformData = (data: KycBackendResponse | null): KycWorkflow[] => {
    if (!data) return [];
    
    const workflows: KycWorkflow[] = [];

    // 1. Company Workflow
    if (data.documentRequest) {
      workflows.push({
        _id: data.id,
        companyId: data.companyId,
        workflowType: 'Company',
        status: data.status,
        documentRequests: [
          {
            _id: data.documentRequest.id,
            documentRequest: {
                ...transformBackendDocReq(data.documentRequest),
                entityName: data.company.name,
                address: data.company.address
            }
          }
        ]
      });
    }

    // 2. Involvements Workflows
    data.involvementKycs.forEach(invKyc => {
        const roles = invKyc.involvement.role || [];
        const possibleTabs: ('Shareholder' | 'Representative')[] = [];
        
        if (roles.includes('SHAREHOLDER')) possibleTabs.push('Shareholder');
        if (roles.includes('LEGAL_REPRESENTATIVE')) possibleTabs.push('Representative');
        
        // If it has other roles but not these specific ones, we can default to Shareholder or skip
        // but the requirement says "if they are a Shareholder, it should appear under the Shareholder tab. If they are a Representative, it should appear under the Representative tab".
        
        possibleTabs.forEach(workflowType => {
            const drId = invKyc.documentRequest.id;
            
            workflows.push({
                _id: invKyc.id,
                companyId: data.companyId,
                workflowType: workflowType as any,
                status: invKyc.status,
                documentRequests: [
                    {
                        _id: drId,
                        person: invKyc.involvement.person ? {
                            _id: invKyc.involvement.person.id,
                            name: invKyc.involvement.person.name,
                            address: invKyc.involvement.person.address || ''
                        } : {
                            _id: invKyc.involvement.holderCompany?.id || '',
                            name: invKyc.involvement.holderCompany?.name || '',
                            address: invKyc.involvement.holderCompany?.address || ''
                        },
                        documentRequest: {
                            ...transformBackendDocReq(invKyc.documentRequest),
                            entityName: invKyc.involvement.person?.name || invKyc.involvement.holderCompany?.name || '',
                            address: invKyc.involvement.person?.address || invKyc.involvement.holderCompany?.address || null
                        }
                    }
                ]
            });
        });
    });

    return workflows;
  };

  const kycData = USE_MOCK_DATA ? MOCK_KYC_DATA : transformData(realKycData || null);

  const tabs = [
    { id: 'Company', label: 'COMPANY', icon: Building2 },
    { id: 'Shareholder', label: 'SHAREHOLDERS', icon: UserCheck },
    { id: 'Representative', label: 'REPRESENTATIVES', icon: ShieldCheck },
  ];

  if (isLoading && !USE_MOCK_DATA) {
      return <KycSkeleton />;
  }

  if (!USE_MOCK_DATA && !realKycData) {
      return (
          <div className="space-y-8 animate-in fade-in duration-700">
              <ShadowCard className="flex items-center justify-between p-6 bg-linear-to-br from-white to-gray-50/50">
                  <div>
                      <h2 className="text-3xl font-semibold uppercase mb-2">KYC Verification</h2>
                      <p className="text-base font-light max-w-lg text-gray-500">No KYC verification cycle has been initialized for this company yet.</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-4xl text-primary border border-primary/20">
                      <Shield size={25} />
                  </div>
              </ShadowCard>

              <ShadowCard className="p-12 border-dashed border-2 border-gray-200 flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                    <Activity size={40} className="animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Start Verification Journey</h3>
                    <p className="text-gray-500 max-w-sm mx-auto font-light">
                        Initializing the KYC cycle will create formal document requests for this entity and its associated stakeholders.
                    </p>
                </div>
                <Button 
                    className="rounded-4xl px-8 py-6 h-auto text-lg hover:scale-105 transition-transform"
                    onClick={() => createKycMutation.mutate({})}
                    disabled={createKycMutation.isPending}
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Initialize KYC Cycle
                </Button>
              </ShadowCard>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-white/40 p-6 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-semibold">KYC Verification {companyDetails?.name ? `- ${companyDetails.name}` : ''}</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Monitor and audit compliance documentation across the entity or associated individuals</p>
        </div>
        <div className="p-4 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-200">
          <Shield size={32} />
        </div>
      </div>



      <div className="space-y-8">
        <PillTab 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          className="bg-gray-50/50 p-1.5 rounded-3xl border border-gray-100"
        />

        <div className="min-h-[400px]">
          {activeTab === 'Company' && (
            <CompanyKyc 
              workflows={kycData} 
              companyId={companyId}
              kycId={realKycData?.id}
            />
          )}

          {(activeTab === 'Shareholder' || activeTab === 'Representative') && (
            <InvolvementsKyc 
              workflows={kycData} 
              type={activeTab as 'Shareholder' | 'Representative'}
              companyId={companyId}
              kycId={realKycData?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default KycSection;

