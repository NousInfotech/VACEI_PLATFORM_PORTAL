import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
    LayoutGrid, 
    Users, 
    ShieldCheck, 
    Building2, 
    type LucideIcon
} from 'lucide-react';
import { Skeleton } from '../../../../ui/Skeleton';
import { apiGet } from '../../../../config/base';
import { endPoints } from '../../../../config/endPoint';
import type { Company, IncorporationCycle } from '../../../../types/company';
import { USE_MOCK_DATA, getMockCompanyById, mockIncorporationCycle } from '../../../../data/mockCompanyData';
import PageHeader from '../../../common/PageHeader';
import PillTab from '../../../common/PillTab';
import KycSection from './kyc-components/KycSection';

// Modular Tab Components
import CompanyDetailsTab from './components/CompanyDetailsTab';
import InvolvementsTab from './components/InvolvementsTab';
import IncorporationTab from './components/IncorporationTab';

// Skeletons
import CompanyDetailsSkeleton from './components/skeletons/CompanyDetailsSkeleton';
import InvolvementsSkeleton from './components/skeletons/InvolvementsSkeleton';
import KycSkeleton from './components/skeletons/KycSkeleton';
import IncorporationSkeleton from './components/skeletons/IncorporationSkeleton';

interface Tab {
    id: string;
    label: string;
    icon?: LucideIcon;
}

const ViewCompany: React.FC = () => {
    const { clientId, companyId } = useParams<{ clientId: string; companyId: string }>();
    const [activeTab, setActiveTab] = useState('detail');
    const [activeInvolvementSubTab, setActiveInvolvementSubTab] = useState<'shareholders' | 'representatives'>('shareholders');

    const { data: realCompany, isLoading: isRealCompanyLoading } = useQuery<Company>({
        queryKey: ['company', companyId],
        queryFn: () => apiGet<{ data: Company }>(endPoints.COMPANY.GET_BY_ID(companyId!)).then(res => res.data),
        enabled: !!companyId && !USE_MOCK_DATA,
    });

    const company = USE_MOCK_DATA ? getMockCompanyById(companyId!) : realCompany;
    const isCompanyLoading = USE_MOCK_DATA ? false : isRealCompanyLoading;

    const { data: realIncCycle, isLoading: isIncCycleLoading } = useQuery<IncorporationCycle>({
        queryKey: ['incorporation-cycle', companyId],
        queryFn: () => apiGet<{ data: IncorporationCycle }>(`${endPoints.COMPANY.BASE}/${companyId}/incorporation`).then(res => res.data),
        enabled: !!companyId && activeTab === 'incorporation' && !USE_MOCK_DATA,
    });

    const incCycle = USE_MOCK_DATA ? mockIncorporationCycle : realIncCycle;

    if (isCompanyLoading) {
        return (
            <div className="space-y-6">
                {/* Page Header Skeleton */}
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                </div>

                {/* Tabs Skeleton */}
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-10 w-32 rounded-full" />
                    ))}
                </div>

                <div className="mt-8">
                    {activeTab === 'detail' && <CompanyDetailsSkeleton />}
                    {activeTab === 'involvements' && <InvolvementsSkeleton />}
                    {activeTab === 'kyc' && <KycSkeleton />}
                    {activeTab === 'incorporation' && <IncorporationSkeleton />}
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="p-8 text-center text-gray-500">
                Company not found or failed to load.
            </div>
        );
    }

    const tabs: Tab[] = [
        { id: 'detail', label: 'Company Detail', icon: LayoutGrid },
        { id: 'involvements', label: 'Involvements', icon: Users },
        { id: 'kyc', label: 'KYC', icon: ShieldCheck },
        ...(!company.incorporationStatus ? [{ id: 'incorporation', label: 'Incorporation', icon: Building2 }] : []),
    ];

    return (
        <div className="space-y-6">
            <PageHeader 
                title={company?.name || 'Company Profile'}
                icon={Building2}
                description="Comprehensive view of company data, stakeholdings, and compliance trajectory."
                showBack={true}
                backUrl={`/dashboard/clients/${clientId}`}
            />

            <PillTab 
                tabs={tabs} 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
            />

            <div className="mt-8">
                {activeTab === 'detail' && (
                    <CompanyDetailsTab company={company} />
                )}

                {activeTab === 'involvements' && (
                    <InvolvementsTab 
                        company={company}
                        activeInvolvementSubTab={activeInvolvementSubTab}
                        onSubTabChange={setActiveInvolvementSubTab}
                    />
                )}

                {activeTab === 'kyc' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <KycSection companyId={companyId!} />
                    </div>
                )}

                {activeTab === 'incorporation' && (
                    isIncCycleLoading ? (
                        <IncorporationSkeleton />
                    ) : (
                        <IncorporationTab incCycle={incCycle} />
                    )
                )}
            </div>
        </div>
    );
};

export default ViewCompany;
