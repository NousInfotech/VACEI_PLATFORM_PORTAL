import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../../../config/base';
import { endPoints } from '../../../../../config/endPoint';
import { Loader2 } from 'lucide-react';
import type { ServiceRequest } from '../../../../../types/service-request-template';

import IncorpCycle from '../../../clients/IncorpCycle';

const IncorpCycleRedirector: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: request, isLoading, error } = useQuery<ServiceRequest>({
    queryKey: ['service-request-redirect', id],
    queryFn: () => apiGet<{ success: boolean; data: ServiceRequest }>(endPoints.SERVICE_REQUEST.GET_BY_ID(id!)).then((res: any) => res.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-gray-500 font-medium">Resolving incorporation cycle path...</p>
      </div>
    );
  }

  if (error || (request && (!request.clientId || !request.companyId))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-bold uppercase tracking-widest text-xs">
          Error Resolving Path
        </div>
        <p className="text-gray-500 max-w-xs">
          Could not find the necessary client or company information for this service request.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="text-primary font-bold text-sm hover:underline"
        >
          Back
        </button>
      </div>
    );
  }

  if (!request) return null;

  return (
    <IncorpCycle 
      clientId={request.clientId} 
      companyId={request.companyId} 
    />
  );
};

export default IncorpCycleRedirector;
