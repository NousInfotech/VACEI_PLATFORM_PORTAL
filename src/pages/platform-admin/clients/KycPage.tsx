import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { apiGet } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import type { KycCycle } from '../../../types/company';
import PageHeader from '../../common/PageHeader';
import KycSection from './view-company/kyc-components/KycSection';
import { USE_MOCK_DATA } from '../../../data/mockCompanyData';

const KycPage: React.FC = () => {
    const { clientId, companyId } = useParams<{ clientId: string; companyId: string }>();

    const { isLoading } = useQuery<KycCycle>({
        queryKey: ['kyc-cycle', companyId],
        queryFn: () => apiGet<{ data: KycCycle }>(`${endPoints.COMPANY.BASE}/${companyId}/kyc`).then(res => res.data),
        enabled: !!companyId && !USE_MOCK_DATA,
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading KYC Status...</div>;
    }

    return (
        <div className="space-y-6">
            <PageHeader 
                title="KYC Verification" 
                icon={ShieldCheck}
                description="Manage Know Your Customer verification for this company and its stakeholders."
                showBack={true}
                backUrl={`/dashboard/clients/${clientId}/company/${companyId}`}
            />

            <KycSection companyId={companyId!} />
        </div>
    );
};

export default KycPage;
