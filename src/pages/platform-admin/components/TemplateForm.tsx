import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  ChevronDown
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import { ShadowCard } from '../../../ui/ShadowCard';
import type { CreateTemplateDto, FormField } from '../../../types/service-request-template';
import { Dropdown } from '../../common/Dropdown';
import PillTab from '../../common/PillTab';
import { useTemplates } from '../context/ServicesContext';
import Badge from '../../common/Badge';

interface TemplateFormProps {
  onSubmit: (data: CreateTemplateDto) => void;
  loading?: boolean;
  initialData?: Partial<CreateTemplateDto>;
  isEdit?: boolean;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  onSubmit,
  loading = false,
  initialData,
  isEdit = false,
}) => {
  const { serviceOptions: contextServiceOptions, inputTypeIcons, inputTypeItems, requiredTabs } = useTemplates();
  const [formData, setFormData] = useState<CreateTemplateDto>({
    service: initialData?.service || null,
    type: initialData?.type || 'GENERAL',
    formFields: initialData?.formFields || [
      { question: '', input_type: 'text', required: true }
    ],
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.type === 'SERVICE' && !formData.service) {
      newErrors.service = 'Service is required for service templates';
    }
    
    formData.formFields.forEach((field, index) => {
      if (!field.question) {
        newErrors[`field_${index}_question`] = 'Question is required';
      }
      if (['radio', 'checkbox'].includes(field.input_type) && (!field.options || field.options.length === 0)) {
        newErrors[`field_${index}_options`] = 'Options are required for this input type';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const addField = () => {
    setFormData(prev => ({
      ...prev,
      formFields: [...prev.formFields, { question: '', input_type: 'text', required: true }]
    }));
  };

  const removeField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      formFields: prev.formFields.filter((_, i) => i !== index)
    }));
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      formFields: prev.formFields.map((f, i) => i === index ? { ...f, ...updates } : f)
    }));
  };

  const addOption = (fieldIndex: number) => {
    const field = formData.formFields[fieldIndex];
    const options = field.options || [];
    updateField(fieldIndex, { options: [...options, ''] });
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const field = formData.formFields[fieldIndex];
    if (field.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldIndex, { options: newOptions });
    }
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = formData.formFields[fieldIndex];
    if (field.options) {
      const newOptions = field.options.filter((_, i) => i !== optionIndex);
      updateField(fieldIndex, { options: newOptions });
    }
  };

  const serviceOptions = useMemo(() => {
    return contextServiceOptions.map(s => ({
      ...s,
      onClick: () => setFormData(prev => ({ ...prev, service: s.id as string | null }))
    }));
  }, [contextServiceOptions]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Template Settings */}
      {/* Template Settings */}
      <ShadowCard className="p-8 border border-gray-200 relative focus-within:z-40">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 items-start">
            <Badge>Template Type</Badge>
            <div className="flex gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-[20px] w-fit">
              {(['GENERAL', 'SERVICE'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: t, service: t === 'GENERAL' ? null : prev.service }))}
                  className={`px-8 py-2.5 rounded-[14px] text-xs font-bold transition-all ${
                    formData.type === t 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-gray-500 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {formData.type === 'SERVICE' && (
            <div className="flex flex-col gap-2 items-start w-full">
              <Badge>Target Service</Badge>
              <div className="w-full">
                <Dropdown
                  fullWidth
                  className="w-full"
                  items={serviceOptions.map(opt => ({
                    ...opt,
                    onClick: () => setFormData(prev => ({ ...prev, service: opt.id as string | null }))
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
              {errors.service && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.service}</p>}
            </div>
          )}
        </div>
      </ShadowCard>

      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 px-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Form Configuration</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Add and arrange your fields</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={addField}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>

        <div className="space-y-4">
          {formData.formFields.map((field, index) => (
            <ShadowCard key={index} className="p-8 border border-gray-300 group/field transition-all relative focus-within:z-30">
              <div className="space-y-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Badge>Field {index + 1}</Badge>
                        <div className="w-40 scale-90 origin-left">
                            <PillTab
                                tabs={requiredTabs}
                                activeTab={field.required ? 'required' : 'optional'}
                                onTabChange={(id) => updateField(index, { required: id === 'required' })}
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => removeField(index)}
                        disabled={formData.formFields.length <= 1}
                        className="p-2 text-gray-300 opacity-0 group-hover/field:opacity-100 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all disabled:hidden"
                        title="Remove field"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Row 1: Question Text */}
                  <div className="flex gap-2 flex-col items-start w-full">
                      <Badge>Question Text</Badge>
                      <input
                        type="text"
                        value={field.question}
                        onChange={(e) => updateField(index, { question: e.target.value })}
                        placeholder="e.g. What is your company registration number?"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-sm text-gray-700"
                      />
                      {errors[`field_${index}_question`] && (
                        <p className="text-red-500 text-[10px] font-bold ml-1">{errors[`field_${index}_question`]}</p>
                      )}
                  </div>

                  {/* Row 2: Input Type & Placeholder */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex gap-2 flex-col items-start w-full">
                      <Badge>Input Type</Badge>
                      <Dropdown
                        fullWidth
                        className="w-full"
                        items={inputTypeItems((type) => updateField(index, { 
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

                    <div className="flex gap-2 flex-col items-start w-full">
                      <Badge>Placeholder (Optional)</Badge>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(index, { placeholder: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-sm text-gray-700"
                        placeholder="e.g. Enter your company name..."
                      />
                    </div>

                    {field.input_type === 'text' && (
                      <div className="flex gap-2 flex-col items-start w-full">
                        <Badge>Max Length (Optional)</Badge>
                        <input
                          type="number"
                          value={field.maxLength || ''}
                          onChange={(e) => updateField(index, { maxLength: parseInt(e.target.value) || undefined })}
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-sm text-gray-700"
                          placeholder="No limit"
                        />
                      </div>
                    )}
                  </div>

                  {/* Options Editor (for radio/checkbox) */}
                  {['radio', 'checkbox'].includes(field.input_type) && (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-6">
                      <div className="flex items-center justify-between">
                        <Badge>Options List</Badge>
                        <button
                          type="button"
                          onClick={() => addOption(index)}
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
                              onChange={(e) => updateOption(index, optIdx, e.target.value)}
                              placeholder={`Option ${optIdx + 1}`}
                              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(index, optIdx)}
                              className="p-2.5 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-xl transition-colors shadow-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {errors[`field_${index}_options`] && (
                        <p className="text-red-500 text-[10px] font-bold ml-1">{errors[`field_${index}_options`]}</p>
                      )}
                    </div>
                  )}
              </div>
            </ShadowCard>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-10 border-t border-gray-100">
        <Button
          type="submit"
          disabled={loading}
          className="px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 bg-primary text-white font-bold text-lg min-w-[240px]"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
};
