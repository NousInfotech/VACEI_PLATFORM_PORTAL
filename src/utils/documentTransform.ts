export const transformBackendDocReq = (docReq: any): any => {
  if (!docReq) return null;
  return {
    _id: docReq.id,
    category: docReq.title,
    address: null,
    status: docReq.status,
    documents: (docReq.requestedDocuments || [])
      .filter((d: any) => !d.parentId && d.count === 'SINGLE')
      .map((d: any) => {
        const history = Array.isArray(d.statusHistory) ? d.statusHistory : [];
        const lastRejected = [...history].reverse().find((h: any) => h.status === 'REJECTED');
        return {
          _id: d.id,
          name: d.documentName || d.title,
          description: d.description,
          status: d.status.toLowerCase(),
          rejectionReason: d.rejectionReason || lastRejected?.reason,
          url: d.file?.url,
          uploadedAt: d.file?.url ? (d.file.createdAt || new Date().toISOString()) : undefined,
          uploadedFileName: d.file?.file_name,
          type: d.type,
          template: d.templateFile ? { url: d.templateFile.url } : undefined
        };
      }),
    unassignedFiles: (docReq.unassignedFiles || []).map((f: any) => ({
        fileId: f.id,
        fileName: f.file_name,
        uploadDate: f.createdAt || new Date().toISOString(),
        url: f.url
    })),
    multipleDocuments: (docReq.requestedDocuments || [])
        .filter((d: any) => !d.parentId && d.count === 'MULTIPLE')
        .map((d: any) => ({
            _id: d.id,
            name: d.documentName || d.title,
            instruction: d.description,
            type: d.type,
            multiple: d.children?.map((c: any) => {
                const history = Array.isArray(c.statusHistory) ? c.statusHistory : [];
                const lastRejected = [...history].reverse().find((h: any) => h.status === 'REJECTED');
                return {
                    _id: c.id,
                    label: c.documentName || c.title,
                    status: c.status.toLowerCase(),
                    rejectionReason: c.rejectionReason || lastRejected?.reason,
                    url: c.file?.url,
                    uploadedFileName: c.file?.file_name,
                    template: c.templateFile ? { url: c.templateFile.url } : undefined
                };
            }) || []
        }))
  };
};
