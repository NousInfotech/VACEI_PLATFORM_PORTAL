import React, { useMemo } from 'react';
import { useParams, useNavigate, type NavigateFunction } from 'react-router-dom';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { Building2, User, Mail, Calendar, FileText, ArrowRight, Eye, Plus, ExternalLink } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { ShadowCard } from '../../../ui/ShadowCard';
import { Skeleton } from '../../../ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/Table';
import { apiGet, apiPost } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import type { Client } from '../../../types/client';
import type { Company, IncorporationCycle } from '../../../types/company';
import type { ServiceRequest } from '../../../types/service-request-template';
import { USE_MOCK_DATA, getMockClientById, getMockCompaniesByClientId } from '../../../data/mockCompanyData';
import PageHeader from '../../common/PageHeader';
import ViewClientSkeleton from './components/skeletons/ViewClientSkeleton';
import PillTab from '../../common/PillTab';
import Messages from '../../messages/Messages';
import { MessageSquare, type LucideIcon } from 'lucide-react';
import CreateCompanyModal from './view-company/components/CreateCompanyModal';

interface Tab {
    id: string;
    label: string;
    icon?: LucideIcon;
}

const ViewClient: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState('info');
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const queryClient = useQueryClient();

    const { data: realClient, isLoading: isRealClientLoading } = useQuery<Client>({
        queryKey: ['client', clientId],
        queryFn: () => apiGet<{ data: Client }>(endPoints.CLIENT.GET_BY_ID(clientId!)).then(res => res.data),
        enabled: !!clientId && !USE_MOCK_DATA,
    });

    const client = USE_MOCK_DATA ? getMockClientById(clientId!) : realClient;
    const isClientLoading = USE_MOCK_DATA ? false : isRealClientLoading;

    const { data: realCompanies, isLoading: isRealCompaniesLoading } = useQuery<Company[]>({
        queryKey: ['client-companies', clientId],
        queryFn: () => apiGet<{ data: Company[] }>(endPoints.COMPANY.GET_BY_CLIENT(clientId!)).then(res => res.data),
        enabled: !!clientId && !USE_MOCK_DATA,
        refetchOnWindowFocus: true,
    });

    const companies = USE_MOCK_DATA ? getMockCompaniesByClientId(clientId!) : realCompanies;
    const isCompaniesLoading = USE_MOCK_DATA ? false : isRealCompaniesLoading;

    if (isClientLoading) {
        return <ViewClientSkeleton />;
    }

    if (!client) {
        return (
            <div className="p-8 text-center text-gray-500">
                Client not found or failed to load.
            </div>
        );
    }

    const tabs: Tab[] = [
        { id: 'info', label: 'Client Details', icon: User },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
    ];

    return (
        <div className="space-y-6">
            <PageHeader 
                title={`${client?.user?.firstName || 'Unknown'} ${client?.user?.lastName || 'Client'}`}
                icon={User}
                description="View client profile and associated managed companies"
                showBack={true}
                backUrl="/dashboard/clients"
                badge={
                    <div className="flex flex-wrap items-center gap-6 mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                        <div className="flex items-center gap-2.5 border-r border-white/10 pr-6 last:border-0 last:pr-0">
                            <Mail size={16} className="text-white/30" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-white/40 mr-1">Email:</span>
                            <span className="text-sm font-bold text-white/90">{client?.user?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Calendar size={16} className="text-white/30" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-white/40 mr-1">Joined:</span>
                            <span className="text-sm font-bold text-white/90">{client?.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                }
            />

            <PillTab 
                tabs={tabs} 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
            />

            {activeTab === 'info' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            <ShadowCard className="overflow-hidden border border-gray-100 shadow-sm rounded-2xl bg-white space-y-4">
                <div className="flex items-center justify-between px-6 pt-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        Associated Companies
                    </h3>
                    <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="rounded-xl bg-green-600 text-white shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all flex items-center gap-2 px-6 h-10"
                    >
                        <Plus className="h-4 w-4" />
                        Create Company
                    </Button>
                </div>

                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="py-4 px-6 text-nowrap">S.No</TableHead>
                            <TableHead>Company Details</TableHead>
                            <TableHead>Reg. Number</TableHead>
                            <TableHead>Incorporation</TableHead>
                            <TableHead>KYC</TableHead>
                            <TableHead>Quickbook Integration</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isCompaniesLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell className="px-6"><Skeleton className="h-4 w-4" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell className="text-right px-6"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : (companies && companies.length > 0) ? (
                            companies.map((company, index) => (
                                <CompanyRow key={company.id} company={company} index={index} clientId={clientId!} navigate={navigate} queryClient={queryClient} />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-48 text-center text-gray-400">
                                    <div className="flex flex-col items-center justify-center space-y-2 opacity-30">
                                        <Building2 className="h-10 w-10" />
                                        <p className="text-sm font-bold uppercase tracking-widest">No companies found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ShadowCard>
        </div>
            ) : (
                <div className="animate-in fade-in duration-500">
                    <Messages isSingleChat={true} contextualChatId="8" />
                </div>
            )}

            <CreateCompanyModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['client-companies', clientId] })}
                clientId={clientId!}
            />
        </div>
    );
};

interface CompanyRowProps {
    company: Company;
    index: number;
    clientId: string;
    navigate: NavigateFunction;
    queryClient: QueryClient;
}

type ServiceRequestResponse = ServiceRequest[] | { data: ServiceRequest[] };

