import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, FileText, CheckCircle2, PlayCircle, Loader2, ChevronDown } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShadowCard } from '../../../ui/ShadowCard';
import { apiGet, apiPatch, apiPost } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import type { IncorporationCycle, IncorporationStatus } from '../../../types/company';
import PageHeader from '../../common/PageHeader';
import { transformBackendDocReq } from '../../../utils/documentTransform';
import SingleDocumentRequest from './view-company/kyc-components/SingleDocumentRequest';
import DoubleDocumentRequest from './view-company/kyc-components/DoubleDocumentRequest';
import { Select } from '../../../ui/Select';
import { Button } from '../../../ui/Button';
import AddRequestedDocumentModal from './view-company/kyc-components/AddRequestedDocumentModal';
import AddCategoryModal from './view-company/kyc-components/AddCategoryModal';
import { Plus } from 'lucide-react';

interface IncorpCycleProps {
    clientId?: string;
    companyId?: string;
}

const IncorpCycle: React.FC<IncorpCycleProps> = ({ clientId: propClientId, companyId: propCompanyId }) => {
    const params = useParams<{ clientId: string; companyId: string }>();
    const clientId = propClientId || params.clientId;
    const companyId = propCompanyId || params.companyId;
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const queryClient = useQueryClient();
    const { data: cycle, isLoading } = useQuery<IncorporationCycle>({
        queryKey: ['incorporation-cycle', companyId],
        queryFn: () => apiGet<{ data: IncorporationCycle }>(endPoints.INCORPORATION.GET_BY_COMPANY(companyId!)).then(res => res.data),
        enabled: !!companyId,
    });

    const updateStatusMutation = useMutation({
        mutationFn: (status: IncorporationStatus) => 
            apiPatch(endPoints.INCORPORATION.UPDATE_STATUS(cycle!.id), { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incorporation-cycle', companyId] });
            queryClient.invalidateQueries({ queryKey: ['client-companies'] });
            queryClient.invalidateQueries({ queryKey: ['company', companyId] });
        }
    });

    const createCycleMutation = useMutation({
        mutationFn: () => apiPost(endPoints.INCORPORATION.BASE, { companyId, status: 'PENDING' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incorporation-cycle', companyId] });
            queryClient.invalidateQueries({ queryKey: ['client-companies', clientId] });
        }
    });

    const createDocumentRequestMutation = useMutation({
        mutationFn: (title: string) => 
            apiPost<{ data: { id: string } }>(endPoints.INCORPORATION.CREATE_DOCUMENT_REQUEST(cycle!.id), { 
                title, 
                description: `Documents for ${title}` 
            }),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['incorporation-cycle', companyId] });
            const drId = response?.data?.id;
            setIsCategoryModalOpen(false);
            if (drId) {
                setActiveRequestId(drId);
                setIsAddModalOpen(true);
            }
        }
    });

    const updateDocRequestStatusMutation = useMutation({
        mutationFn: ({ requestId, status }: { requestId: string; status: string }) =>
            apiPatch(endPoints.DOCUMENT_REQUESTS.UPDATE_STATUS(requestId), { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incorporation-cycle', companyId] });
        }
    });

    const docRequestStatuses = ['DRAFT', 'ACTIVE', 'COMPLETED'];

    const statusBadgeClass = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const statusSteps: IncorporationStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    const currentStatusIndex = statusSteps.indexOf(cycle?.status || 'PENDING');

    const statusItems = statusSteps.map(status => ({
        id: status,
        label: status.replace('_', ' '),
        onClick: () => updateStatusMutation.mutate(status),
        className: cycle?.status === status ? 'text-primary font-bold' : ''
    }));

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-gray-500 font-medium">Loading incorporation cycle details...</p>
            </div>
        );
    }

    if (!cycle) {
        return (
            <div className="space-y-6">
                <PageHeader 
                    title="Incorporation Cycle" 
                    icon={ClipboardList}
                    description="Initialize incorporation process for this company"
                    showBack={true}
                    backUrl={`/dashboard/clients/${clientId}`}
                />
                <ShadowCard className="p-20 flex flex-col items-center justify-center border-none bg-white rounded-[40px] text-center space-y-6">
                    <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center text-primary/20 mb-2">
                        <ClipboardList size={48} />
                    </div>
                    <div className="space-y-2 max-w-md">
                        <h3 className="text-xl font-bold text-gray-900">No Incorporation Cycle Found</h3>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed">
                            This company is marked as "incorporation pending" but no active process has been initialized yet.
                        </p>
                    </div>
                    <Button 
                        onClick={() => createCycleMutation.mutate()} 
                        disabled={createCycleMutation.isPending}
                        className="px-10 h-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all font-bold uppercase tracking-widest text-xs gap-3"
                    >
                        {createCycleMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
                        Initialize Incorporation Cycle
                    </Button>
                </ShadowCard>
            </div>
        );
    }

    const transformedDocs = cycle.documentRequests?.map(dr => transformBackendDocReq(dr)) || [];

    return (
        <>
        <div className="space-y-6">
            <PageHeader 
                title="Incorporation Cycle" 
                icon={ClipboardList}
                description="Track and manage company incorporation progress"
                showBack={true}
                backUrl={`/dashboard/clients/${clientId}/company/${companyId}`}
            />

            {/* Status Bar */}
            <ShadowCard className="p-8 border border-gray-100 shadow-sm rounded-2xl bg-white space-y-8">
                <div className="flex items-center justify-between border-b border-gray-50 pb-6 mb-2">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Process Flow</h3>
                        <p className="text-xs text-gray-400 font-medium">Manage the current stage of incorporation</p>
                    </div>
                    <Select 
                        items={statusItems}
                        trigger={
                            <Button 
                                variant="outline" 
                                className="rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all font-bold text-[10px] uppercase tracking-widest h-10 px-6 gap-2"
                                disabled={updateStatusMutation.isPending}
                            >
                                {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-3 w-3" />}
                                Update Status: {cycle.status}
                            </Button>
                        }
                    />
                </div>
                <div className="flex items-center justify-between relative px-4">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
                    <div 
                        className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 transition-all duration-1000 z-0"
                        style={{ width: `${(Math.max(0, currentStatusIndex) / (statusSteps.length - 1)) * 100}%` }}
                    ></div>

                    {statusSteps.map((status, index) => {
                        const isActive = index <= currentStatusIndex;
                        const isCompleted = index < currentStatusIndex || cycle.status === 'COMPLETED';
                        
                        return (
                            <div key={status} className="relative z-10 flex flex-col items-center">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                                    isActive ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-gray-100 text-gray-300'
                                }`}>
                                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                                </div>
                                <span className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                                    {status.replace('_', ' ')}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </ShadowCard>

            {/* Document Requests - Full Width */}
                <ShadowCard className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Required Documents
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="h-8 rounded-xl border-dashed border-gray-200 text-primary hover:bg-primary/5 hover:border-primary/40 text-[10px] uppercase font-bold tracking-widest px-4"
                            disabled={createDocumentRequestMutation.isPending}
                        >
                            {createDocumentRequestMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} className="mr-1.5" />}
                            Add Category
                        </Button>
                    </div>
                    <div className="space-y-6">
                        {transformedDocs.length > 0 ? (
                            transformedDocs.map((dr, index) => (
                                <div key={dr._id || index} className="space-y-4">
                                    <div className="pb-2 border-b border-gray-50 flex items-center justify-between">
                                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            {dr.category}
                                        </h4>
                                        {/* Status dropdown */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenDropdownId(openDropdownId === (dr._id || String(index)) ? null : (dr._id || String(index)))}
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${statusBadgeClass(dr.status || 'DRAFT')}`}
                                            >
                                                <span>{dr.status || 'DRAFT'}</span>
                                                <ChevronDown size={10} />
                                            </button>
                                            {openDropdownId === (dr._id || String(index)) && (
                                                <div className="absolute right-0 top-8 flex flex-col bg-white border border-gray-100 rounded-xl shadow-lg z-20 min-w-[130px] overflow-hidden">
                                                    {docRequestStatuses.map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => {
                                                                updateDocRequestStatusMutation.mutate({ requestId: dr._id, status: s });
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className={`px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider hover:bg-gray-50 transition-colors ${
                                                                (dr.status || 'DRAFT') === s ? 'text-primary font-bold bg-primary/5' : 'text-gray-700'
                                                            }`}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {dr.documents && dr.documents.length > 0 && (
                                        <SingleDocumentRequest requestId={dr._id} documents={dr.documents} />
                                    )}
                                    {dr.multipleDocuments && dr.multipleDocuments.length > 0 && (
                                        <DoubleDocumentRequest requestId={dr._id} multipleDocuments={dr.multipleDocuments} />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-30">
                                <FileText className="h-12 w-12" />
                                <p className="text-sm font-medium italic">No specific document requests for this cycle yet.</p>
                            </div>
                        )}
                    </div>
                </ShadowCard>
        </div>
        
        {activeRequestId && (
            <AddRequestedDocumentModal 
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setActiveRequestId(null);
                }}
                documentRequestId={activeRequestId}
            />
        )}

        <AddCategoryModal 
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            onConfirm={(title) => createDocumentRequestMutation.mutate(title)}
            isPending={createDocumentRequestMutation.isPending}
        />
        </>
    );
};

export default IncorpCycle;
