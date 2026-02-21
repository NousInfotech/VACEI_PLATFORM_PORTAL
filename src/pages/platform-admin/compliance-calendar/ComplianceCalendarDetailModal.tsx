import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { ShadowCard } from '../../../ui/ShadowCard';
import type { ComplianceCalendar } from '../../../types/compliance-calendar';

interface ComplianceCalendarDetailModalProps {
  item: ComplianceCalendar;
  onClose: () => void;
  serviceCategories: { value: string; label: string }[];
  frequencies: { value: string; label: string }[];
  formatDate: (iso: string) => string;
}

export const ComplianceCalendarDetailModal: React.FC<ComplianceCalendarDetailModalProps> = ({
  item,
  onClose,
  serviceCategories,
  frequencies,
  formatDate,
}) => {
  const categoryLabel = serviceCategories.find((s) => s.value === item.serviceCategory)?.label ?? item.serviceCategory;
  const frequencyLabel = frequencies.find((f) => f.value === item.frequency)?.label ?? item.frequency;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <ShadowCard className="w-full max-w-lg bg-white rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Compliance calendar entry</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Title</p>
            <p className="font-medium text-gray-900 mt-0.5">{item.title}</p>
          </div>
          {item.description && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Description</p>
              <p className="text-sm text-gray-700 mt-0.5">{item.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Category</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{categoryLabel}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Frequency</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{frequencyLabel}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Start date</p>
              <p className="text-sm text-gray-900 mt-0.5">{formatDate(item.startDate)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Due date</p>
              <p className="text-sm text-primary font-medium mt-0.5">{formatDate(item.dueDate)}</p>
            </div>
          </div>
          {item.type === 'COMPANY' && item.company && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Company</p>
              <p className="text-sm text-gray-900 mt-0.5">{item.company.name}</p>
            </div>
          )}
          {item.createdBy?.user && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Created by</p>
              <p className="text-sm text-gray-900 mt-0.5">
                {item.createdBy.user.firstName} {item.createdBy.user.lastName}
              </p>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </ShadowCard>
    </div>
  );
};
