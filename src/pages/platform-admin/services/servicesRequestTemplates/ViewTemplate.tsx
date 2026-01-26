import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  FileText, 
  ArrowLeft, 
  Edit2, 
  Settings2, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  X, 
  Save, 
  Plus,
  Info
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../../ui/Button';
import { apiGet } from '../../../../config/base';
import { endPoints } from '../../../../config/endPoint';
import type { ServiceRequestTemplate, FormField, CreateTemplateDto } from '../../../../types/service-request-template';
import AlertMessage from '../../../common/AlertMessage';
import PageHeader from '../../../common/PageHeader';
import { Skeleton } from '../../../../ui/Skeleton';
import { ShadowCard } from '../../../../ui/ShadowCard';
import { TemplatesProvider, useTemplates } from '../../context/ServicesContext';
import { TemplateSettingsCard } from './TemplateSettingsCard';
import { FieldCard } from './FieldCard';

const ViewTemplateContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    formatServiceLabel, 
    toggleActiveMutation, 
    updateMutation, 
    inputTypeIcons, 
    inputTypeItems, 
    requiredTabs,
    serviceOptions 
  } = useTemplates();
  
  const [alert, setAlert] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null);
  const [isGlobalEdit, setIsGlobalEdit] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<CreateTemplateDto | null>(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [inlineEditedField, setInlineEditedField] = useState<FormField | null>(null);
  const [collapsedFields, setCollapsedFields] = useState<Record<number, boolean>>({});
  
  const infoRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Click outside listener for Info popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setShowInfoPopup(false);
      }
    };
    if (showInfoPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInfoPopup]);

  const { data: template, isLoading } = useQuery({
    queryKey: ['service-request-template', id],
    queryFn: async () => {
      const response = await apiGet<{ data: ServiceRequestTemplate }>(endPoints.SERVICE_REQUEST_TEMPLATE.GET_BY_ID(id!));
      return response.data;
    },
    enabled: !!id,
    initialData: () => {
      const stateTemplate = (location.state as { template?: ServiceRequestTemplate })?.template;
      if (stateTemplate && stateTemplate.id === id) {
        return stateTemplate;
      }
      return undefined;
    }
  });

  const startGlobalEdit = useCallback(() => {
    if (!template) return;
    setEditedTemplate({
      service: template.service,
      type: template.type,
      isActive: template.isActive,
      formFields: [...template.formFields]
    });
    setEditingFieldIndex(null); // Clear single edit if starting global
    setIsGlobalEdit(true);
  }, [template]);

  useEffect(() => {
    if ((location.state as { initialEditState?: boolean })?.initialEditState && template && !isGlobalEdit) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        startGlobalEdit();
      }, 0);
      // Clear the state so it doesn't re-trigger on fresh loads
      window.history.replaceState({ ...(location.state as object), initialEditState: false }, '');
    }
  }, [location.state, template, isGlobalEdit, startGlobalEdit]);

  const cancelGlobalEdit = () => {
    setIsGlobalEdit(false);
    setEditedTemplate(null);
  };

  const handleGlobalSave = async () => {
    if (!id || !editedTemplate) return;
    try {
      await updateMutation.mutateAsync({
        id,
        data: editedTemplate
      });
      setAlert({ message: 'Template updated successfully', variant: 'success' });
      setIsGlobalEdit(false);
      setEditedTemplate(null);
    } catch {
      setAlert({ message: 'Failed to save changes', variant: 'danger' });
    }
  };

  const startSingleEdit = (index: number, field: FormField) => {
    setInlineEditedField({ ...field });
    setEditingFieldIndex(index);
    setIsGlobalEdit(false); // Ensure global edit is off
  };

  const cancelSingleEdit = () => {
    setEditingFieldIndex(null);
    setInlineEditedField(null);
  };

  const handleSingleSave = async (index: number) => {
    if (!id || !template || !inlineEditedField) return;
    
    try {
      let updatedFields;
      if (index === -1) {
        // Adding new field inline
        updatedFields = [inlineEditedField, ...template.formFields];
      } else {
        // Editing existing field
        updatedFields = [...template.formFields];
        updatedFields[index] = inlineEditedField;
      }

      await updateMutation.mutateAsync({
        id,
        data: {
          service: template.service,
          type: template.type,
          isActive: template.isActive,
          formFields: updatedFields
        }
      });
      
      setAlert({ message: index === -1 ? 'Field added successfully' : 'Field updated successfully', variant: 'success' });
      cancelSingleEdit();
    } catch {
      setAlert({ message: 'Failed to update field', variant: 'danger' });
    }
  };

  const updateEditedTemplate = (updates: Partial<CreateTemplateDto>) => {
    if (editedTemplate) {
      setEditedTemplate({ ...editedTemplate, ...updates });
    }
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    if (isGlobalEdit && editedTemplate) {
      const newFields = [...editedTemplate.formFields];
      newFields[index] = { ...newFields[index], ...updates };
      updateEditedTemplate({ formFields: newFields });
    } else if (editingFieldIndex === index && inlineEditedField) {
      setInlineEditedField(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const addField = () => {
    if (isGlobalEdit && editedTemplate) {
      updateEditedTemplate({
        formFields: [{ question: '', input_type: 'text', required: true }, ...editedTemplate.formFields]
      });
    } else if (template) {
        // Scoped add for normal mode
        setInlineEditedField({ question: '', input_type: 'text', required: true });
        setEditingFieldIndex(-1); // Special index for new inline field
        setIsGlobalEdit(false);
    }
  };

  const removeField = (index: number) => {
    if (!editedTemplate) return;
    updateEditedTemplate({
      formFields: editedTemplate.formFields.filter((_, i) => i !== index)
    });
  };

  const toggleCollapseFields = (forceState?: boolean) => {
    if (forceState !== undefined) {
      const newState: Record<number, boolean> = {};
      const fields = isGlobalEdit ? editedTemplate?.formFields : template?.formFields;
      fields?.forEach((_, i) => {
        newState[i] = forceState;
      });
      setCollapsedFields(newState);
    } else {
      // Logic for generic toggle if needed, but we'll use force for global buttons
    }
  };

  const toggleSingleCollapse = (index: number) => {
    setCollapsedFields(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleToggle = async () => {
    if (!template) return;
    try {
      await toggleActiveMutation.mutateAsync(template);
      setAlert({ 
        message: `Template ${!template.isActive ? 'activated' : 'deactivated'} successfully`, 
        variant: 'success' 
      });
    } catch {
      setAlert({ message: 'Failed to update template status', variant: 'danger' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-[400px] w-full rounded-[40px]" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Template Not Found</h2>
        <Button onClick={() => navigate('/dashboard/service-request-templates')} className="mt-4">
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={containerRef}>
      <PageHeader 
        title={isGlobalEdit ? "Edit Template" : "View Template"} 
        icon={FileText}
        description={isGlobalEdit ? `Modifying configuration for ${formatServiceLabel(template.service)}` : `View configuration for ${formatServiceLabel(template.service)}`}
        actions={
          <div className="flex items-center gap-3">
            {!isGlobalEdit ? (
              <>
                <Button 
                  onClick={() => navigate('/dashboard/service-request-templates')}
                  variant='header'
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={startGlobalEdit}
                  variant='header'
                >
                  <Edit2 className="h-5 w-5 mr-2" />
                  Edit
                </Button>
                <Button 
                    onClick={() => navigate(`/dashboard/service-request-templates/${id}/preview`)}
                    variant='header'
                >
                    <Eye className="h-5 w-5 mr-2" />
                    Preview
                </Button>
                <Button
                  onClick={handleToggle}
                  disabled={toggleActiveMutation.isPending}
                  variant='header'
                  className={`rounded-xl px-4 ${
                    template.isActive 
                      ? 'border-amber-200 text-amber-600 hover:bg-amber-50' 
                      : 'border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {template.isActive ? <XCircle className="h-5 w-5 mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                  {template.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={cancelGlobalEdit}
                  variant='header'
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleGlobalSave}
                  disabled={updateMutation.isPending}
                  variant='header'
                >
                  <Save className="h-5 w-5 mr-2" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        } 
      />

      {alert && (
        <div className="animate-in fade-in slide-in-from-top duration-300">
          <AlertMessage
            message={alert.message}
            variant={alert.variant}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-6">
          {isGlobalEdit && editedTemplate && (
            <TemplateSettingsCard 
              formData={editedTemplate}
              template={template}
              isEdit={isGlobalEdit}
              onUpdate={updateEditedTemplate}
              serviceOptions={serviceOptions}
              hideMetadata={true}
            />
          )}

          <ShadowCard className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                      <Settings2 className="h-5 w-5" />
                      Form Fields
                  </h3>
                  
                  <div className="relative" ref={infoRef}>
                    <button 
                      onClick={() => setShowInfoPopup(!showInfoPopup)}
                      className={`p-1.5 rounded-lg transition-all ${showInfoPopup ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-100'}`}
                      title="View template info"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                    
                    {showInfoPopup && template && (
                      <div className="absolute top-full left-0 mt-3 w-72 bg-white border border-gray-100 rounded-[24px] shadow-2xl z-50 p-6 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Status</span>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                              template.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                            }`}>
                              {template.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Version</span>
                            <span className="text-xs font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded-md">v{template.version}</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Type</span>
                            <span className="text-xs font-bold text-gray-900">{template.type}</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Created By</span>
                            <span className="text-xs font-bold text-gray-900">
                              {template.creator ? `${template.creator.firstName} ${template.creator.lastName}` : 'System'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Last Updated</span>
                            <span className="text-xs font-bold text-gray-900">{new Date(template.updatedAt).toLocaleDateString()}</span>
                          </div>
                          {template.service && (
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Target Service</span>
                              <span className="text-xs font-bold text-primary uppercase truncate ml-4 max-w-[140px]">
                                {template.service.replace(/_/g, ' ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isGlobalEdit && (
                    <>
                      <Button 
                        onClick={() => toggleCollapseFields(true)}
                        variant='header'
                      >
                        Collapse All
                      </Button>
                      <Button 
                        onClick={() => toggleCollapseFields(false)}
                        variant='header'
                      >
                        Expand All
                      </Button>
                    </>
                  )}
                  <Button 
                    onClick={addField}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>
            </div>
            {/* ... rest of mapping ... */}
            <div className="space-y-4">
              {editingFieldIndex === -1 && inlineEditedField && (
                <FieldCard 
                  field={inlineEditedField}
                  index={-1}
                  isEdit={true}
                  isGlobalEdit={false}
                  onUpdate={(updates) => updateField(-1, updates)}
                  onRemove={() => cancelSingleEdit()}
                  onEditStart={() => {}}
                  onCancel={cancelSingleEdit}
                  onSave={() => handleSingleSave(-1)}
                  isPending={updateMutation.isPending}
                  inputTypeIcons={inputTypeIcons}
                  inputTypeItems={inputTypeItems}
                  requiredTabs={requiredTabs}
                />
              )}

              {(isGlobalEdit ? editedTemplate?.formFields : template.formFields)?.map((field: FormField, index: number) => {
                const isSingleEditing = editingFieldIndex === index;
                const activeField = isSingleEditing ? inlineEditedField : field;
                if (!activeField) return null;

                return (
                    <FieldCard 
                      key={index}
                      field={activeField}
                      index={index}
                      isEdit={isGlobalEdit || isSingleEditing}
                      isGlobalEdit={isGlobalEdit}
                      onUpdate={(updates) => updateField(index, updates)}
                      onRemove={() => removeField(index)}
                      onEditStart={() => startSingleEdit(index, field)}
                      onCancel={cancelSingleEdit}
                      onSave={() => handleSingleSave(index)}
                      isPending={updateMutation.isPending}
                      inputTypeIcons={inputTypeIcons}
                      inputTypeItems={inputTypeItems}
                      requiredTabs={requiredTabs}
                      isCollapsed={collapsedFields[index] ?? true}
                      onToggleCollapse={() => toggleSingleCollapse(index)}
                    />
                );
              })}
            </div>
          </ShadowCard>
        </div>
      </div>
    </div>
  );
};

const ViewTemplate: React.FC = () => (
    <TemplatesProvider>
        <ViewTemplateContent />
    </TemplatesProvider>
);

export default ViewTemplate;
