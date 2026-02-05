import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
    LayoutGrid, 
    Users, 
    ShieldCheck, 
    Building2, 
    ClipboardList,
    Briefcase,
    Eye,
    type LucideIcon
} from 'lucide-react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../../../ui/Table';
import { ShadowCard } from '../../../../ui/ShadowCard';
import { Button } from '../../../../ui/Button';
import { Skeleton } from '../../../../ui/Skeleton';
import { apiGet } from '../../../../config/base';
import { endPoints } from '../../../../config/endPoint';
import type { Company, IncorporationCycle } from '../../../../types/company';
import type { ServiceRequest } from '../../../../types/service-request-template';
import { USE_MOCK_DATA, getMockCompanyById, mockIncorporationCycle } from '../../../../data/mockCompanyData';
import type { Engagement } from '../../../../data/engagementMockData';
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
    const navigate = useNavigate();
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

    const { data: serviceRequests, isLoading: isSRLoading } = useQuery<ServiceRequest[]>({
        queryKey: ['service-requests', companyId],
        queryFn: () => apiGet<{ data: ServiceRequest[] }>(`${endPoints.SERVICE_REQUEST.GET_ALL}?companyId=${companyId}`).then(res => res.data),
        enabled: !!companyId && activeTab === 'service-requests' && !USE_MOCK_DATA,
    });

    const { data: engagements, isLoading: isEngLoading } = useQuery<Engagement[]>({
        queryKey: ['engagements', companyId],
        queryFn: () => apiGet<{ data: Engagement[] }>(`${endPoints.ENGAGEMENT.GET_ALL}?companyId=${companyId}`).then(res => res.data),
        enabled: !!companyId && activeTab === 'engagements' && !USE_MOCK_DATA,
    });

    const allServiceRequests = serviceRequests || [];
    const allEngagements = engagements || [];

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
        { id: 'service-requests', label: 'Service Requests', icon: ClipboardList },
        { id: 'engagements', label: 'Engagements', icon: Briefcase },
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

                {activeTab === 'service-requests' && (
                    <ShadowCard className="p-8 border-none bg-white rounded-[40px] animate-in fade-in duration-500">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-8 w-1 bg-primary rounded-full" />
                                <h4 className="text-lg font-bold text-gray-900">Service Request History</h4>
                            </div>

                            {isSRLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                                </div>
                            ) : (
                                <div className="border border-gray-100 rounded-3xl overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gray-50/50">
                                            <TableRow className="hover:bg-transparent border-gray-100">
                                                <TableHead className="py-4 px-6 text-nowrap font-bold text-gray-400 uppercase tracking-widest text-[10px]">S.No</TableHead>
                                                <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Service Type</TableHead>
                                                <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Status</TableHead>
                                                <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Date Submitted</TableHead>
                                                <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px] text-right px-6">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="[&_tr:last-child]:border-0 text-nowrap whitespace-nowrap">
                                            {allServiceRequests.length > 0 ? (
                                                allServiceRequests.map((request: ServiceRequest, index: number) => (
                                                    <TableRow key={request.id} className="hover:bg-gray-50/50 transition-colors group border-gray-100">
                                                        <TableCell className="py-4 px-6 font-bold text-gray-400 text-xs">
                                                            {(index + 1).toString().padStart(2, '0')}
                                                        </TableCell>
                                                        <TableCell className="font-semibold text-gray-900 group-hover:text-primary transition-colors py-5">
                                                            {request.service.replace(/_/g, ' ')}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                                request.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' :
                                                                request.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                'bg-blue-50 text-blue-600 border-blue-100'
                                                            }`}>
                                                                {request.status.replace(/_/g, ' ')}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-gray-500 font-medium text-xs">
                                                            {new Date(request.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-right px-6">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="rounded-xl border-gray-100 text-primary hover:bg-primary/5 hover:border-primary/20 transition-all shadow-none"
                                                                onClick={() => navigate(`/dashboard/service-request-management/${request.id}`)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="py-20 text-center">
                                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                                            <ClipboardList className="h-12 w-12 mb-4 opacity-20" />
                                                            <p className="text-lg font-medium opacity-40 italic">No service requests found for this company.</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </ShadowCard>
                )}

                {activeTab === 'engagements' && (
                    <ShadowCard className="p-8 border-none bg-white rounded-[40px] animate-in fade-in duration-500">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-8 w-1 bg-primary rounded-full" />
                                <h4 className="text-lg font-bold text-gray-900">Professional Engagements</h4>
                            </div>

                            {isEngLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                                </div>
                            ) : (
                                <div className="border border-gray-100 rounded-3xl overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gray-50/50">
                                            <TableRow className="hover:bg-transparent border-gray-100">
                                                <TableHead className="py-4 px-6 text-nowrap font-bold text-gray-400 uppercase tracking-widest text-[10px]">S.No</TableHead>
                                                <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Service Provider</TableHead>
                                                <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Service Category</TableHead>
                                                <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Status</TableHead>
                                                <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Activated On</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="[&_tr:last-child]:border-0 text-nowrap whitespace-nowrap">
                                            {allEngagements.length > 0 ? (
                                                allEngagements.map((engagement: Engagement, index: number) => (
                                                    <TableRow key={engagement.id} className="hover:bg-gray-50/50 transition-colors group border-gray-100">
                                                        <TableCell className="py-4 px-6 font-bold text-gray-400 text-xs">
                                                            {(index + 1).toString().padStart(2, '0')}
                                                        </TableCell>
                                                        <TableCell className="font-semibold text-gray-900 group-hover:text-primary transition-colors py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                                    <Building2 className="h-4 w-4" />
                                                                </div>
                                                                {engagement.organizationName || 'Assigned Firm'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg">
                                                                {engagement.serviceCategory.replace(/_/g, ' ')}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                                engagement.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-100' :
                                                                'bg-blue-50 text-blue-600 border-blue-100'
                                                            }`}>
                                                                {engagement.status}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-gray-500 font-medium text-xs">
                                                            {new Date(engagement.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="py-20 text-center">
                                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                                            <Briefcase className="h-12 w-12 mb-4 opacity-20" />
                                                            <p className="text-lg font-medium opacity-40 italic">No active professional engagements found.</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </ShadowCard>
                )}
            </div>
        </div>
    );
};

export default ViewCompany;
