import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { ShadowCard } from '../../../../ui/ShadowCard';

export type EngagementStatus = 
  | 'DRAFT'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'REVISION'
  | 'COMPLETED'
  | 'TERMINATED'
  | 'CANCELLED';

interface EngagementStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: EngagementStatus, reason?: string) => void;
  currentStatus: EngagementStatus;
  userRole: string;
  loading?: boolean;
}

const DEFAULT_MESSAGES: Record<string, string> = {
  DRAFT: 'Moving back to draft status.',
  ASSIGNED: 'Engagement has been assigned to the provider.',
  ACCEPTED: 'The service provider has accepted the engagement.',
  ACTIVE: 'The engagement is now active.',
  IN_PROGRESS: 'Work is currently in progress.',
  IN_REVIEW: 'Deliverables are under review.',
  REVISION: 'Revisions have been requested.',
  COMPLETED: 'The engagement has been successfully completed.',
};

const REASON_REQUIRED_STATUSES = ['REJECTED', 'TERMINATED', 'CANCELLED'];

export const EngagementStatusModal: React.FC<EngagementStatusModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  userRole,
  loading,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<EngagementStatus | ''>('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const isPlatformAdmin = userRole === 'PLATFORM_ADMIN';
  
  // Platform Admin only allows ASSIGNED and TERMINATED
  const availableStatuses: EngagementStatus[] = isPlatformAdmin 
    ? ['ASSIGNED', 'TERMINATED']
    : ['DRAFT', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'IN_PROGRESS', 'IN_REVIEW', 'REVISION', 'COMPLETED', 'CANCELLED'];

  const handleConfirm = () => {
    if (!selectedStatus) return;
    const finalReason = REASON_REQUIRED_STATUSES.includes(selectedStatus) 
      ? reason 
      : DEFAULT_MESSAGES[selectedStatus] || `Status updated to ${selectedStatus}`;
    
    onConfirm(selectedStatus as EngagementStatus, finalReason);
  };

  const isReasonRequired = !!selectedStatus && REASON_REQUIRED_STATUSES.includes(selectedStatus);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <ShadowCard className="w-full max-w-lg bg-white p-0 rounded-[40px] shadow-2xl relative overflow-hidden border border-gray-100">
        <div className="p-10 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-[30px] bg-primary/5 text-primary flex items-center justify-center shadow-xl border border-primary/10">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Update Engagement Status</h3>
              <p className="text-gray-500 font-medium mt-2">Current Status: <span className="text-primary font-bold">{currentStatus}</span></p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Status</label>
              <div className="grid grid-cols-2 gap-2">
                {availableStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border-2 transition-all ${
                      selectedStatus === status 
                        ? 'bg-primary/5 border-primary text-primary' 
                        : 'border-gray-50 text-gray-400 hover:border-gray-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {isReasonRequired && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Reason Required</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a specific reason..."
                  className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-red-500/20 focus:ring-4 focus:ring-red-500/5 outline-none transition-all font-medium min-h-[100px] resize-none"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border-gray-100 text-gray-400 hover:bg-gray-50 font-bold"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={loading || !selectedStatus || (isReasonRequired && !reason.trim())}
              className="flex-1 py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Update Status'}
            </Button>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
        >
          <X size={20} />
        </button>
      </ShadowCard>
    </div>
  );
};
