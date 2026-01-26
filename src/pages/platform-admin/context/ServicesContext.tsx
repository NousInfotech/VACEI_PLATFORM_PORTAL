import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { 
  Type, 
  Hash, 
  CheckSquare, 
  CircleDot, 
  AlignLeft,
  type LucideIcon,
} from 'lucide-react';
import { apiGet, apiPut, apiPost } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import { Services, type ServiceRequestTemplate, type CreateTemplateDto, type InputType } from '../../../types/service-request-template';

interface TemplatesContextType {
  templates: ServiceRequestTemplate[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  formatServiceLabel: (service: string | null) => string;
  toggleActiveMutation: UseMutationResult<unknown, Error, ServiceRequestTemplate, unknown>;
  createMutation: UseMutationResult<unknown, Error, CreateTemplateDto, unknown>;
  updateMutation: UseMutationResult<unknown, Error, { id: string; data: CreateTemplateDto }, unknown>;
  queryClient: ReturnType<typeof useQueryClient>;
  // Form Configuration
  serviceOptions: { id: string; label: string }[];
  inputTypeIcons: Record<InputType, LucideIcon>;
  inputTypeItems: (onClick: (type: InputType) => void) => { id: string; label: string; icon: React.ReactNode; onClick: () => void }[];
  requiredTabs: { id: string; label: string }[];
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(undefined);

export const TemplatesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['service-request-templates'],
    queryFn: async () => {
      const response = await apiGet<{ data: ServiceRequestTemplate[] }>(endPoints.SERVICE_REQUEST_TEMPLATE.GET_ALL);
      return response.data;
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (template: ServiceRequestTemplate) => {
      return apiPut<unknown>(endPoints.SERVICE_REQUEST_TEMPLATE.UPDATE(template.id), {
        isActive: !template.isActive
      });
    },
    onSuccess: async (_, template) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['service-request-templates'] }),
        queryClient.invalidateQueries({ queryKey: ['service-request-template', template.id] })
      ]);
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateTemplateDto) => {
      return apiPost<unknown>(endPoints.SERVICE_REQUEST_TEMPLATE.CREATE, data as unknown as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-request-templates'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateTemplateDto }) => {
      return apiPut<unknown>(endPoints.SERVICE_REQUEST_TEMPLATE.UPDATE(id), data as unknown as Record<string, unknown>);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['service-request-templates'] });
      queryClient.invalidateQueries({ queryKey: ['service-request-template', id] });
    }
  });

  const formatServiceLabel = useCallback((service: string | null) => {
    if (!service) return 'General Section';
    return service
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .replace('And', '&');
  }, []);

  const serviceOptions = useMemo(() => {
    return Object.values(Services).map(s => ({
      id: s,
      label: s.replace(/_/g, ' '),
    }));
  }, []);

  const inputTypeIcons: Record<InputType, LucideIcon> = useMemo(() => ({
    text: Type,
    number: Hash,
    checkbox: CheckSquare,
    radio: CircleDot,
    text_area: AlignLeft,
  }), []);

  const inputTypeItems = useCallback((onClick: (type: InputType) => void) => 
    (['text', 'number', 'text_area', 'radio', 'checkbox'] as InputType[]).map((type) => {
      const Icon = inputTypeIcons[type];
      return {
        id: type,
        label: type.replace('_', ' ').toUpperCase(),
        icon: <Icon className="h-4 w-4" />,
        onClick: () => onClick(type)
      };
    }), [inputTypeIcons]);

  const requiredTabs = useMemo(() => [
    { id: 'required', label: 'Required' },
    { id: 'optional', label: 'Optional' }
  ], []);

  const value = useMemo(() => ({
    templates,
    isLoading,
    isError,
    refetch,
    formatServiceLabel,
    toggleActiveMutation,
    createMutation,
    updateMutation,
    queryClient,
    serviceOptions,
    inputTypeIcons,
    inputTypeItems,
    requiredTabs,
  }), [templates, isLoading, isError, refetch, formatServiceLabel, toggleActiveMutation, createMutation, updateMutation, queryClient, serviceOptions, inputTypeIcons, inputTypeItems, requiredTabs]);

  return (
    <TemplatesContext.Provider value={value}>
      {children}
    </TemplatesContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTemplates = () => {
  const context = useContext(TemplatesContext);
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplatesProvider');
  }
  return context;
};
