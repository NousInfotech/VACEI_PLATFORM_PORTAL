import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { KycWorkflow } from './types';
import DocumentRequestSingle from './SingleDocumentRequest';
import DocumentRequestDouble from './DoubleDocumentRequest';
import ShadowCard from '../../../../../ui/ShadowCard';
import { Building2, Plus, Trash2, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { apiPatch, apiDelete, apiPost, apiPostFormData } from '../../../../../config/base';
import { endPoints } from '../../../../../config/endPoint';
import { Button } from '../../../../../ui/Button';
import AddRequestedDocumentModal from './AddRequestedDocumentModal';
import { ConfirmModal } from '../../../../messages/components/ConfirmModal';

// Import KYC Templates
import kycCompanyTemplate from '../../../../../../src/data/kycCompanyTemplate.json';

interface CompanyKycProps {
  workflows: KycWorkflow[];
  companyId: string;
  kycId?: string;
}

const CompanyKyc: React.FC<CompanyKycProps> = ({ workflows, companyId, kycId }) => {
  const queryClient = useQueryClient();
  const companyWorkflows = workflows.filter(w => w.workflowType === 'Company');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [expandedWorkflows, setExpandedWorkflows] = useState<Record<string, boolean>>({});

  const toggleWorkflow = (id: string) => {
    setExpandedWorkflows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'primary';
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const patchKycStatusMutation = useMutation({
    mutationFn: (status: string) => 
      apiPatch(endPoints.COMPANY.KYC(companyId) + `/${kycId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-cycle', companyId] });
      // Also refresh the company list so kycStatus badge updates in ViewClient
      queryClient.invalidateQueries({ queryKey: ['client-companies'] });
      toast.success('KYC status updated successfully.');
    },
    onError: (error: any) => {
      toast.error('Failed to update KYC status', {
        description: error?.response?.data?.message || error?.message || 'Unexpected error'
      });
    }
  });

  const deleteKycMutation = useMutation({
    mutationFn: () => apiDelete(endPoints.COMPANY.KYC(companyId) + `/${kycId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-cycle', companyId] });
    }
  });


  const createDocumentRequestMutation = useMutation({
    mutationFn: async (mode: 'MANUAL' | 'TEMPLATE' = 'MANUAL') => {
      if (!kycId) throw new Error("KYC ID is missing");
      const res = await apiPost<{ data: { documentRequest: { id: string } } }>(endPoints.COMPANY.KYC_DOCUMENT_REQUEST(kycId), {
        title: mode === 'TEMPLATE' ? kycCompanyTemplate.DOC_REQUEST[0].data.title : "Company Verification Documents",
        description: mode === 'TEMPLATE' ? kycCompanyTemplate.DOC_REQUEST[0].data.description : "Standard documents required for company verification"
      });

      const drId = res?.data?.documentRequest?.id;
      if (mode === 'TEMPLATE' && drId) {
        await submitTemplateDocs(drId);
      }
      return res.data;
    },
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kyc-cycle', companyId] });
      const drId = data?.documentRequest?.id;
      if (drId && variables === 'MANUAL') {
        setActiveRequestId(drId);
        setIsAddModalOpen(true);
      }
    }
  });

  const isAnyActionLoading = patchKycStatusMutation.isPending || deleteKycMutation.isPending || createDocumentRequestMutation.isPending;

  const updateDocRequestStatusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: string }) =>
      apiPatch(endPoints.DOCUMENT_REQUESTS.UPDATE_STATUS(requestId), { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-cycle', companyId] });
      toast.success('Document status updated.');
    },
    onError: (error: any) => {
      toast.error('Failed to update document status', {
        description: error?.response?.data?.message || error?.message || 'Unexpected error'
      });
    }
  });

  const docRequestStatuses = ['DRAFT', 'ACTIVE', 'COMPLETED'];

  const docStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const submitTemplateDocs = async (documentRequestId: string) => {
    const docRequestData = kycCompanyTemplate.DOC_REQUEST[0].data;

    for (const rd of docRequestData.requestedDocuments) {
        const fd = new FormData();
        fd.append("documentName", rd.documentName);
        fd.append("description", rd.description || "");
        fd.append("type", rd.type);
        fd.append("count", rd.count);
        fd.append("isMandatory", String(rd.isMandatory));
        
        const res = await apiPostFormData<any>(
            endPoints.DOCUMENT_REQUESTS.DOCUMENTS(documentRequestId), 
            fd
        );

        if (rd.count === 'MULTIPLE' && (rd as any).children?.length > 0) {
            const parentId = res.data.id;
            for (const child of (rd as any).children) {
                const childFd = new FormData();
                childFd.append("documentName", child.documentName);
                childFd.append("description", child.description || "");
                childFd.append("type", rd.type);
                childFd.append("count", 'SINGLE');
                childFd.append("isMandatory", String(child.isMandatory));
                childFd.append("parentId", parentId);
                await apiPostFormData(endPoints.DOCUMENT_REQUESTS.DOCUMENTS(documentRequestId), childFd);
            }
        }
    }
  };

  if (companyWorkflows.length === 0) {
    return (
      <div className="p-16 text-center bg-gray-50/30 rounded-[2.5rem] border border-dashed border-gray-200 animate-in fade-in duration-700 flex flex-col items-center">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
          <Building2 size={40} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">No Company KYC Found</h3>
        <p className="text-base text-gray-500 mt-2 font-medium max-w-xs mx-auto mb-8">
          Initialization required for company-level verification documents.
        </p>
        <div className="flex gap-4">
          <Button 
            onClick={() => createDocumentRequestMutation.mutate('TEMPLATE')} 
            disabled={createDocumentRequestMutation.isPending}
            className="rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all px-8 h-12 font-bold uppercase tracking-widest text-xs"
          >
            {createDocumentRequestMutation.isPending ? 'Initializing...' : <><Plus size={18} className="mr-2" /> Initial from Template</>}
          </Button>
          <Button 
            onClick={() => createDocumentRequestMutation.mutate('MANUAL')} 
            disabled={isAnyActionLoading}
            variant="outline"
            className="rounded-xl border-gray-200 text-gray-500 hover:bg-white h-12 px-8 font-bold uppercase tracking-widest text-xs"
          >
            Manual Setup
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {companyWorkflows.map(workflow => {
        const isExpanded = expandedWorkflows[workflow._id] ?? true;
        const mainRequest = workflow.documentRequests[0];

        // Progress calculation
        const totalDocs = workflow.documentRequests.reduce((acc, wr) => {
          return acc
            + (wr.documentRequest.documents?.length || 0)
            + (wr.documentRequest.multipleDocuments?.reduce((a, md) => a + (md.multiple?.length || 0), 0) || 0);
        }, 0);
        const uploadedDocs = workflow.documentRequests.reduce((acc, wr) => {
          return acc
            + (wr.documentRequest.documents?.filter(d => d.url).length || 0)
            + (wr.documentRequest.multipleDocuments?.reduce((a, md) => a + (md.multiple?.filter(item => item.url).length || 0), 0) || 0);
        }, 0);
        const progressPct = totalDocs > 0 ? Math.round((uploadedDocs / totalDocs) * 100) : 0;
        
        return (
          <ShadowCard key={workflow._id} className="bg-white border border-indigo-100 rounded-xl shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                      {mainRequest?.documentRequest.entityName || "Company Documentation"}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="bg-indigo-50 text-indigo-700 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                        Entity KYC
                      </span>
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border ${
                        workflow.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {workflow.status}
                      </span>
                    </div>
                  </div>

                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={workflow.status}
                      disabled={isAnyActionLoading}
                      onChange={e => patchKycStatusMutation.mutate(e.target.value)}
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold border outline-none cursor-pointer transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed ${
                        workflow.status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : workflow.status === 'IN_REVIEW'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : workflow.status === 'REJECTED'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_REVIEW">IN REVIEW</option>
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setConfirmConfig({
                          isOpen: true,
                          title: "Delete KYC Cycle",
                          message: "Are you sure you want to delete this entire KYC verification cycle? All submitted documents and requests will be removed.",
                          onConfirm: () => {
                            deleteKycMutation.mutate();
                            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                          },
                          variant: 'danger'
                        })}
                        disabled={isAnyActionLoading}
                        title="Delete Cycle"
                      >
                        <Trash2 size={18} />
                      </Button>
                  </div>
                  
                  <div className="w-px h-8 bg-gray-100 mx-1" />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWorkflow(workflow._id)}
                    className="rounded-xl border-gray-100 text-gray-500 hover:text-primary hover:bg-primary/5 h-10 px-4 font-bold uppercase tracking-wider text-[10px]"
                  >
                    {isExpanded ? <ChevronUp size={16} className="mr-2" /> : <ChevronDown size={16} className="mr-2" />}
                    {isExpanded ? 'Hide Docs' : 'View Docs'}
                  </Button>
                </div>
              </div>

              {totalDocs > 0 && (
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Document Progress</span>
                    <span className="text-[10px] font-black text-emerald-600">{progressPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out bg-emerald-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {isExpanded && (
              <div className="bg-gray-50/50 border-t border-gray-100 p-8 space-y-8 animate-in slide-in-from-top-2 duration-300">
                {workflow.documentRequests.map(request => (
                  <div key={request._id} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-indigo-400">
                          <ShieldCheck size={18} />
                        </div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                          {request.documentRequest.category || "General Requirements"}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Document Request Status */}
                        <select
                          value={request.documentRequest.status || 'DRAFT'}
                          onChange={(e) => updateDocRequestStatusMutation.mutate({ requestId: request.documentRequest._id, status: e.target.value })}
                          className={`appearance-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border outline-none cursor-pointer transition-all ${docStatusBadgeClass(request.documentRequest.status || 'DRAFT')}`}
                        >
                          {docRequestStatuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveRequestId(request.documentRequest._id);
                            setIsAddModalOpen(true);
                          }}
                          disabled={isAnyActionLoading}
                          className="h-9 px-4 rounded-xl border-dashed border-gray-200 text-primary hover:bg-white hover:border-primary/50 text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all"
                        >
                          <Plus size={16} className="mr-1.5" />
                          Add Requirement
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white rounded-[24px] border border-indigo-50/50 p-6 shadow-sm">
                      {(request.documentRequest.documents.length > 0 || request.documentRequest.multipleDocuments.length > 0) ? (
                        <div className="space-y-6">
                          <DocumentRequestSingle 
                            requestId={request.documentRequest._id}
                            documents={request.documentRequest.documents || []}
                          />
                          <DocumentRequestDouble 
                            requestId={request.documentRequest._id}
                            multipleDocuments={request.documentRequest.multipleDocuments || []}
                          />
                        </div>
                      ) : (
                        <div className="p-12 text-center bg-gray-50/30 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-gray-300">
                            <ShieldCheck size={24} />
                          </div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            No documents requested for this section
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ShadowCard>
        );
      })}

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

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        variant={confirmConfig.variant}
        confirmLabel="Proceed"
      />
    </div>
  );
};

export default CompanyKyc;

