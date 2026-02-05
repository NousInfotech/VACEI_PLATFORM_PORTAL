import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  ChevronDown
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import { ShadowCard } from '../../../ui/ShadowCard';
import type { CreateTemplateDto, FormField, InputType } from '../../../types/service-request-template';
import { isOptionWithQuestions, getOptionLabel } from '../../../types/service-request-template';
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
    
    const validateFieldRecursive = (field: FormField, path: string) => {
      if (!field.question) {
        newErrors[`${path}_question`] = 'Question is required';
      }
      if (['radio', 'select', 'checklist'].includes(field.input_type)) {
        if (!field.options || field.options.length === 0) {
          newErrors[`${path}_options`] = 'Options are required for this input type';
        } else {
          field.options.forEach((option, optIdx) => {
            if (isOptionWithQuestions(option) && option.questions) {
              option.questions.forEach((nestedField, nestedIdx) => {
                validateFieldRecursive(nestedField, `${path}_opt${optIdx}_q${nestedIdx}`);
              });
            }
          });
        }
      }
    };

    formData.formFields.forEach((field, index) => {
      validateFieldRecursive(field, `field_${index}`);
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

  const serviceOptions = useMemo(() => {
    return contextServiceOptions.map((s: { id: string; label: string }) => ({
      ...s,
      onClick: () => setFormData(prev => ({ ...prev, service: s.id as string | null }))
    }));
  }, [contextServiceOptions]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
                  items={serviceOptions.map((opt: { id: string; label: string }) => ({
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
                <FieldEditor 
                    field={field}
                    index={index}
                    path={`field_${index}`}
                    onUpdate={(updates) => updateField(index, updates)}
                    onRemove={() => removeField(index)}
                    canRemove={formData.formFields.length > 1}
                    errors={errors}
                    inputTypeIcons={inputTypeIcons}
                    inputTypeItems={inputTypeItems}
                    requiredTabs={requiredTabs}
                />
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

interface FieldEditorProps {
    field: FormField;
    index: number;
    path: string;
    onUpdate: (updates: Partial<FormField>) => void;
    onRemove: () => void;
    canRemove: boolean;
    errors: Record<string, string>;
    inputTypeIcons: Record<InputType, React.ComponentType<{ className?: string }>>;
    inputTypeItems: (onClick: (type: InputType) => void) => { id: string; label: string; icon: React.ReactNode; onClick: () => void }[];
    requiredTabs: { id: string; label: string }[];
    depth?: number;
}

function FieldEditor({
    field,
    index,
    path,
    onUpdate,
    onRemove,
    canRemove,
    errors,
    inputTypeIcons,
    inputTypeItems,
    requiredTabs,
    depth = 0
}: FieldEditorProps) {
    const isMainField = depth === 0;

    const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({});

    const toggleOptionType = (optIdx: number) => {
        if (!field.options) return;
        const option = field.options[optIdx];
        const newOptions = [...field.options];

        if (typeof option === 'string') {
            // Convert to complex
            newOptions[optIdx] = { value: option, label: option, questions: [] };
            onUpdate({ options: newOptions });
            setExpandedOptions(prev => ({ ...prev, [`${path}_${optIdx}`]: true }));
        } else {
            // Already complex, just toggle visibility
            setExpandedOptions(prev => ({ ...prev, [`${path}_${optIdx}`]: !prev[`${path}_${optIdx}`] }));
        }
    };

    const removeOptionLogic = (optIdx: number) => {
        if (!field.options) return;
        const option = field.options[optIdx];
        if (typeof option !== 'string') {
            const newOptions = [...field.options];
            newOptions[optIdx] = option.value;
            onUpdate({ options: newOptions });
            setExpandedOptions(prev => ({ ...prev, [`${path}_${optIdx}`]: false }));
        }
    };

    const addNestedField = (optIdx: number) => {
        if (!field.options) return;
        const option = field.options[optIdx];
        if (typeof option !== 'string') {
            const newQuestions = [...(option.questions || []), { question: '', input_type: 'text', required: true } as FormField];
            const newOptions = [...field.options];
            newOptions[optIdx] = { ...option, questions: newQuestions };
            onUpdate({ options: newOptions });
        }
    };

    const updateNestedField = (optIdx: number, nestedIdx: number, updates: Partial<FormField>) => {
        if (!field.options) return;
        const option = field.options[optIdx];
        if (typeof option !== 'string' && option.questions) {
            const newQuestions = option.questions.map((q, i) => i === nestedIdx ? { ...q, ...updates } : q);
            const newOptions = [...field.options];
            newOptions[optIdx] = { ...option, questions: newQuestions };
            onUpdate({ options: newOptions });
        }
    };

    const removeNestedField = (optIdx: number, nestedIdx: number) => {
        if (!field.options) return;
        const option = field.options[optIdx];
        if (typeof option !== 'string' && option.questions) {
            const newQuestions = option.questions.filter((_, i) => i !== nestedIdx);
            const newOptions = [...field.options];
            newOptions[optIdx] = { ...option, questions: newQuestions };
            onUpdate({ options: newOptions });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Badge>{isMainField ? `Field ${index + 1}` : `Nested Q ${index + 1}`}</Badge>
                    <div className="w-40 scale-90 origin-left">
                        <PillTab
                            tabs={requiredTabs}
                            activeTab={field.required ? 'required' : 'optional'}
                            onTabChange={(id) => onUpdate({ required: id === 'required' })}
                        />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    disabled={!isMainField && false} // Nested fields can always be removed
                    className={`p-2 text-gray-300 ${isMainField ? (canRemove ? 'opacity-0 group-hover/field:opacity-100' : 'hidden') : 'opacity-0 group-hover/nested:opacity-100'} hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all`}
                    title="Remove field"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>

            {/* Row 1: Question Text */}
            <div className="flex gap-2 flex-col items-start w-full">
                <Badge variant="label">Question Text</Badge>
                <input
                    type="text"
                    value={field.question}
                    onChange={(e) => onUpdate({ question: e.target.value })}
                    placeholder="e.g. What is your company registration number?"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-sm text-gray-700"
                />
                {errors[`${path}_question`] && (
                    <p className="text-red-500 text-[10px] font-bold ml-1">{errors[`${path}_question`]}</p>
                )}
            </div>

            {/* Row 2: Input Type & Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-2 flex-col items-start w-full">
                    <Badge variant="label">Input Type</Badge>
                    <Dropdown
                        fullWidth
                        className="w-full"
                        items={inputTypeItems((type) => onUpdate({ 
                            input_type: type, 
                            options: ['radio', 'select', 'checklist'].includes(type) ? (field.options?.length ? field.options : ['Option 1']) : undefined 
                        }))}
                        trigger={
                            <button
                                type="button"
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-sm font-medium text-gray-700 hover:border-primary/20 transition-all focus:ring-4 focus:ring-primary/5 outline-none"
                            >
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const Icon = inputTypeIcons[field.input_type];
                                        if (!Icon) return <div className="h-4 w-4" />;
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
                    <Badge variant="label">Placeholder (Optional)</Badge>
                    <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => onUpdate({ placeholder: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-sm text-gray-700"
                        placeholder="e.g. Enter hint here..."
                    />
                </div>
            </div>

            {/* Options Editor (for radio/checkbox/checklist) */}
            {['radio', 'select', 'checklist'].includes(field.input_type) && (
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <Badge variant="label">Options List</Badge>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Toggle settings for conditional questions</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onUpdate({ options: [...(field.options || []), ''] })}
                            className="text-primary font-bold text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                            <Plus className="h-3 w-3" />
                            Add Option
                        </button>
                    </div>
                    <div className="space-y-4">
                        {field.options?.map((option, optIdx: number) => {
                            const isComplex = isOptionWithQuestions(option);
                            return (
                                <div key={optIdx} className="space-y-3">
                                    <div className="flex gap-2">
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                type="text"
                                                value={getOptionLabel(option)}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const newOptions = [...(field.options || [])];
                                                    if (typeof option === 'string') {
                                                        newOptions[optIdx] = val;
                                                    } else {
                                                        newOptions[optIdx] = { ...option, value: val, label: val };
                                                    }
                                                    onUpdate({ options: newOptions });
                                                }}
                                                placeholder={`Option ${optIdx + 1}`}
                                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => toggleOptionType(optIdx)}
                                                className={`p-2.5 rounded-xl transition-all border ${
                                                    isComplex 
                                                        ? (expandedOptions[`${path}_${optIdx}`] ? 'bg-primary text-white border-primary shadow-sm' : 'bg-primary/10 border-primary/20 text-primary') 
                                                        : 'bg-white border-gray-200 text-gray-400 hover:text-primary hover:border-primary/20'
                                                }`}
                                                title={isComplex ? (expandedOptions[`${path}_${optIdx}`] ? "Collapse conditional questions" : "Expand conditional questions") : "Add conditional questions"}
                                            >
                                                <Settings2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newOptions = (field.options || []).filter((_, i) => i !== optIdx);
                                                    onUpdate({ options: newOptions });
                                                }}
                                                className="p-2.5 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-xl transition-colors shadow-sm"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Nested Questions Editor */}
                                    {isComplex && expandedOptions[`${path}_${optIdx}`] && (
                                        <div className="ml-8 p-4 bg-white/50 border border-dashed border-gray-200 rounded-2xl space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                    Conditional Questions for "{getOptionLabel(option)}"
                                                </h6>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOptionLogic(optIdx)}
                                                        className="text-red-500 font-bold text-[9px] uppercase tracking-widest hover:underline"
                                                    >
                                                        Remove Logic
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => addNestedField(optIdx)}
                                                        className="text-primary font-bold text-[9px] uppercase tracking-widest hover:underline"
                                                    >
                                                        + Add Question
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {option.questions?.map((nestedField, nestedIdx) => (
                                                    <div key={nestedIdx} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 space-y-4 relative group/nested">
                                                        <FieldEditor 
                                                            field={nestedField}
                                                            index={nestedIdx}
                                                            path={`${path}_opt${optIdx}_q${nestedIdx}`}
                                                            onUpdate={(u) => updateNestedField(optIdx, nestedIdx, u)}
                                                            onRemove={() => removeNestedField(optIdx, nestedIdx)}
                                                            canRemove={true}
                                                            errors={errors}
                                                            inputTypeIcons={inputTypeIcons}
                                                            inputTypeItems={inputTypeItems}
                                                            requiredTabs={requiredTabs}
                                                            depth={depth + 1}
                                                        />
                                                    </div>
                                                ))}
                                                {(!option.questions || option.questions.length === 0) && (
                                                    <p className="text-[10px] text-gray-300 italic text-center py-2">No conditional questions added</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {errors[`${path}_options`] && (
                        <p className="text-red-500 text-[10px] font-bold ml-1">{errors[`${path}_options`]}</p>
                    )}
                </div>
            )}
        </div>
    );
};