const CompanyRow: React.FC<CompanyRowProps> = ({ company, index, clientId, navigate, queryClient }) => {
    const [isIntegrating, setIsIntegrating] = React.useState(false);
    const [isRevoking, setIsRevoking] = React.useState(false);
    const { data: requestsData, isLoading: isRealSrvLoading } = useQuery<ServiceRequestResponse>({
        queryKey: ['company-service-requests', company.id],
        queryFn: () => apiGet<ServiceRequestResponse>(`${endPoints.SERVICE_REQUEST.GET_ALL}?companyId=${company.id}`),
        enabled: !USE_MOCK_DATA,
    });

    const { data: incCycle, isLoading: isIncLoading } = useQuery<IncorporationCycle | null>({
        queryKey: ['incorporation-cycle', company.id],
        queryFn: () => apiGet<{ data: IncorporationCycle }>(endPoints.INCORPORATION.GET_BY_COMPANY(company.id))
            .then(res => res.data)
            .catch(() => null),
        enabled: !USE_MOCK_DATA && !company.incorporationStatus,
    });

    const isSrvLoading = !USE_MOCK_DATA && (isRealSrvLoading || isIncLoading);

    const serviceRequests: ServiceRequest[] = useMemo(() => {
        if (!requestsData) return [];
        if (Array.isArray(requestsData)) return requestsData;
        if (Array.isArray(requestsData.data)) return requestsData.data;
        return [];
    }, [requestsData]);

    const approvedIncorpRequest = serviceRequests?.find(r => r.status === 'APPROVED' && r.service === 'INCORPORATION');
    const hasServiceRequest = serviceRequests && serviceRequests.length > 0;

    const handleAction = () => {
        if (company.incorporationStatus) {
            navigate(`/dashboard/clients/${clientId}/company/${company.id}`);
        } else if (incCycle) {
            navigate(`/dashboard/clients/${clientId}/company/${company.id}/incorporation-cycle`);
        } else if (approvedIncorpRequest) {
            navigate(`/dashboard/clients/${clientId}/company/${company.id}/incorporation-cycle`);
        } else if (hasServiceRequest) {
             navigate(`/dashboard/service-request-management/${serviceRequests[0].id}`);
        }
    };

    const handleIntegrateQuickBooks = async () => {
        setIsIntegrating(true);
        try {
            const res = await apiGet<{ success: boolean; data: { redirectUrl: string } }>(
                endPoints.QUICKBOOK.CONNECT_URL(company.id, clientId)
            );
            const url = res?.data?.redirectUrl;
            if (url) window.location.href = url;
        } catch {
            setIsIntegrating(false);
        }
    };

    const handleRevokeQuickBooks = async () => {
        setIsRevoking(true);
        try {
            await apiPost(endPoints.QUICKBOOK.REVOKE(company.id), {});
            queryClient.invalidateQueries({ queryKey: ['client-companies', clientId] });
        } finally {
            setIsRevoking(false);
        }
    };

    return (
        <TableRow className="hover:bg-gray-50/50 transition-colors group">
            <TableCell className="py-4 px-6 font-bold text-gray-400 text-xs text-nowrap">
                {(index + 1).toString().padStart(2, '0')}
            </TableCell>
            <TableCell className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                {company.name}
            </TableCell>
            <TableCell className="text-gray-600 font-medium text-xs">
                {(!company.registrationNumber || company.registrationNumber === 'not-provided') ? 'Reg. Pending' : company.registrationNumber}
            </TableCell>
            <TableCell>
                {company.incorporationStatus ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-blue-50 text-blue-600 border-blue-100">
                        Incorporated
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-gray-100 text-gray-400 border-gray-100">
                        Pending
                    </span>
                )}
            </TableCell>
            <TableCell>
                {company.kycStatus ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-green-50 text-green-600 border-green-100">
                        Verified
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-amber-50 text-amber-600 border-amber-100">
                        Incomplete
                    </span>
                )}
            </TableCell>
            <TableCell>
                {company.quickBookStatus ? (
                    <span className="inline-flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-green-50 text-green-600 border-green-100">
                            Integrated
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRevokeQuickBooks}
                            disabled={isRevoking}
                            className="text-[10px] text-gray-500 hover:text-red-600 h-6 px-1"
                        >
                            {isRevoking ? '…' : 'Disconnect'}
                        </Button>
                    </span>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleIntegrateQuickBooks}
                        disabled={isIntegrating}
                        className="inline-flex items-center gap-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 px-2.5 py-0.5 h-7"
                    >
                        {isIntegrating ? (
                            'Redirecting…'
                        ) : (
                            <>
                                Integrate
                                <ExternalLink className="h-3 w-3" />
                            </>
                        )}
                    </Button>
                )}
            </TableCell>
            <TableCell className="text-right px-6">
                {(isSrvLoading && !company.incorporationStatus) ? (
                    <Skeleton className="h-8 w-24 ml-auto rounded-xl" />
                ) : (
                    <div className="flex justify-end gap-2">
                        {(!company.incorporationStatus && !hasServiceRequest && !isSrvLoading) ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50/50 text-gray-400 text-[10px] font-bold rounded-xl border border-gray-100 uppercase">
                                Pending Intake
                            </span>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAction}
                                className="rounded-xl hover:bg-primary/5 hover:text-primary transition-all border-gray-200 shadow-none text-[11px] font-bold uppercase tracking-wide px-4 h-9"
                            >
                                {company.incorporationStatus ? (
                                    <Eye className="h-4 w-4" />
                                ) : incCycle ? (
                                    <>
                                        View Incorp Cycle
                                        <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                ) : approvedIncorpRequest ? (
                                    <>
                                        Setup Incorp
                                        <FileText className="h-3.5 w-3.5 ml-2" />
                                    </>
                                ) : (
                                    <>
                                        Service Requests
                                        <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                )}
            </TableCell>
        </TableRow>
    );
};

export default ViewClient;
