import React from "react";
import { Eye, Download, FileText, Clock } from "lucide-react";
import type { DocumentRequestDocumentSingle } from "./types";
import { Button } from "../../../../../ui/Button";
import Badge from "../../../../common/Badge";

interface DocumentRequestSingleProps {
  requestId: string;
  documents: DocumentRequestDocumentSingle[];
}

const DocumentRequestSingle: React.FC<DocumentRequestSingleProps> = ({
  documents,
}) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        No documents requested
      </div>
    );
  }

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
    <div className="space-y-3">
      {documents.map((doc, docIndex) => {
        const docType = typeof doc.type === "string" ? doc.type : (doc.type as { type?: string })?.type ?? "direct";

        return (
          <div key={doc._id ?? docIndex} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-sm transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-gray-900 text-sm leading-none">{doc.name}</p>
                {doc.description && (
                  <p className="text-[10px] text-gray-500 font-medium">{doc.description}</p>
                )}
                <div className="flex items-center gap-3">
                  <Badge variant={docType === "template" ? "primary" : "gray"} className="text-[9px] px-1.5 h-4">
                    {docType === "template" ? "Template" : "Direct"}
                  </Badge>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                    doc.status === 'verified' ? 'bg-green-100 text-green-700' : 
                    doc.url ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {doc.status === 'verified' ? 'Approved' : doc.url ? 'Submitted' : 'Pending'}
                  </span>
                  {doc.url && doc.uploadedAt && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(doc.uploadedAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {doc.url ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(doc.url!, "_blank")}
                    className="h-8 flex items-center gap-2 rounded-xl border-gray-100 text-gray-600 hover:bg-gray-50 px-3 transition-colors"
                    title="View Document"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">View</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(doc.url!, doc.name)}
                    className="h-8 flex items-center gap-2 rounded-xl border-gray-100 text-gray-600 hover:bg-gray-50 px-3 transition-colors"
                    title="Download Document"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Download</span>
                  </Button>
                </>
              ) : (
                <div className="px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Waiting for Upload</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DocumentRequestSingle;
