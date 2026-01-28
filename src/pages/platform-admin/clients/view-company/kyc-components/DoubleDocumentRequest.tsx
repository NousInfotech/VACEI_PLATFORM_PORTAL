import React from "react";
import { Eye, Download, FileText, Clock } from "lucide-react";
import type { DocumentRequestDocumentMultiple } from "./types";
import Badge from "../../../../common/Badge";
import { Button } from "../../../../../ui/Button";

interface DocumentRequestMultipleProps {
  requestId: string;
  multipleDocuments: DocumentRequestDocumentMultiple[];
}

const DocumentRequestDouble: React.FC<DocumentRequestMultipleProps> = ({
  multipleDocuments,
}) => {
  if (!multipleDocuments || multipleDocuments.length === 0) return null;

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

  return (
    <div className="space-y-4 mt-4">
      {multipleDocuments.map((group) => {
        const groupType = typeof group.type === "string" ? group.type : (group.type as { type?: string })?.type ?? "direct";

        return (
          <div key={group._id} className="p-4 bg-white rounded-2xl border border-gray-100 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm leading-none">{group.name}</p>
                    <Badge variant={groupType === "template" ? "primary" : "gray"} className="text-[9px] px-1.5 h-4">
                      {groupType === "template" ? "Template" : "Direct"}
                    </Badge>
                  </div>
                  {group.instruction && (
                    <p className="text-[10px] text-gray-500 font-medium">{group.instruction}</p>
                  )}
                </div>
              </div>
            </div>

            {group.multiple && group.multiple.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-gray-50">
                {group.multiple.map((item, index) => {
                  return (
                    <div key={`${group._id}-${index}`} className="flex items-center justify-between gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white transition-colors duration-300">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-bold text-gray-700">{item.label}</p>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            item.status === 'verified' ? 'bg-green-100 text-green-700' : 
                            item.url ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.status === 'verified' ? 'Approved' : item.url ? 'Submitted' : 'Pending'}
                          </span>
                          {item.url && item.uploadedAt && (
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                              <Clock className="h-3 w-3" />
                              {formatDateTime(item.uploadedAt)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.url ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(item.url!, "_blank")}
                              className="h-8 flex items-center gap-2 rounded-xl border-gray-100 text-gray-600 hover:bg-white px-3 transition-colors"
                              title="View Document"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">View</span>
                            </Button>
                            <Button
                              size="sm"
                                variant="outline"
                              onClick={() => handleDownload(item.url!, item.label)}
                              className="h-8 flex items-center gap-2 rounded-xl border-gray-100 text-gray-600 hover:bg-white px-3 transition-colors"
                              title="Download Document"
                            >
                              <Download className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Download</span>
                            </Button>
                          </>
                        ) : (
                          <div className="px-3 py-1.5 bg-gray-100/50 rounded-xl border border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Waiting</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DocumentRequestDouble;
