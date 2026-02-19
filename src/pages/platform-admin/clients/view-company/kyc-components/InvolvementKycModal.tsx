import React, { useState, useEffect } from 'react';
import { X, UserPlus, Plus, Loader2, Info, Trash2, LayoutGrid, CheckCircle2, User } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from '../../../../../ui/Button';
import { apiGet, apiPost, apiPostFormData } from '../../../../../config/base';
import { endPoints } from '../../../../../config/endPoint';
import type { CompanyInvolvement } from '../../../../../types/company';
import type { KycWorkflow } from './types';

interface InvolvementKycModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  kycId: string;
  type: 'Shareholder' | 'Representative' | 'Director';
  workflows: KycWorkflow[];
  onSuccess: () => void;
  // For adding to existing
  existingInvolvementKycId?: string;
  existingDocumentRequestId?: string;
}

const InvolvementKycModal: React.FC<InvolvementKycModalProps> = ({
  isOpen,
  onClose,
  companyId,
  kycId,
  type,
  workflows,
  onSuccess,
  existingInvolvementKycId,
  existingDocumentRequestId,
}) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1); // 1: Select Involvement, 2: Configure Docs (if creating new)
  const [selectedInvolvementId, setSelectedInvolvementId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    documentName: "",
    isMandatory: true,
    count: 'SINGLE' as 'SINGLE' | 'MULTIPLE',
    type: 'DIRECT' as 'DIRECT' | 'TEMPLATE',
    templateInstructions: "",
    templateFile: null as File | null,
    multipleItems: [{ label: "", instruction: "", isMandatory: true, templateFile: null as File | null }] as any[],
  });

  useEffect(() => {
    if (existingInvolvementKycId) {
      setStep(2);
    } else {
      setStep(1);
    }
  }, [existingInvolvementKycId, isOpen]);

  const { data: allInvolvements } = useQuery<CompanyInvolvement[]>({
    queryKey: ['involvements', companyId],
    queryFn: () => apiGet<{ data: CompanyInvolvement[] }>(endPoints.INVOLVEMENT.GET_BY_COMPANY(companyId)).then(res => res.data),
    enabled: isOpen && !existingInvolvementKycId,
  });

  const availableInvolvements = allInvolvements?.filter(inv => {
    // 1. Role match
    const roleToMatch = type === 'Shareholder' ? 'SHAREHOLDER' : 'LEGAL_REPRESENTATIVE';
    const hasRole = inv.role?.includes(roleToMatch as any);
    if (!hasRole) return false;

    // 2. Already in KYC for THIS tab
    const alreadyInKyc = workflows.some(w => 
      w.workflowType === type && 
      w.documentRequests.some(dr => dr.person?._id === (inv.person?.id || inv.holderCompany?.id))
    );
    return !alreadyInKyc;
  }) || [];

  const createInvolvementKycMutation = useMutation({
    mutationFn: async () => {
        // 1. Link Involvement
        const res = await apiPost<any>(endPoints.COMPANY.KYC(companyId) + `/${kycId}/involvement-kyc`, { 
            involvementId: selectedInvolvementId 
        });
        const drId = res.data.documentRequestId;
        
        // 2. Add Requested Document(s)
        await submitDocRequest(drId);
        return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-cycle', companyId] });
      onSuccess();
      onClose();
    }
  });

  const addDocRequestOnlyMutation = useMutation({
    mutationFn: () => submitDocRequest(existingDocumentRequestId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-cycle', companyId] });
      onSuccess();
      onClose();
    }
  });

  const submitDocRequest = async (documentRequestId: string) => {
    // 1. Create parent or SINGLE doc
    const parentFd = new FormData();
    parentFd.append("documentName", formData.documentName);
    parentFd.append("description", "");
    parentFd.append("type", formData.type);
    parentFd.append("count", formData.count);
    parentFd.append("isMandatory", String(formData.isMandatory));
    
    if (formData.type === 'TEMPLATE' && formData.count === 'SINGLE' && formData.templateFile) {
      parentFd.append("template", formData.templateFile);
    }
    
    const parentRes = await apiPostFormData<any>(
      endPoints.DOCUMENT_REQUESTS.DOCUMENTS(documentRequestId), 
      parentFd
    );
    
    const parentId = parentRes.data.id;
    
    // 2. Create children (if MULTIPLE)
    if (formData.count === 'MULTIPLE' && formData.multipleItems.length > 0) {
      for (const item of formData.multipleItems) {
        if (!item.label) continue;
        const childFd = new FormData();
        childFd.append("documentName", item.label);
        childFd.append("description", item.instruction || "");
        childFd.append("type", formData.type);
        childFd.append("count", 'SINGLE');
        childFd.append("isMandatory", String(item.isMandatory ?? true));
        childFd.append("parentId", parentId);
        if (formData.type === 'TEMPLATE' && item.templateFile) {
          childFd.append("template", item.templateFile);
        }
        await apiPostFormData(endPoints.DOCUMENT_REQUESTS.DOCUMENTS(documentRequestId), childFd);
      }
    }
  };

  const isPending = createInvolvementKycMutation.isPending || addDocRequestOnlyMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300 overflow-hidden">
      <div 
        className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
              <UserPlus size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {existingInvolvementKycId ? "Add Document Request" : `Link ${type} KYC`}
              </h3>
              <p className="text-xs text-gray-500 font-medium">Configure documentation requirements</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {!existingInvolvementKycId && step === 1 && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <User size={14} /> Select {type}
              </label>
              <div className="grid grid-cols-1 gap-3">
                {availableInvolvements.length > 0 ? (
                  availableInvolvements.map(inv => (
                    <button
                      key={inv.id}
                      onClick={() => {
                        setSelectedInvolvementId(inv.id);
                        setStep(2);
                      }}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between hover:border-primary hover:bg-primary/5 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-primary transition-all font-bold">
                          {(inv.person?.name || inv.holderCompany?.name || '?').charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{inv.person?.name || inv.holderCompany?.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{inv.partyType}</p>
                        </div>
                      </div>
                      <Plus size={18} className="text-gray-300 group-hover:text-primary" />
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 italic text-sm border-2 border-dashed rounded-3xl border-gray-100">
                    No additional {type.toLowerCase()}s available to link.
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              {selectedInvolvementId && (
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl border border-primary/10 mb-4">
                   <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary font-bold shadow-sm">
                      {availableInvolvements.find(i => i.id === selectedInvolvementId)?.person?.name.charAt(0) || '?'}
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-bold text-gray-800">Selected: {availableInvolvements.find(i => i.id === selectedInvolvementId)?.person?.name || availableInvolvements.find(i => i.id === selectedInvolvementId)?.holderCompany?.name}</p>
                   </div>
                   {!existingInvolvementKycId && (
                     <Button size="sm" variant="ghost" onClick={() => setStep(1)} className="text-[10px] uppercase font-bold text-primary">Change</Button>
                   )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Document Name</label>
                  <input 
                    value={formData.documentName} 
                    onChange={e => setFormData({...formData, documentName: e.target.value})} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
                    placeholder="e.g. Passport Copy" 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type</label>
                  <select 
                    className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium outline-none" 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="DIRECT">Direct Upload</option>
                    <option value="TEMPLATE">Template Based</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Copy Mode</label>
                  <select 
                    className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-medium outline-none" 
                    value={formData.count} 
                    onChange={e => setFormData({...formData, count: e.target.value as any})}
                  >
                    <option value="SINGLE">Single Copy</option>
                    <option value="MULTIPLE">Multiple Copies (Group)</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <div className="flex items-center h-5">
                    <input 
                      type="checkbox" 
                      id="modal-isMandatory" 
                      className="h-5 w-5 rounded-lg border-gray-200 text-primary focus:ring-primary/20 transition-all cursor-pointer" 
                      checked={formData.isMandatory} 
                      onChange={e => setFormData({...formData, isMandatory: e.target.checked})} 
                    />
                  </div>
                  <label htmlFor="modal-isMandatory" className="text-sm font-bold text-gray-600 cursor-pointer">Mark as Mandatory</label>
                </div>
              </div>

              {formData.type === 'TEMPLATE' && formData.count === 'SINGLE' && (
                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
                  <div className="flex items-center gap-2 text-blue-800 font-bold text-sm"><Info size={16} /> Template Configuration</div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Template File</label>
                    <input 
                        type="file" 
                        className="w-full text-xs text-blue-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-all" 
                        onChange={(e) => setFormData({...formData, templateFile: e.target.files?.[0] || null})} 
                    />
                  </div>
                </div>
              )}

              {formData.count === 'MULTIPLE' && (
                <div className="p-6 bg-purple-50/50 rounded-[32px] border border-purple-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
                      <LayoutGrid size={16} /> Multiple Copy Labels
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setFormData({...formData, multipleItems: [...formData.multipleItems, { label: "", instruction: "", isMandatory: true, templateFile: null }]})} 
                      className="bg-white rounded-xl h-8 text-[10px] font-black uppercase tracking-widest border-purple-200 text-purple-600 hover:bg-purple-100"
                    >
                      <Plus size={14} className="mr-1" /> Add Label
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.multipleItems.map((item, idx) => (
                      <div key={idx} className="p-5 bg-white rounded-2xl border border-purple-100 shadow-sm space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Label {idx + 1}</label>
                            <input 
                                value={item.label} 
                                onChange={e => { const newItems = [...formData.multipleItems]; newItems[idx].label = e.target.value; setFormData({...formData, multipleItems: newItems}); }} 
                                placeholder="e.g. Page 1" 
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-medium focus:ring-1 focus:ring-purple-200" 
                            />
                          </div>
                          {formData.multipleItems.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => { const newItems = formData.multipleItems.filter((_, i) => i !== idx); setFormData({...formData, multipleItems: newItems}); }} className="mt-6 text-red-500 hover:bg-red-50 rounded-xl">
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instruction</label>
                            <input 
                                value={item.instruction} 
                                onChange={e => { const newItems = [...formData.multipleItems]; newItems[idx].instruction = e.target.value; setFormData({...formData, multipleItems: newItems}); }} 
                                placeholder="Specific to this item..." 
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none text-xs font-medium" 
                            />
                          </div>
                          {formData.type === 'TEMPLATE' && (
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Template File</label>
                              <input 
                                type="file" 
                                className="w-full text-[10px] text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-gray-100 file:text-gray-600 hover:file:bg-gray-200" 
                                onChange={e => { const newItems = [...formData.multipleItems]; newItems[idx].templateFile = e.target.files?.[0] || null; setFormData({...formData, multipleItems: newItems}); }} 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-50 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2 rounded-xl border-gray-200 text-gray-500 hover:bg-white h-11 font-bold uppercase tracking-widest text-[10px]"
          >
            Cancel
          </Button>
          {(existingInvolvementKycId || step === 2) && (
            <Button
              onClick={() => {
                if (existingInvolvementKycId) addDocRequestOnlyMutation.mutate();
                else createInvolvementKycMutation.mutate();
              }}
              disabled={isPending || !formData.documentName || (step === 2 && !existingInvolvementKycId && !selectedInvolvementId)}
              className="px-8 py-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all h-11 font-bold uppercase tracking-widest text-[10px] disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              {existingInvolvementKycId ? "Add Request" : "Link & Create"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvolvementKycModal;
