import React from 'react';
import { X, FileText } from 'lucide-react';
import { TemplateForm } from './TemplateForm';
import type { CreateTemplateDto, ServiceRequestTemplate } from '../../../types/service-request-template';

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTemplateDto) => void;
  loading?: boolean;
  initialData?: ServiceRequestTemplate | null;
  isEdit?: boolean;
}

export const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialData,
  isEdit = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-2xl flex flex-col animate-in zoom-in slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                {isEdit ? 'Update Template' : 'Create New Template'}
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                {isEdit ? 'Modify form structure and settings' : 'Define form fields for a new service section'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <TemplateForm 
            onSubmit={onSubmit}
            loading={loading}
            initialData={initialData || undefined}
            isEdit={isEdit}
          />
        </div>
      </div>
    </div>
  );
};
