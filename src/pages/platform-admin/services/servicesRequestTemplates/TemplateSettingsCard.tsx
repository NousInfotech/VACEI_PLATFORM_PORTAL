import React from 'react';
import { ChevronDown, Settings2 } from 'lucide-react';
import { ShadowCard } from '../../../../ui/ShadowCard';
import Badge from '../../../common/Badge';
import { Dropdown } from '../../../common/Dropdown';
import type { CreateTemplateDto, ServiceRequestTemplate } from '../../../../types/service-request-template';
import type { DropdownItem } from '../../../common/Dropdown';

interface TemplateSettingsCardProps {
  formData: CreateTemplateDto;
  template?: ServiceRequestTemplate;
  isEdit: boolean;
  onUpdate: (updates: Partial<CreateTemplateDto>) => void;
  serviceOptions: DropdownItem[];
  hideMetadata?: boolean;
}

export const TemplateSettingsCard: React.FC<TemplateSettingsCardProps> = ({
  formData,
  template,
  isEdit,
  onUpdate,
  serviceOptions,
  hideMetadata = false,
}) => {
  const renderMetadata = () => {
    if (!template || hideMetadata) return null;
    return (
      <div className="space-y-6 pt-6 border-t border-gray-100 mt-6">
        <div className="flex justify-between items-center py-3 border-b border-gray-50">
          <span className="text-sm font-medium text-gray-500">Version</span>
          <span className="font-bold text-gray-900">v{template.version}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-50">
          <span className="text-sm font-medium text-gray-500">Created By</span>
          <span className="font-bold text-gray-900">
            {template.creator ? `${template.creator.firstName} ${template.creator.lastName}` : 'System'}
          </span>
        </div>
        <div className="flex justify-between items-center py-3">
          <span className="text-sm font-medium text-gray-500">Last Updated</span>
          <span className="font-bold text-gray-900">{new Date(template.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    );
  };

  if (!isEdit) {
    return (
      <ShadowCard className="p-8 border-none shadow-sm bg-white rounded-[40px]">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Template Info
        </h3>
        <div className="space-y-6">
          <div className="flex justify-between items-center py-3 border-b border-gray-50">
            <span className="text-sm font-medium text-gray-500">Status</span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
              formData.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
            }`}>
              {formData.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-50">
            <span className="text-sm font-medium text-gray-500">Type</span>
            <span className="font-bold text-gray-900">{formData.type}</span>
          </div>
          {formData.type === 'SERVICE' && formData.service && (
            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-gray-500">Service</span>
              <span className="font-bold text-gray-900 uppercase">
                {formData.service.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>
        {renderMetadata()}
      </ShadowCard>
    );
  }

  return (
    <ShadowCard className="p-8 border border-gray-200 relative focus-within:z-40 mb-6 transition-all duration-300">
      <div className="space-y-8">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Template Settings
        </h3>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col gap-3 items-start">
            <Badge variant="label">Template Type</Badge>
            <div className="flex gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-[20px] w-fit">
              {(['GENERAL', 'SERVICE'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onUpdate({ type: t, service: t === 'GENERAL' ? null : formData.service })}
                  className={`px-8 py-2.5 rounded-[14px] text-xs font-bold transition-all ${
                    formData.type === t 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-gray-500 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {formData.type === 'SERVICE' && (
            <div className="flex flex-col gap-3 items-start flex-1 min-w-[300px]">
              <Badge variant="label">Target Service</Badge>
              <div className="w-full">
                <Dropdown
                  fullWidth
                  className="w-full"
                  items={serviceOptions.map(opt => ({
                    ...opt,
                    onClick: () => onUpdate({ service: opt.id as string | null })
                  }))}
                  trigger={
                    <button
                      type="button"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-sm font-medium text-gray-700 hover:border-primary/20 transition-all focus:ring-4 focus:ring-primary/5 outline-none"
                    >
                      <span className="truncate">{formData.service ? formData.service.replace(/_/g, ' ') : 'Select Service...'}</span>
                      <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 ml-2" />
                    </button>
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {renderMetadata()}
    </ShadowCard>
  );
};
