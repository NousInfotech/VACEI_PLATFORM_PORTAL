import React from 'react';
import type { KycWorkflow } from './types';
import PersonKycCard from './PersonKycCard';

interface InvolvementsKycProps {
  workflows: KycWorkflow[];
  type: 'Shareholder' | 'Representative';
}

const InvolvementsKyc: React.FC<InvolvementsKycProps> = ({ workflows, type }) => {
  const filteredWorkflows = workflows.filter(w => w.workflowType === type);

  if (filteredWorkflows.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        No {type.toLowerCase()} KYC workflows found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredWorkflows.map(workflow => (
        <div key={workflow._id} className="space-y-4">
          {workflow.documentRequests.map(request => (
            <PersonKycCard 
              key={request._id} 
              personKyc={request} 
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default InvolvementsKyc;
