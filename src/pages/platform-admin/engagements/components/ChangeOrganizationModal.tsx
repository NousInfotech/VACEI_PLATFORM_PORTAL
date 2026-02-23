import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Building2, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { apiGet, apiPatch } from '../../../../config/base';
import { endPoints } from '../../../../config/endPoint';

interface ChangeOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  engagementId: string;
  rejectedOrgIds: string[];
  serviceCategory: string;
}

interface Organization {
  id: string;
  name: string;
  availableServices: string[];
  customServiceCycles?: { id: string; isActive: boolean }[];
}

export const ChangeOrganizationModal: React.FC<ChangeOrganizationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  engagementId,
  rejectedOrgIds,
  serviceCategory,
}) => {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: orgsData, isLoading: isLoadingOrgs } = useQuery<{ data: Organization[] }>({
    queryKey: ['organizations-list'],
    queryFn: () => apiGet<{ data: Organization[] }>(endPoints.ORGANIZATION.GET_ALL),
    enabled: isOpen,
  });

  const organizations = orgsData?.data || [];

  // Filter organizations that offer the required service
  const eligibleOrgs = organizations.filter(org => {
    return org.availableServices?.includes(serviceCategory);
  });

  const handleUpdate = async () => {
    if (!selectedOrgId) {
      alert('Please select a new organization');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPatch(endPoints.ENGAGEMENT.UPDATE_ORGANIZATION(engagementId), {
        organizationId: selectedOrgId,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update engagement organization:', err);
      alert('Failed to update organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-10 py-8 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Change Organization</h3>
              <p className="text-sm text-gray-500 font-medium">Reassign this engagement to a different firm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                Select New Service Provider
                <Info size={14} className="text-gray-300" />
              </h4>
              <span className="text-[10px] font-bold text-gray-400 italic">
                {eligibleOrgs.length} eligible firms found
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 pr-2">
              {isLoadingOrgs ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
                ))
              ) : eligibleOrgs.length > 0 ? (eligibleOrgs.map((org) => {
                const isRejected = rejectedOrgIds.includes(org.id);
                return (
                  <button
                    key={org.id}
                    onClick={() => setSelectedOrgId(org.id)}
                    disabled={isRejected}
                    className={`group flex items-center justify-between p-5 rounded-3xl border-2 transition-all text-left ${
                      selectedOrgId === org.id
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                        : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'
                    } ${isRejected ? 'opacity-50 cursor-not-allowed bg-red-50/30' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl transition-all ${
                        selectedOrgId === org.id 
                          ? 'bg-primary text-white' 
                          : isRejected 
                            ? 'bg-red-100 text-red-400'
                            : 'bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'
                      }`}>
                        <Building2 size={24} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold transition-all ${selectedOrgId === org.id ? 'text-primary' : 'text-gray-900'}`}>
                          {org.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {isRejected ? (
                            <>
                              <X size={12} className="text-red-500" />
                              <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Rejected Provider</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={12} className="text-green-500" />
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Eligible Provider</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {!isRejected && (
                      <ChevronRight size={18} className={`transition-all ${selectedOrgId === org.id ? 'text-primary translate-x-1' : 'text-gray-300 group-hover:text-primary'}`} />
                    )}
                  </button>
                );
              })) : (
                <div className="p-10 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                  <p className="text-sm font-bold text-gray-400">No other organizations found providing this service.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-10 py-8 bg-gray-50/30 border-t border-gray-50 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border-gray-200 text-gray-500 hover:bg-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isSubmitting || !selectedOrgId}
            className="px-10 py-2.5 rounded-xl bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Update Organization'}
          </Button>
        </div>
      </div>
    </div>
  );
};
