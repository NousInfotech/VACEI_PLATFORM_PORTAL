import React from 'react';
import { FileText } from 'lucide-react';
import { Skeleton } from '../../../../ui/Skeleton';
import { TemplateCard } from './TemplateCard';
import type { ServiceRequestTemplate } from '../../../../types/service-request-template';

interface TemplateListProps {
  loading: boolean;
  templates: ServiceRequestTemplate[];
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;
  onEdit: (template: ServiceRequestTemplate) => void;
  onView: (template: ServiceRequestTemplate) => void;
  onToggleActive: (template: ServiceRequestTemplate) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  loading,
  templates,
  activeDropdownId,
  setActiveDropdownId,
  onEdit,
  onView,
  onToggleActive,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-5 border border-gray-100 bg-white rounded-[28px] grid grid-cols-12 items-center gap-4 animate-pulse">
            <div className="col-span-4 flex items-center gap-5">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="col-span-3 space-y-2">
              <Skeleton className="h-2 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>
            <div className="col-span-3 flex justify-end">
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="col-span-full py-32 text-center">
        <div className="inline-flex p-10 bg-gray-50 rounded-[40px] text-gray-200">
          <FileText className="h-20 w-20" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mt-8">No Templates Found</h2>
        <p className="text-gray-500 max-w-sm mx-auto mt-4">
          Start by creating a service request template to define form fields for your users.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          activeDropdownId={activeDropdownId}
          setActiveDropdownId={setActiveDropdownId}
          onEdit={onEdit}
          onView={onView}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
};
