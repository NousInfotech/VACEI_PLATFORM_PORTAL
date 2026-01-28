import React, { useState } from 'react';
import { Building2, Users, Shield, ShieldCheck, UserCheck } from 'lucide-react';
import PillTab from '../../../../common/PillTab';
import CompanyKyc from './CompanyKyc';
import InvolvementsKyc from './InvolvementsKyc';
import type { KycWorkflow } from './types';
import { MOCK_KYC_DATA } from './mockData';
import { USE_MOCK_DATA } from '../../../../../data/mockCompanyData';
import { ShadowCard } from '../../../../../ui/ShadowCard';

interface KycSectionProps {
  realKycData?: KycWorkflow[];
  companyId: string;
}

const KycSection: React.FC<KycSectionProps> = ({ realKycData }) => {
  const [activeMainTab, setActiveMainTab] = useState('company');
  const [activeInvolvementTab, setActiveInvolvementTab] = useState('Shareholder');

  const kycData = USE_MOCK_DATA ? MOCK_KYC_DATA : (realKycData || []);

  const mainTabs = [
    { id: 'company', label: 'Company KYC', icon: Building2 },
    { id: 'involvements', label: 'Involvements KYC', icon: Users },
  ];

  const involvementTabs = [
    { id: 'Shareholder', label: 'Shareholders', icon: UserCheck },
    { id: 'Representative', label: 'Representatives', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <ShadowCard className="flex items-center justify-between p-6">
        <div>
          <h2 className="text-3xl font-semibold uppercase mb-2">KYC Verification</h2>
          <p className="text-base font-light max-w-lg">Monitor and audit compliance documentation across the entity or associated individuals</p>
        </div>
        <div className="p-3 bg-primary rounded-4xl text-white shadow-2xl shadow-primary/30">
          <Shield size={25} />
        </div>
      </ShadowCard>

      <div className="space-y-8">
        <PillTab 
          tabs={mainTabs} 
          activeTab={activeMainTab} 
          onTabChange={setActiveMainTab} 
          className="bg-gray-50/50 p-1.5 rounded-3xl border border-gray-100"
        />

        <div className="min-h-[400px]">
          {activeMainTab === 'company' && (
            <CompanyKyc 
              workflows={kycData} 
            />
          )}

          {activeMainTab === 'involvements' && (
            <div className="space-y-8">
              <PillTab 
                tabs={involvementTabs} 
                activeTab={activeInvolvementTab} 
                onTabChange={setActiveInvolvementTab}
                className="justify-start border-none bg-transparent"
              />
              <InvolvementsKyc 
                workflows={kycData} 
                type={activeInvolvementTab as 'Shareholder' | 'Representative'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KycSection;
