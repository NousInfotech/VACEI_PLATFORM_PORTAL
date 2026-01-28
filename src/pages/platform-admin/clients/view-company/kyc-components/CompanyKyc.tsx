import React from 'react';
import type { KycWorkflow } from './types';
import DocumentRequestSingle from './SingleDocumentRequest';
import DocumentRequestDouble from './DoubleDocumentRequest';
import ShadowCard from '../../../../../ui/ShadowCard';
import { Building2 } from 'lucide-react';

interface CompanyKycProps {
  workflows: KycWorkflow[];
}

const CompanyKyc: React.FC<CompanyKycProps> = ({ workflows }) => {
  const companyWorkflows = workflows.filter(w => w.workflowType === 'Company');

  if (companyWorkflows.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 bg-gray-50/30 rounded-3xl border border-dashed border-gray-200">
        No company-level KYC workflows found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {companyWorkflows.map(workflow => (
        <ShadowCard key={workflow._id} className="p-8 border border-gray-100 bg-white shadow-sm space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/5 rounded-2xl text-primary">
              <Building2 size={26} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Company Documentation</h3>
              <p className="text-sm text-gray-500 font-medium">Core verification documents for the entire entity</p>
            </div>
          </div>
          
          <div className="space-y-8">
            {workflow.documentRequests.map(request => (
              <div key={request._id} className="space-y-6">
                <DocumentRequestSingle 
                  requestId={request.documentRequest._id}
                  documents={request.documentRequest.documents || []}
                />
                <DocumentRequestDouble 
                  requestId={request.documentRequest._id}
                  multipleDocuments={request.documentRequest.multipleDocuments || []}
                />
              </div>
            ))}
          </div>
        </ShadowCard>
      ))}
    </div>
  );
};

export default CompanyKyc;
