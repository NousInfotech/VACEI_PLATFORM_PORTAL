import React, { useState } from 'react';
import { X, FileText, Upload, Plus, Loader2, CheckCircle2, LayoutGrid, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from '../../../../../ui/Button';
import { apiPostFormData } from '../../../../../config/base';
import { endPoints } from '../../../../../config/endPoint';

interface AddRequestedDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentRequestId: string;
  parentId?: string | null;
  onSuccess?: () => void;
}

const AddRequestedDocumentModal: React.FC<AddRequestedDocumentModalProps> = ({
  isOpen,
  onClose,
  documentRequestId,
  parentId = null,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    documentName: "",
    type: "DIRECT" as "DIRECT" | "TEMPLATE",
    count: "SINGLE" as "SINGLE" | "MULTIPLE",
    instruction: "",
    templateFile: null as File | null,
    isMandatory: true,
    multipleItems: [{ label: "", instruction: "", isMandatory: true, templateFile: null as File | null }] as any[],
  });


  const createMutation = useMutation({
    mutationFn: async () => {
      // 1. Create parent or SINGLE doc
      const parentFd = new FormData();
      parentFd.append("documentName", formData.documentName);
      parentFd.append("type", formData.type);
      parentFd.append("count", formData.count);
      parentFd.append("isMandatory", String(formData.isMandatory));
      parentFd.append("description", ""); // Base description is empty
      
      if (parentId) {
        parentFd.append("parentId", parentId);
      }
      
      if (formData.type === "TEMPLATE" && formData.count === 'SINGLE' && formData.templateFile) {
        parentFd.append("template", formData.templateFile);
      }

      const parentRes = await apiPostFormData<any>(endPoints.DOCUMENT_REQUESTS.DOCUMENTS(documentRequestId), parentFd);
      
      const newParentId = parentRes.data.id;

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
          childFd.append("parentId", newParentId);
          if (formData.type === 'TEMPLATE' && item.templateFile) {
            childFd.append("template", item.templateFile);
          }
          await apiPostFormData(endPoints.DOCUMENT_REQUESTS.DOCUMENTS(documentRequestId), childFd);
        }
      }

      return parentRes.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-cycle"] });
      queryClient.invalidateQueries({ queryKey: ["incorporation-cycle"] });
      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setFormData({
        documentName: "",
        type: "DIRECT",
        count: "SINGLE",
        instruction: "",
        templateFile: null,
        isMandatory: true,
        multipleItems: [{ label: "", instruction: "", isMandatory: true, templateFile: null }],
      });
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-2xl flex flex-col rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Plus size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Add Requested Document</h3>
              <p className="text-xs text-gray-500 font-medium">Define a new requirement for this section</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="space-y-4">
            <div className="space-y-1.5 focus-within:ring-2 focus-within:ring-primary/10 ring-offset-2 rounded-xl transition-all">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1 pl-1">
                <FileText size={14} /> Document Title
              </label>
              <input 
                value={formData.documentName} 
                onChange={e => setFormData({...formData, documentName: e.target.value})} 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-primary/50 outline-none text-sm font-semibold transition-all"
                placeholder="e.g. Identity Proof" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 pl-1">Type</label>
                <select 
                  className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-sm font-semibold outline-none focus:bg-white focus:border-primary/50 transition-all appearance-none cursor-pointer" 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="DIRECT">Direct Upload</option>
                  <option value="TEMPLATE">Template Based</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 pl-1">Document Count</label>
                <select 
                  className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-sm font-semibold outline-none focus:bg-white focus:border-primary/50 transition-all appearance-none cursor-pointer" 
                  value={formData.count} 
                  onChange={e => setFormData({...formData, count: e.target.value as any})}
                >
                  <option value="SINGLE">Single Document</option>
                  <option value="MULTIPLE">Multiple Documents (Group)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-1">
              <div className="flex items-center h-6">
                <input 
                  type="checkbox" 
                  id="modal-isMandatory-new" 
                  className="h-6 w-6 rounded-lg border-gray-200 text-primary focus:ring-primary/20 transition-all cursor-pointer" 
                  checked={formData.isMandatory} 
                  onChange={e => setFormData({...formData, isMandatory: e.target.checked})} 
                />
              </div>
              <label htmlFor="modal-isMandatory-new" className="text-sm font-bold text-gray-600 cursor-pointer select-none">Mark as Mandatory Requirement</label>
            </div>


            {formData.type === 'TEMPLATE' && formData.count === 'SINGLE' && (
              <div className="space-y-5 p-6 bg-primary/5 rounded-[24px] border border-primary/10 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Upload Template File</label>
                  <div className="relative group">
                    <input 
                        type="file" 
                        id="template-file-input"
                        className="hidden" 
                        onChange={(e) => setFormData({...formData, templateFile: e.target.files?.[0] || null})} 
                    />
                    <label 
                      htmlFor="template-file-input"
                      className="w-full flex items-center justify-between px-4 py-3 bg-white border border-primary/20 rounded-xl cursor-pointer hover:border-primary transition-all group-hover:shadow-sm"
                    >
                      <span className="text-xs font-semibold text-gray-600 truncate max-w-[200px]">
                        {formData.templateFile ? formData.templateFile.name : "Select template file..."}
                      </span>
                      <Upload size={16} className="text-primary" />
                    </label>
                  </div>
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
        </div>

        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="px-6 h-12 rounded-2xl text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:bg-white hover:text-gray-600 transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !formData.documentName || (formData.type === 'TEMPLATE' && formData.count === 'SINGLE' && !formData.templateFile)}
            className="px-10 h-12 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all font-bold uppercase tracking-widest text-[10px] disabled:opacity-50 disabled:scale-100"
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Create Request
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddRequestedDocumentModal;
