import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Building2,
  Calendar,
  User,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { ShadowCard } from '../../../../ui/ShadowCard';
import PageHeader from '../../../common/PageHeader';
import { mockRequests, mockQuestions, mockAnswersByRequestId } from './serviceMockData';

const ViewServiceRequest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const request = mockRequests.find(r => r.id === id);
  const answers = id ? (mockAnswersByRequestId[id] || {}) : {};

  // Scroll to top on mount
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Click outside listener for Info popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setShowInfoPopup(false);
      }
    };
    if (showInfoPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInfoPopup]);

  if (!request) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="inline-flex p-6 bg-gray-50 rounded-full text-gray-200">
          <Inbox className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Request Not Found</h2>
        <Button onClick={() => navigate('/dashboard/service-request-management')}>
          Back to List
        </Button>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'COMPLETED': return 'bg-green-50 text-green-600 border-green-100';
      case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'IN_PROGRESS': return <AlertCircle className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle2 className="h-4 w-4" />;
      case 'REJECTED': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6" ref={containerRef}>
      <PageHeader 
        title="View Service Submission" 
        icon={Inbox}
        description={`Reviewing submission for ${request.clientName}`}
        actions={
          <Button 
            onClick={() => navigate('/dashboard/service-request-management')}
            variant='header'
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to List
          </Button>
        } 
      />

      <div className="w-full">
        {/* Main Content: Form Responses */}
        <ShadowCard className="p-8 border border-gray-100 bg-white rounded-[40px] w-full">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h4 className="text-lg font-bold text-gray-900">Form Responses</h4>
                </div>

                <div className="relative" ref={infoRef}>
                  <button 
                    onClick={() => setShowInfoPopup(!showInfoPopup)}
                    className={`p-1.5 rounded-lg transition-all ${showInfoPopup ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-100'}`}
                    title="View client info"
                  >
                    <Info className="h-5 w-5" />
                  </button>
                  
                  {showInfoPopup && (
                    <div className="absolute top-full left-0 mt-3 w-80 bg-white border border-gray-100 rounded-[32px] shadow-2xl z-50 p-8 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-4 border-b border-gray-50">
                          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <Building2 className="h-6 w-6" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-gray-900 leading-tight">{request.clientName}</h5>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ref: {request.id}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Status</span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(request.status)}`}>
                              {getStatusIcon(request.status)}
                              {request.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Submitted By</span>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                              <User className="h-3 w-3 text-gray-400" />
                              {request.submittedBy}
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Service</span>
                            <span className="text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg">
                              {request.service.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Date</span>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              {new Date(request.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button className="w-full justify-center text-xs py-3 rounded-xl shadow-md">
                            Generate Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-lg border border-green-100">
                COMPLETED FORM
              </span>
            </div>

            <div className="space-y-6">
              {mockQuestions.map((q, idx) => (
                <div key={idx} className="group p-6 rounded-3xl bg-gray-50/50 border border-gray-100 hover:border-primary/20 hover:bg-white transition-all duration-300">
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                       Question {idx + 1}
                       {q.required && <span className="text-red-400">*</span>}
                    </span>
                    <h5 className="text-sm font-bold text-gray-900 leading-tight">{q.question}</h5>
                    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                       <p className="text-sm text-gray-700 font-medium italic leading-relaxed">
                         {answers[q.question] || <span className="text-gray-300">Not provided by client</span>}
                       </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ShadowCard>
      </div>
    </div>
  );
};

export default ViewServiceRequest;
