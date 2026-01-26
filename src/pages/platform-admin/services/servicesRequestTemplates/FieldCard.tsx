import React, { useState } from 'react';
import { Trash2, ChevronDown, Plus, Edit2, Check, X, ChevronUp } from 'lucide-react';
import { ShadowCard } from '../../../../ui/ShadowCard';
import Badge from '../../../common/Badge';
import { Dropdown } from '../../../common/Dropdown';
import PillTab from '../../../common/PillTab';
import type { FormField, InputType } from '../../../../types/service-request-template';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';

interface FieldCardProps {
  field: FormField;
  index: number;
  isEdit: boolean;
  isGlobalEdit: boolean;
  onUpdate: (updates: Partial<FormField>) => void;
  onRemove: () => void;
  onEditStart?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  isPending?: boolean;
  inputTypeIcons: Record<InputType, React.ComponentType<{ className?: string }>>;
  inputTypeItems: (onChange: (type: InputType) => void) => { id: string; label: string; icon: React.ReactNode; onClick: () => void }[];
  requiredTabs: { id: string; label: string }[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({
  field,
  index,
  isEdit,
  isGlobalEdit,
  onUpdate,
  onRemove,
  onEditStart,
  onCancel,
  onSave,
  isPending,
  inputTypeIcons,
  inputTypeItems,
  requiredTabs,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteInitial = () => {
    if (!field.question?.trim()) {
      onRemove();
    } else {
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    onRemove();
  };

  if (!isEdit) {
    return (
      <ShadowCard className="p-6 border border-gray-300 group transition-all relative hover:shadow-md">
        <div className="flex flex-col gap-4">
          <div 
            className="flex items-start justify-between cursor-pointer select-none"
            onClick={onToggleCollapse}
          >
            <div className="flex items-center gap-3">
              <Badge variant="primary">Field {index + 1}</Badge>
              {field.required ? (
                <Badge variant="danger">Required</Badge>
              ) : (
                <Badge variant="gray">Optional</Badge>
              )}
              <h4 className="text-sm font-bold text-gray-700 truncate max-w-[200px] lg:max-w-md">
                {isCollapsed ? field.question : ''}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              {!isGlobalEdit && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditStart?.();
                  }}
                  className="p-1.5 opacity-0 group-hover:opacity-100 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-primary transition-all shadow-sm"
                  title="Edit single field"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
              <button 
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-all shadow-sm border border-gray-100"
                title={isCollapsed ? 'Expand Field' : 'Collapse Field'}
              >
                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6 pt-4 border-t border-gray-50">
              <div className="flex flex-col gap-1 items-start">
                <Badge variant="label">Question</Badge>
                <h4 className="text-md font-bold text-gray-900">{field.question}</h4>
              </div>
              <div className="flex flex-col gap-1 items-start">
                <Badge variant="label">Input Type</Badge>
                <span className="font-bold uppercase text-gray-900 text-sm tracking-tight">{field.input_type.replace(/_/g, ' ')}</span>
              </div>
              {field.placeholder && (
                <div className="flex flex-col gap-1 items-start">
                  <Badge variant="label">Placeholder</Badge>
                  <span className="font-bold text-gray-900 text-sm">{field.placeholder}</span>
                </div>
              )}
              {field.options && field.options.length > 0 && (
                <div className="flex flex-col gap-3 items-start w-full">
                  <Badge variant="label">Options List</Badge>
                  <div className="flex flex-wrap gap-2.5 w-full">
                    {field.options.map((opt: string, optIdx: number) => (
                      <div 
                        key={optIdx} 
                        className="px-4 py-2 bg-white border border-gray-100 rounded-[14px] shadow-sm flex items-center gap-3 group/opt"
                      >
                        <div className="flex items-center justify-center p-0.5 rounded-full bg-gray-100">
                          <div className="h-1.5 w-1.5 rounded-full bg-black" />
                        </div>
                        <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">
                          {opt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ShadowCard>
    );
  }

  return (
    <>
        <ShadowCard className="p-8 border border-primary ring-4 ring-primary/5 bg-white z-30 transition-all relative focus-within:z-40">
        <div className="flex gap-8 items-start">
            <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                <Badge variant="primary">{isGlobalEdit ? `Editing Field ${index + 1}` : 'Editing Field'}</Badge>
                <div className="w-40 scale-90 origin-left">
                    <PillTab
                    tabs={requiredTabs}
                    activeTab={field.required ? 'required' : 'optional'}
                    onTabChange={(id: string) => onUpdate({ required: id === 'required' })}
                    />
                </div>
                </div>
                <div className="flex gap-2">
                {!isGlobalEdit ? (
                    <>
                    <button 
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                        title="Cancel"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={onSave}
                        disabled={isPending}
                        className="p-2 bg-primary text-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 px-4 disabled:opacity-50"
                    >
                        <Check className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">{isPending ? 'Saving...' : 'Save'}</span>
                    </button>
                    </>
                ) : (
                    <button
                    onClick={handleDeleteInitial}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all"
                    title="Remove field"
                    >
                    <Trash2 className="h-5 w-5" />
                    </button>
                )}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex gap-1.5 flex-col items-start">
                <Badge variant="label" className="ml-1">Question Text</Badge>
                <input
                    type="text"
                    value={field.question}
                    onChange={(e) => onUpdate({ question: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-sm text-gray-700"
                    placeholder="Enter field question..."
                />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-1.5 flex-col items-start w-full">
                    <Badge variant="label" className="ml-1">Input Type</Badge>
                    <Dropdown
                    fullWidth
                    className="w-full"
                    items={inputTypeItems((type: InputType) => onUpdate({ 
                        input_type: type, 
                        options: ['radio', 'checkbox'].includes(type) ? (field.options?.length ? field.options : ['Option 1']) : undefined 
                    }))}
                    trigger={
                        <button
                        type="button"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-sm font-medium text-gray-700 hover:border-primary/20 transition-all focus:ring-4 focus:ring-primary/5 outline-none"
                        >
                        <div className="flex items-center gap-2">
                            {(() => {
                            const Icon = inputTypeIcons[field.input_type];
                            return <Icon className="h-4 w-4 text-primary" />;
                            })()}
                            <span className="uppercase">{field.input_type.replace('_', ' ')}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                    }
                    />
                </div>

                <div className="flex gap-1.5 flex-col items-start w-full">
                    <Badge variant="label" className="ml-1">Placeholder (Optional)</Badge>
                    <input
                    type="text"
                    value={field.placeholder || ''}
                    onChange={(e) => onUpdate({ placeholder: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-sm text-gray-700"
                    placeholder="e.g. Enter hint text here..."
                    />
                </div>

                {field.input_type === 'text' && (
                    <div className="flex gap-1.5 flex-col items-start w-full">
                    <Badge variant="label" className="ml-1">Max Length (Optional)</Badge>
                    <input
                        type="number"
                        value={field.maxLength || ''}
                        onChange={(e) => onUpdate({ maxLength: parseInt(e.target.value) || undefined })}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-sm text-gray-700"
                        placeholder="No limit"
                    />
                    </div>
                )}
                </div>

                {['radio', 'checkbox'].includes(field.input_type) && (
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-6">
                    <div className="flex items-center justify-between">
                    <Badge variant="label">Options List</Badge>
                    <button
                        type="button"
                        onClick={() => onUpdate({ options: [...(field.options || []), ''] })}
                        className="text-primary font-bold text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                        <Plus className="h-3 w-3" />
                        Add Option
                    </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {field.options?.map((option: string, optIdx: number) => (
                        <div key={optIdx} className="flex gap-2">
                        <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                            const newOptions = [...(field.options || [])];
                            newOptions[optIdx] = e.target.value;
                            onUpdate({ options: newOptions });
                            }}
                            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                            placeholder={`Option ${optIdx + 1}`}
                        />
                        <button
                            type="button"
                            onClick={() => {
                            const newOptions = (field.options || []).filter((_: string, i: number) => i !== optIdx);
                            onUpdate({ options: newOptions });
                            }}
                            className="p-2.5 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-xl transition-colors shadow-sm"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                        </div>
                    ))}
                    </div>
                </div>
                )}
            </div>
            </div>
        </div>
        </ShadowCard>

        <DeleteConfirmModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteConfirm}
            mode="simple"
            title="Remove Form Field"
            itemName={`Field ${index + 1}`}
            description={
                <span>Are you sure you want to remove the field <span className="font-bold text-gray-900">"{field.question || 'Untitled Field'}"</span>? This action cannot be undone.</span>
            }
        />
    </>
  );
};
