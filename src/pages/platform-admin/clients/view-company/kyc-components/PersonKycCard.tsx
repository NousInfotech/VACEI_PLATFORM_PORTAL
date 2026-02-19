import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, ChevronDown, ChevronUp, Clock, CheckCircle2, Trash2, Plus } from 'lucide-react';
import Badge from '../../../../common/Badge';
import { Button } from '../../../../../ui/Button';
import type { KycRequestFull } from './types';
import DocumentRequestSingle from './SingleDocumentRequest';
import DocumentRequestDouble from './DoubleDocumentRequest';
import { apiPatch, apiDelete } from '../../../../../config/base';
import { endPoints } from '../../../../../config/endPoint';
import InvolvementKycModal from './InvolvementKycModal';
import AddRequestedDocumentModal from './AddRequestedDocumentModal';


interface PersonKycCardProps {
  personKyc: KycRequestFull;
  companyId: string;
  kycId?: string;
  workflowId: string;
}

const PersonKycCard: React.FC<PersonKycCardProps> = ({ personKyc, companyId, kycId, workflowId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { person, documentRequest: request } = personKyc;

  const patchInvolvementStatusMutation = useMutation({
    mutationFn: (status: string) => 
      apiPatch(endPoints.COMPANY.KYC(companyId) + `/${kycId}/involvement-kyc/${workflowId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-cycle', companyId] });
    }
  });

  const deleteInvolvementMutation = useMutation({
    mutationFn: () => apiDelete(endPoints.COMPANY.KYC(companyId) + `/${kycId}/involvement-kyc/${workflowId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-cycle', companyId] });
    }
  });

  if (!person) return null;

  const totalDocuments = (request.documents?.length || 0) + 
    (request.multipleDocuments?.reduce((acc, md) => acc + (md.multiple?.length || 0), 0) || 0);
  
  const uploadedCount = (request.documents?.filter(d => d.url).length || 0) + 
    (request.multipleDocuments?.reduce((acc, md) => acc + (md.multiple?.filter(item => item.url).length || 0), 0) || 0);

  return (
    <div className="bg-white/80 border border-gray-300 rounded-xl shadow-sm hover:bg-white/70 transition-all overflow-hidden mb-4">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
              {person.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">{person.name}</h4>
              {person.address && (
                <p className="text-xs font-medium text-gray-500 leading-tight mt-0.5">{person.address}</p>
              )}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
                   {uploadedCount}/{totalDocuments} Documents
                </Badge>
                <Badge variant="outline" className={`${
                  request.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                } rounded-lg px-2 py-0.5 text-[11px] font-semibold`}>
                  {request.status === 'VERIFIED' ? 'COMPLETED' : request.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                {request.status === 'PENDING' && (
                    <Button 
                        size="sm" 
                        variant="ghost"
                        className="rounded-xl h-8 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-primary hover:bg-primary/5"
                        onClick={() => patchInvolvementStatusMutation.mutate('IN_REVIEW')}
                        disabled={patchInvolvementStatusMutation.isPending}
                    >
                        <Clock size={14} className="mr-1" />
                        Status
                    </Button>
                )}
                {request.status === 'IN_REVIEW' && (
                    <Button 
                        size="sm" 
                        variant="ghost"
                        className="rounded-xl h-8 text-[10px] font-bold uppercase tracking-wider text-green-600 hover:bg-green-50"
                        onClick={() => patchInvolvementStatusMutation.mutate('VERIFIED')}
                        disabled={patchInvolvementStatusMutation.isPending}
                    >
                        <CheckCircle2 size={14} className="mr-1" />
                        Verify
                    </Button>
                )}
                <Button 
                    size="sm" 
                    variant="ghost"
                    className="rounded-xl h-8 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                        if (window.confirm('Remove this person from the KYC cycle?')) {
                            deleteInvolvementMutation.mutate();
                        }
                    }}
                    disabled={deleteInvolvementMutation.isPending}
                >
                    <Trash2 size={14} />
                </Button>
            </div>
            
            <div className="w-px h-6 bg-gray-100 mx-1" />

            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded-xl border-gray-100 text-gray-500 hover:text-primary hover:bg-primary/5 h-10 px-4 font-bold uppercase tracking-wider text-[10px]"
            >
                {isExpanded ? <ChevronUp size={16} className="mr-2" /> : <ChevronDown size={16} className="mr-2" />}
                {isExpanded ? 'Hide' : 'View'}
            </Button>
          </div>
        </div>

        {(person.nationality) && (
          <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-gray-50">
            {person.nationality && (
              <div className="flex items-center gap-2 text-gray-400">
                <Globe className="h-4 w-4 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider">{person.nationality}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="bg-gray-50/50 border-t border-gray-100 p-6 animate-in slide-in-from-top-2 duration-300 space-y-4">
           <div className="flex items-center justify-between mb-2">
             <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Requested Documentation</h5>
           </div>
           
           {(request.documents?.length || 0) + (request.multipleDocuments?.length || 0) > 0 ? (
             <>
               <DocumentRequestSingle 
                 requestId={request._id}
                 documents={request.documents || []}
               />

               <DocumentRequestDouble 
                 requestId={request._id}
                 multipleDocuments={request.multipleDocuments || []}
               />
             </>
           ) : (
             <div className="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center gap-4">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">No documents requested</p>
                <Button 
                   variant="ghost" 
                   size="sm"
                   className="rounded-xl border border-dashed border-gray-200 text-gray-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-[10px] uppercase font-bold tracking-widest px-6"
                   onClick={() => setIsAddDocModalOpen(true)}
               >
                   <Plus className="mr-2 w-3 h-3" />
                   Add First Document
               </Button>
             </div>
           )}

           {request.status !== 'VERIFIED' && (request.documents?.length || 0) + (request.multipleDocuments?.length || 0) > 0 && (
               <div className="pt-4 flex justify-center">
                   <Button 
                       variant="ghost"
                       size="sm"
                       className="rounded-xl border border-dashed border-gray-200 text-gray-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-[10px] uppercase font-bold tracking-widest px-6"
                       onClick={() => setIsAddDocModalOpen(true)}
                   >
                       <Plus className="mr-2 w-3 h-3" />
                       Add Additional Document
                   </Button>
               </div>
           )}
        </div>
      )}

      {isModalOpen && (
        <InvolvementKycModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          companyId={companyId}
          kycId={kycId || ''}
          type="Shareholder" // Type doesn't matter much for editing, but required by prop
          workflows={[]} // Not used for editing
          onSuccess={() => setIsModalOpen(false)}
          existingInvolvementKycId={workflowId}
          existingDocumentRequestId={request._id}
        />
      )}

      <AddRequestedDocumentModal 
        isOpen={isAddDocModalOpen}
        onClose={() => setIsAddDocModalOpen(false)}
        documentRequestId={request._id}
      />

    </div>
  );
};

export default PersonKycCard;
