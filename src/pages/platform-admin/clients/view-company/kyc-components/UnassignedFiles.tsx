import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, CheckCircle, Eye, Trash2 } from 'lucide-react';
import { Button } from '../../../../../ui/Button';
import { apiPatch, apiDelete } from '../../../../../config/base';
import { endPoints } from '../../../../../config/endPoint';
import type { UnassignedFile, DocumentRequest } from './types';

interface UnassignedFilesProps {
  requestId: string;
  unassignedFiles: UnassignedFile[];
  documentRequest: DocumentRequest;
}

const UnassignedFiles: React.FC<UnassignedFilesProps> = ({ requestId, unassignedFiles, documentRequest }) => {
  const [selectedMappings, setSelectedMappings] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: ({ requestedDocId, fileId }: { requestedDocId: string; fileId: string }) =>
      apiPatch(endPoints.DOCUMENT_REQUESTS.ATTACH_FILES(requestId, requestedDocId), { fileId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-cycle'] });
      toast.success('File assigned successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to assign file', { description: error?.response?.data?.message || error?.message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) =>
      apiDelete(endPoints.DOCUMENT_REQUESTS.UNASSIGNED_FILE(requestId, fileId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-cycle'] });
      toast.success('Unassigned file removed');
    },
    onError: (error: any) => {
      toast.error('Failed to remove file', { description: error?.response?.data?.message || error?.message });
    }
  });

  if (!unassignedFiles || unassignedFiles.length === 0) return null;

  // Flatten all potential requirements and filter those without a file
  const allRequirements = [
    ...(documentRequest.documents || [])
      .filter(d => !d.url && d._id)
      .map(d => ({ id: d._id!, name: d.name })),
    ...(documentRequest.multipleDocuments || []).flatMap(g => 
        (g.multiple || [])
          .filter(item => !item.url && item._id)
          .map(item => ({ id: item._id!, name: `${g.name} - ${item.label}` }))
    )
  ];

  return (
    <div className="mb-6 border-b border-gray-100 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Unassigned Bulk Uploads ({unassignedFiles.length})
        </h5>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {unassignedFiles.map((file) => (
          <div key={file.fileId} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-indigo-100 transition-all group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate" title={file.fileName}>
                    {file.fileName}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    Uploaded on {new Date(file.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  onClick={() => window.open(file.url, '_blank')}
                  title="View File"
                >
                  <Eye size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove "${file.fileName}"?`)) {
                      deleteMutation.mutate(file.fileId);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  title="Remove File"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <select
                className="flex-1 bg-gray-50 border-gray-100 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:ring-1 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                value={selectedMappings[file.fileId] || ""}
                onChange={(e) => setSelectedMappings(prev => ({ ...prev, [file.fileId]: e.target.value }))}
                disabled={assignMutation.isPending}
              >
                <option value="">Select Requirement...</option>
                {allRequirements.map(req => (
                  <option key={req.id} value={req.id}>{req.name}</option>
                ))}
              </select>
              
              <Button
                size="sm"
                className="rounded-lg h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider px-4 disabled:opacity-50"
                onClick={() => assignMutation.mutate({ requestedDocId: selectedMappings[file.fileId], fileId: file.fileId })}
                disabled={!selectedMappings[file.fileId] || assignMutation.isPending}
              >
                <CheckCircle size={14} className="mr-1.5" />
                Assign
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnassignedFiles;
