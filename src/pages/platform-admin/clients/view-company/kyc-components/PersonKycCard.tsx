import React, { useState } from 'react';
import { MapPin, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import ShadowCard from '../../../../../ui/ShadowCard';
import { Button } from '../../../../../ui/Button';
import type { KycRequestFull } from './types';
import DocumentRequestSingle from './SingleDocumentRequest';
import DocumentRequestDouble from './DoubleDocumentRequest';

interface PersonKycCardProps {
  personKyc: KycRequestFull;
}

const PersonKycCard: React.FC<PersonKycCardProps> = ({ personKyc }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { person, documentRequest: request } = personKyc;

  if (!person) return null;

  const totalDocuments = (request.documents?.length || 0) + 
    (request.multipleDocuments?.reduce((acc, md) => acc + (md.multiple?.length || 0), 0) || 0);
  
  const uploadedCount = (request.documents?.filter(d => d.url).length || 0) + 
    (request.multipleDocuments?.reduce((acc, md) => acc + (md.multiple?.filter(item => item.url).length || 0), 0) || 0);

  return (
    <ShadowCard className="bg-white border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 rounded-3xl">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-bold text-xl">
              {person.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">{person.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-0.5 rounded-md">
                   {uploadedCount}/{totalDocuments} Documents
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                  request.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {request.status}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-xl border-gray-100 text-gray-500 hover:text-primary hover:bg-primary/5 h-10 px-4 font-bold uppercase tracking-wider text-[10px]"
          >
            {isExpanded ? <ChevronUp size={16} className="mr-2" /> : <ChevronDown size={16} className="mr-2" />}
            {isExpanded ? 'Hide' : 'View'} Documents
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {person.address && (
            <div className="flex items-start gap-2 text-gray-500">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span className="text-xs font-medium">{person.address}</span>
            </div>
          )}
          {person.nationality && (
            <div className="flex items-center gap-2 text-gray-500">
              <Globe className="h-4 w-4 shrink-0" />
              <span className="text-xs font-medium">{person.nationality}</span>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="bg-gray-50/50 border-t border-gray-100 p-6 animate-in slide-in-from-top-2 duration-300 space-y-4">
           <div className="flex items-center justify-between mb-2">
             <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Requested Documentation</h5>
           </div>
           
           <DocumentRequestSingle 
             requestId={request._id}
             documents={request.documents || []}
           />

           <DocumentRequestDouble 
             requestId={request._id}
             multipleDocuments={request.multipleDocuments || []}
           />
        </div>
      )}
    </ShadowCard>
  );
};

export default PersonKycCard;
