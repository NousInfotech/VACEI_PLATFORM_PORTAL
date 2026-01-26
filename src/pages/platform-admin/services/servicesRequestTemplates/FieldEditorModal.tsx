import React, { useState } from 'react';
import { X, Save, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '../../../../ui/Button';
import { ShadowCard } from '../../../../ui/ShadowCard';
import type { FormField, InputType } from '../../../../types/service-request-template';
import { useTemplates } from '../../context/ServicesContext';
import { Dropdown } from '../../../common/Dropdown';
import PillTab from '../../../common/PillTab';

interface FieldEditorModalProps {
  field: FormField;
  onSave: (updatedField: FormField) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const FieldEditorModal: React.FC<FieldEditorModalProps> = ({
  field: initialField,
  onSave,
  onClose,
  isLoading = false,
}) => {
  const { inputTypeIcons, inputTypeItems, requiredTabs } = useTemplates();
  const [field, setField] = useState<FormField>({ ...initialField });

  const updateField = (updates: Partial<FormField>) => {
    setField(prev => ({ ...prev, ...updates }));
  };

  const handleAddOption = () => {
    const options = field.options || [];
    updateField({ options: [...options, ''] });
  };

  const handleUpdateOption = (index: number, value: string) => {
    if (field.options) {
      const newOptions = [...field.options];
      newOptions[index] = value;
      updateField({ options: newOptions });
    }
  };

  const handleRemoveOption = (index: number) => {
    if (field.options) {
      updateField({ options: field.options.filter((_, i) => i !== index) });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(field);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <ShadowCard className="w-full max-w-xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Save className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Edit Field</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Question Text</label>
              <div className="w-40">
                <PillTab
                  tabs={requiredTabs}
                  activeTab={field.required ? 'required' : 'optional'}
                  onTabChange={(id: string) => updateField({ required: id === 'required' })}
                  className="scale-90 origin-right"
                />
              </div>
            </div>
            <input
              type="text"
              value={field.question}
              onChange={(e) => updateField({ question: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-primary/20 rounded-xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-sm"
              placeholder="Enter your question..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Input Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Input Type</label>
              <Dropdown
                fullWidth
                items={inputTypeItems((type: InputType) => updateField({ 
                  input_type: type, 
                  options: ['radio', 'checkbox'].includes(type) ? (field.options?.length ? field.options : ['New Option']) : undefined 
                }))}
                trigger={
                  <button
                    type="button"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-sm font-medium text-gray-700"
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

            {/* Placeholder */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Placeholder (Optional)</label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => updateField({ placeholder: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/5 outline-none text-sm font-medium"
                placeholder="Hint text..."
              />
            </div>
          </div>

          {/* Options (for radio/checkbox) */}
          {['radio', 'checkbox'].includes(field.input_type) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Options</label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-primary font-bold text-[10px] uppercase tracking-widest hover:underline"
                >
                  + Add Option
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {field.options?.map((option, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleUpdateOption(idx, e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium"
                      placeholder={`Option ${idx + 1}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="rounded-xl px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl px-10 font-bold min-w-[140px]">
              {isLoading ? 'Saving...' : 'Update Field'}
            </Button>
          </div>
        </form>
      </ShadowCard>
    </div>
  );
};
