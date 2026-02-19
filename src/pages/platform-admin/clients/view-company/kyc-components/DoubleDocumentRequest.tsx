import React, { useState } from "react";
import { Eye, Download, Upload, Trash2, Edit2, Check, X, Loader2, Plus, FileEdit, FileUp } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DocumentRequestDocumentMultiple } from "./types";
import Badge from "../../../../common/Badge";
import { Button } from "../../../../../ui/Button";
import { apiPostFormData, apiDelete, apiPatch } from "../../../../../config/base";
import { endPoints } from "../../../../../config/endPoint";
import AddRequestedDocumentModal from "./AddRequestedDocumentModal";


interface DocumentRequestMultipleProps {
  requestId: string;
  multipleDocuments: DocumentRequestDocumentMultiple[];
}

const DocumentRequestDouble: React.FC<DocumentRequestMultipleProps> = ({
  requestId,
  multipleDocuments,
}) => {
  const queryClient = useQueryClient();
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);


  if (!multipleDocuments || multipleDocuments.length === 0) return null;

  const uploadMutation = useMutation({
    mutationFn: ({ docId, file }: { docId: string; file: File }) => {
      const fd = new FormData();
      fd.append("files", file);
      return apiPostFormData(endPoints.DOCUMENT_REQUESTS.UPLOAD(requestId, docId), fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-cycle"] });
      queryClient.invalidateQueries({ queryKey: ["incorporation-cycle"] });
      setUploadingDocId(null);
    },
    onError: () => setUploadingDocId(null),
  });

  const clearMutation = useMutation({
    mutationFn: (docId: string) => apiPatch(endPoints.DOCUMENT_REQUESTS.CLEAR(requestId, docId), { reason: "Cleared by admin" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-cycle"] });
      queryClient.invalidateQueries({ queryKey: ["incorporation-cycle"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => apiDelete(endPoints.DOCUMENT_REQUESTS.DELETE(requestId, docId), { reason: "Removed by admin" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-cycle"] });
      queryClient.invalidateQueries({ queryKey: ["incorporation-cycle"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ docId, name }: { docId: string; name: string }) => 
      apiPatch(endPoints.DOCUMENT_REQUESTS.UPDATE(requestId, docId), { documentName: name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-cycle"] });
      queryClient.invalidateQueries({ queryKey: ["incorporation-cycle"] });
      setEditingDocId(null);
    },
  });

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingDocId(docId);
      uploadMutation.mutate({ docId, file });
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {multipleDocuments.map((group) => {
        const groupId = group._id;
        const groupType = typeof group.type === "string" ? group.type : (group.type as { type?: string })?.type ?? "direct";
        const isTemplate = groupType.toLowerCase() === "template";
        const isEditingGroup = editingDocId === groupId;

        return (
          <div key={groupId} className="p-3 bg-white rounded-lg border border-gray-200 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                {isTemplate ? (
                  <FileEdit className="h-5 w-5 text-gray-600 mt-1" />
                ) : (
                  <FileUp className="h-5 w-5 text-gray-600 mt-1" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isEditingGroup ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="text-sm font-bold text-gray-900 border-b border-primary outline-none bg-transparent py-0.5 flex-1"
                          autoFocus
                        />
                        <button onClick={() => updateMutation.mutate({ docId: groupId, name: editName })} className="text-green-500 p-1"><Check size={16} /></button>
                        <button onClick={() => setEditingDocId(null)} className="text-red-500 p-1"><X size={16} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/title">
                        <p className="font-medium text-gray-900">{group.name}</p>
                        <button 
                          onClick={() => { setEditingDocId(groupId); setEditName(group.name); }} 
                          className="opacity-0 group-hover/title:opacity-100 transition-opacity p-1 text-gray-400 hover:text-primary"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                    <Badge variant="outline" className="text-gray-600 border-gray-300 bg-gray-50 capitalize text-[10px]">
                      {isTemplate ? "Template" : "Direct"}
                    </Badge>
                  </div>
                  {group.instruction && (
                    <p className="text-xs text-gray-600">{group.instruction}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {isTemplate && (group as any).template?.url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload((group as any).template.url, `template_${group.name}`)}
                    className="border-amber-300 text-amber-700 hover:bg-amber-700/20 hover:text-amber-700 h-10 w-10 p-0"
                    title="Download Group Template"
                  >
                    <Download size={20} />
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedParentId(groupId!);
                    setIsAddModalOpen(true);
                  }}
                  className="border-blue-300 hover:bg-blue-50 hover:text-blue-800 text-blue-700 h-10 px-4"
                  title="Add Document Item"
                >
                  <Plus size={20} className="mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Add Item</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { if(window.confirm("Delete this entire document group?")) deleteMutation.mutate(groupId!); }}
                  className="h-10 w-10 p-0 rounded-xl text-red-500 hover:bg-red-50"
                  title="Delete Group"
                >
                  <Trash2 size={20} />
                </Button>
              </div>
            </div>

            {group.multiple && group.multiple.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {group.multiple.map((item, index) => {
                  const itemId = item._id || `${groupId}-${index}`;
                  const isEditingItem = editingDocId === itemId;

                  return (
                    <div key={itemId} className="flex items-center justify-between gap-3 border border-gray-400 p-3 rounded-md">
                      <div className="flex-1">
                        {isEditingItem ? (
                          <div className="flex items-center gap-2">
                            <input 
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="text-sm font-bold text-gray-700 border-b border-primary outline-none bg-transparent py-0.5 flex-1"
                              autoFocus
                            />
                            <button onClick={() => updateMutation.mutate({ docId: itemId, name: editName })} className="text-green-500 p-1"><Check size={16} /></button>
                            <button onClick={() => setEditingDocId(null)} className="text-red-500 p-1"><X size={16} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group/item">
                            <p className="text-md font-medium text-gray-900">{item.label}</p>
                            <button 
                              onClick={() => { setEditingDocId(itemId); setEditName(item.label); }} 
                              className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 text-gray-400 hover:text-primary"
                              title="Edit Label"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Badge variant="outline" className="text-gray-600 border-gray-300 text-[10px]">
                            {item.status?.toLowerCase() === 'verified' ? 'Approved' : item.url ? 'Submitted' : 'Pending'}
                          </Badge>
                          {item.url && item.uploadedAt && (
                            <span className="text-xs text-gray-500">
                              Uploaded: {formatDateTime(item.uploadedAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {isTemplate && item.template?.url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(item.template!.url!, `template_${item.label}`)}
                            className="border-amber-300 text-amber-700 hover:bg-amber-700/20 hover:text-amber-700 h-10 w-10 p-0"
                            title="Download Template"
                          >
                            <Download size={20} />
                          </Button>
                        )}

                        {!item.url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.onchange = (e) => onFileChange(e as any, itemId);
                              input.click();
                            }}
                            disabled={uploadingDocId === itemId}
                            className="border-blue-300 hover:bg-blue-50 hover:text-blue-800 text-blue-700 h-10 px-4"
                            title="Upload Document"
                          >
                            {uploadingDocId === itemId ? (
                              <Loader2 size={20} className="animate-spin" />
                            ) : (
                              <>
                                <Upload size={20} className="mr-1.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                              </>
                            )}
                          </Button>
                        )}

                        {item.url && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(item.url!, "_blank")}
                              className="border-blue-300 hover:bg-blue-50 hover:text-blue-800 text-blue-700 h-10 w-10 p-0"
                              title="View Submitted"
                            >
                              <Eye size={20} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(item.url!, item.label || 'document')}
                              className="border-green-300 hover:bg-green-50 hover:text-green-800 text-green-700 h-10 w-10 p-0"
                              title="Download Submitted"
                            >
                              <Download size={20} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { if(window.confirm("Clear this submission?")) clearMutation.mutate(itemId); }}
                              className="border-yellow-300 hover:bg-yellow-50 hover:text-yellow-800 text-yellow-700 h-10 px-3 text-[10px] font-bold uppercase tracking-wider"
                              title="Clear Submission"
                            >
                              Clear
                            </Button>
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { if(window.confirm("Delete this label?")) deleteMutation.mutate(itemId); }}
                          className="h-10 w-10 p-0 rounded-xl text-red-500 hover:bg-red-50 ml-1"
                          title="Delete Label"
                        >
                          <Trash2 size={20} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <AddRequestedDocumentModal 
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedParentId(null);
        }}
        documentRequestId={requestId}
        parentId={selectedParentId}
      />
    </div>
  );
};

export default DocumentRequestDouble;
