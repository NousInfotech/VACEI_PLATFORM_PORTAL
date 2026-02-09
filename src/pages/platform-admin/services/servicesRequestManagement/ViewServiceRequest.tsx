import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2,
  Calendar,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  FileText
} from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { ShadowCard } from '../../../../ui/ShadowCard';
import PageHeader from '../../../common/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { apiPatch, apiGet } from '../../../../config/base';
import { endPoints } from '../../../../config/endPoint';
import { Skeleton } from '../../../../ui/Skeleton';
import type { 
  ServiceRequest, 
  DetailEntry, 
  ServiceRequestStatus 
} from '../../../../types/service-request-template';
import { StatusConfirmModal, StatusSuccessModal } from './components/StatusUpdateModals';
import CreateEngagementModal from './components/CreateEngagementModal';
import { mockRequests as mockServiceRequests } from './serviceMockData';

const USE_MOCK_DATA = false;

const ViewServiceRequest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ 
    isOpen: boolean; 
    status: ServiceRequestStatus | null; 
    title: string;
    message: string;
    showReasonInput?: boolean;
    reason?: string;
  }>({
    isOpen: false,
    status: null,
    title: '',
    message: '',
  });
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });
  const [isEngagementModalOpen, setIsEngagementModalOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: request, isLoading, refetch } = useQuery<ServiceRequest>({
    queryKey: ['service-request', id],
    queryFn: () => {
        if (USE_MOCK_DATA) {
            const mock = mockServiceRequests.find(sr => sr.id === id);
            return Promise.resolve(mock ?? mockServiceRequests[0]);
        }
        return apiGet<{ success: boolean; data: ServiceRequest }>(endPoints.SERVICE_REQUEST.GET_BY_ID(id!)).then(res => res.data);
    },
    enabled: !!id,
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    const { status: newStatus, reason } = confirmModal;
    if (!id || !newStatus) return;
    
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    setIsUpdating(true);
    try {
      if (!USE_MOCK_DATA) {
        const payload: { status: ServiceRequestStatus; reason?: string } = { status: newStatus };
        if (reason && reason.trim()) {
          payload.reason = reason;
        }
        await apiPatch(endPoints.SERVICE_REQUEST.UPDATE_STATUS(id), payload);
      }
      
      setSuccessModal({
        isOpen: true,
        title: 'Success!',
        message: `The request has been ${newStatus.toLowerCase().replace(/_/g, ' ')} successfully.`
      });
      
      if (!USE_MOCK_DATA) {
        refetch();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const openConfirmation = (status: ServiceRequestStatus, title: string, message: string, showReasonInput: boolean = false) => {
    setConfirmModal({
      isOpen: true,
      status,
      title,
      message,
      showReasonInput,
      reason: ''
    });
  };

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

  if (isLoading) {
    return (
      <div className="space-y-6 p-8" ref={containerRef}>
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <ShadowCard className="p-8 space-y-8 border border-gray-100 bg-white rounded-[40px]">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-3xl" />
            ))}
          </div>
        </ShadowCard>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="py-20 text-center space-y-4" ref={containerRef}>
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
      case 'DRAFT': return 'bg-gray-50 text-gray-600 border-gray-100';
      case 'SUBMITTED':
      case 'IN_REVIEW': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'APPROVED': return 'bg-green-50 text-green-600 border-green-100';
      case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'IN_REVIEW': return <Clock className="h-4 w-4" />;
      case 'APPROVED': return <CheckCircle2 className="h-4 w-4" />;
      case 'REJECTED': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const allDetails = [
    ...(request.generalDetails || []),
    ...(request.serviceDetails || [])
  ];

  const renderActions = (position: 'top' | 'bottom') => {
    if (!request) return null;
    
    const isTop = position === 'top';
    const commonBtnClass = "font-bold transition-all";
    const topBtnClass = "px-6 py-2.5 text-xs rounded-xl shadow-md";
    const bottomBtnClass = "px-10 py-3 rounded-2xl shadow-xl";

    if (request.status === 'SUBMITTED') {
      return (
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className={`${commonBtnClass} ${isTop ? topBtnClass : bottomBtnClass} border-gray-200 text-gray-600 hover:bg-gray-50`}
            onClick={() => openConfirmation('IN_REVIEW', 'Move to Review', 'Are you sure you want to move this request to the review stage?')}
            disabled={isUpdating}
          >
            In Review
          </Button>
          <Button 
            className={`${commonBtnClass} ${isTop ? topBtnClass : bottomBtnClass} shadow-red-500/20 bg-red-600 hover:bg-red-700 text-white border-none`}
            onClick={() => openConfirmation('REJECTED', 'Reject Request', 'Please provide a reason for rejecting this request.', true)}
            disabled={isUpdating}
          >
            Reject
          </Button>
          <Button 
            className={`${commonBtnClass} ${isTop ? topBtnClass : bottomBtnClass} shadow-primary/20 bg-primary hover:bg-primary-dark`}
            onClick={() => openConfirmation('APPROVED', 'Approve Request', 'Are you sure you want to approve this request?')}
            disabled={isUpdating}
          >
            Approve
          </Button>
        </div>
      );
    }

    if (request.status === 'IN_REVIEW') {
      return (
        <div className="flex items-center gap-3">
          <Button 
            className={`${commonBtnClass} ${isTop ? topBtnClass : bottomBtnClass} shadow-red-500/20 bg-red-600 hover:bg-red-700 text-white border-none`}
            onClick={() => openConfirmation('REJECTED', 'Reject Request', 'Please provide a reason for rejecting this request.', true)}
            disabled={isUpdating}
          >
            Reject
          </Button>
          <Button 
            className={`${commonBtnClass} ${isTop ? topBtnClass : bottomBtnClass} shadow-primary/20 bg-primary hover:bg-primary-dark`}
            onClick={() => openConfirmation('APPROVED', 'Approve Request', 'Are you sure you want to approve this request?')}
            disabled={isUpdating}
          >
            Approve
          </Button>
        </div>
      );
    }

    if (request.status === 'APPROVED') {
      return (
        <div className="flex items-center gap-3">
          {isTop && (
            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-lg border border-green-100 uppercase">
              Approved
            </span>
          )}
          <Button 
            onClick={() => setIsEngagementModalOpen(true)}
            size={isTop ? 'default' : 'lg'}
            className={`${commonBtnClass} ${isTop ? 'rounded-xl' : 'rounded-2xl px-10'}`}
          >
            Create Engagement
          </Button>
        </div>
      );
    }

    if (request.status === 'REJECTED') {
      return (
        <div className={`${commonBtnClass} ${isTop ? 'px-6 py-2 text-xs rounded-xl' : 'px-10 py-3 rounded-2xl'} bg-gray-100 text-gray-400 border border-gray-200`}>
          Request Rejected
        </div>
      );
    }

    // Default status badge fallback
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(request.status)}`}>
        {getStatusIcon(request.status)}
        {request.status.replace(/_/g, ' ')} Submission
      </span>
    );
  };

  return (
    <div className="space-y-6" ref={containerRef}>
      <PageHeader 
        title="View Service Submission" 
        icon={Inbox}
        description={`Reviewing submission for ${request.company?.name || request.clientName || 'Unknown Entity'}`}
        showBack={true}
        backUrl="/dashboard/service-request-management"
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
                            <h5 className="text-sm font-bold text-gray-900 leading-tight">{request.company?.name}</h5>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ref: {request.id.split('-')[0]}</p>
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

                          {/* <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Client ID</span>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                              <User className="h-3 w-3 text-gray-400" />
                              {request.clientId.split('-')[0]}
                            </div>
                          </div> */}

                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Service</span>
                            <span className="text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg">
                              {request.service.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Created At</span>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              {new Date(request.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
{/* 
                        <div className="pt-2">
                          <Button className="w-full justify-center text-xs py-3 rounded-xl shadow-md">
                            Generate Report
                          </Button>
                        </div> */}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {renderActions('top')}
            </div>

            <div className="space-y-12 py-4">
              {allDetails.length > 0 ? allDetails.map((detail: DetailEntry, idx) => (
                <div key={idx} className="flex items-start gap-5 pb-3 group border-b  border-gray-300 last:border-0 last:pb-0">
                  {/* Numbering */}
                  <div className="shrink-0 pt-1">
                    <span className="text-xl font-bold tabular-nums">
                      {(idx + 1).toString().padStart(2, '0')}.
                    </span>
                  </div>

                  <div className="space-y-4 flex-1">
                    <h5 className="text-xl font-bold text-gray-900 leading-tight">
                      {detail.question}
                    </h5>
                    <div className="relative">
                      <p className="text-[17px] text-gray-500 font-medium leading-relaxed max-w-4xl">
                        {(() => {
                          if (detail.answer === undefined || detail.answer === null || detail.answer === '') {
                            return <span className="text-gray-300 italic font-normal">No response provided</span>;
                          }

                          const formatValue = (val: string | { month?: string; year?: string } | null | undefined) => {
                            if (!val) return '';
                            if (typeof val === 'string') return val;
                            if (typeof val === 'object' && val !== null) {
                              if (val.month && val.year) return `${val.month} ${val.year}`;
                              return JSON.stringify(val);
                            }
                            return String(val);
                          };

                          if (Array.isArray(detail.answer)) {
                            return detail.answer.join(', ');
                          }

                          if (typeof detail.answer === 'object' && detail.answer !== null) {
                            interface LocalDateValue {
                              month?: string;
                              year?: string;
                            }
                            const ans = detail.answer as { 
                              start?: LocalDateValue; 
                              end?: LocalDateValue; 
                              month?: string; 
                              year?: string 
                            };
                            if (ans.start || ans.end) {
                              return (
                                <span className="flex items-center gap-2">
                                  <span className="text-primary/60 font-bold uppercase text-[10px] tracking-widest">From</span>
                                  {formatValue(ans.start)}
                                  <span className="text-primary/60 font-bold uppercase text-[10px] tracking-widest ml-2">To</span>
                                  {formatValue(ans.end)}
                                </span>
                              );
                            }
                            if (ans.month && ans.year) {
                              return `${ans.month} ${ans.year}`;
                            }
                            return JSON.stringify(ans);
                          }

                          return String(detail.answer);
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center opacity-40">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-sm font-medium text-gray-500">No form responses available for this request.</p>
                </div>
              )}
            </div>
          </div>
        </ShadowCard>

        {/* Supporting Documents Section - Hide for DRAFT or if no documents */}
        {request.status !== 'DRAFT' && request.submittedDocuments && request.submittedDocuments.length > 0 && (
          <ShadowCard className="p-8 border border-gray-100 bg-white rounded-[40px] w-full mt-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h4 className="text-lg font-bold text-gray-900">Supporting Documents</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(request.submittedDocuments ?? []).map((doc) => (
                  <a 
                    key={doc.id} 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100 hover:border-primary/20 hover:bg-white transition-all group"
                  >
                    <div className="p-3 bg-white rounded-2xl text-primary shadow-sm group-hover:shadow-md transition-all">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{doc.file_name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Document Attachment</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </ShadowCard>
        )}

        <div className="flex items-center justify-end mt-10 mb-10">
          {renderActions('bottom')}
        </div>
      </div>

      {/* Confirmation Modal */}
      <StatusConfirmModal 
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleStatusUpdate}
        onReasonChange={(val) => setConfirmModal(prev => ({ ...prev, reason: val }))}
        loading={isUpdating}
      />

      {/* Success Modal */}
      <StatusSuccessModal
        {...successModal}
        onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
      />

      {request && (
        <CreateEngagementModal
          isOpen={isEngagementModalOpen}
          onClose={() => {
            setIsEngagementModalOpen(false);
            refetch();
          }}
          companyId={request.companyId}
          serviceCategory={request.service}
          companyName={request.company?.name || request.clientName || 'Unknown Entity'}
          serviceRequestId={request.id}
        />
      )}
    </div>
  );
};

export default ViewServiceRequest;
