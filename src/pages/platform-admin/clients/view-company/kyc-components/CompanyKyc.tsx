import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { KycWorkflow } from './types';
import DocumentRequestSingle from './SingleDocumentRequest';
import DocumentRequestDouble from './DoubleDocumentRequest';
import ShadowCard from '../../../../../ui/ShadowCard';
import { Building2, CheckCircle2, Clock, Plus, Trash2, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { apiPatch, apiDelete, apiPost } from '../../../../../config/base';
import { endPoints } from '../../../../../config/endPoint';
import { Button } from '../../../../../ui/Button';
import AddRequestedDocumentModal from './AddRequestedDocumentModal';

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

  const patchKycStatusMutation = useMutation({
    mutationFn: (status: string) => 
      apiPatch(endPoints.COMPANY.KYC(companyId) + `/${kycId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-cycle', companyId] });
    }
  });

  const deleteKycMutation = useMutation({
    mutationFn: () => apiDelete(endPoints.COMPANY.KYC(companyId) + `/${kycId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-cycle', companyId] });
    }
  });

  const createDocumentRequestMutation = useMutation({
    mutationFn: () => {
      if (!kycId) throw new Error("KYC ID is missing");
      return apiPost<{ data: { documentRequest: { id: string } } }>(endPoints.COMPANY.KYC_DOCUMENT_REQUEST(kycId), {
        title: "Company Verification Documents",
        description: "Standard documents required for company verification"
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['kyc-cycle', companyId] });
      const drId = response?.data?.documentRequest?.id;
      if (drId) {
        setActiveRequestId(drId);
        setIsAddModalOpen(true);
      }
    }
  });

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
        <Button 
          onClick={() => createDocumentRequestMutation.mutate()} 
          disabled={createDocumentRequestMutation.isPending}
          className="rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all px-8 h-12 font-bold uppercase tracking-widest text-xs"
        >
          <Plus size={18} className="mr-2" />
          Initialize Company KYC
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {companyWorkflows.map(workflow => {
        const isExpanded = expandedWorkflows[workflow._id] ?? true;
        const mainRequest = workflow.documentRequests[0];
        
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
                    {workflow.status === 'PENDING' && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="rounded-xl h-10 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-primary hover:bg-primary/5 px-4"
                        onClick={() => patchKycStatusMutation.mutate('IN_REVIEW')}
                        disabled={patchKycStatusMutation.isPending}
                      >
                        <Clock size={16} className="mr-2" />
                        Move to Review
                      </Button>
                    )}
                    {workflow.status === 'IN_REVIEW' && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="rounded-xl h-10 text-[10px] font-bold uppercase tracking-wider text-green-600 hover:bg-green-50 px-4"
                        onClick={() => patchKycStatusMutation.mutate('VERIFIED')}
                        disabled={patchKycStatusMutation.isPending}
                      >
                        <CheckCircle2 size={16} className="mr-2" />
                        Verify Entity
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (window.confirm('Delete this company KYC workflow?')) {
                          deleteKycMutation.mutate();
                        }
                      }}
                      disabled={deleteKycMutation.isPending}
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveRequestId(request.documentRequest._id);
                          setIsAddModalOpen(true);
                        }}
                        className="h-9 px-4 rounded-xl border-dashed border-gray-200 text-primary hover:bg-white hover:border-primary/50 text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all"
                      >
                        <Plus size={16} className="mr-1.5" />
                        Add Requirement
                      </Button>
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
                            <Clock size={24} />
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
    </div>
  );
};

export default CompanyKyc;

