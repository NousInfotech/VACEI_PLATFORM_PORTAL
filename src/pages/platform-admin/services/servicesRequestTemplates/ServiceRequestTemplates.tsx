import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  FileText,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../ui/Button';
import Dropdown from '../../../common/Dropdown';
import type { ServiceRequestTemplate } from '../../../../types/service-request-template';
import AlertMessage from '../../../common/AlertMessage';
import PageHeader from '../../../common/PageHeader';
import { TemplateList } from './TemplateList';
import { TemplatesProvider, useTemplates } from '../../context/ServicesContext';

const ServiceRequestTemplatesContent: React.FC = () => {
  const navigate = useNavigate();
  const { templates, isLoading, toggleActiveMutation } = useTemplates();
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState('All Services');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null);

  const services = useMemo(() => {
    const uniqueServices = Array.from(new Set(templates.map(t => t.service || 'General')));
    return ['All Services', ...uniqueServices.sort()];
  }, [templates]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdownId && !(event.target as Element).closest('.dropdown-trigger')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdownId]);

  const filteredTemplates = useMemo(() => {
    return templates
      .filter(template => {
        const serviceName = template.service || 'General';
        const matchesSearch = serviceName.toLowerCase().includes(search.toLowerCase()) || 
                             template.type.toLowerCase().includes(search.toLowerCase());
        const matchesService = selectedService === 'All Services' || serviceName === selectedService;
        
        return matchesSearch && matchesService;
      })
      .sort((a, b) => {
        // Active templates (true) first, inactive (false) last
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [templates, search, selectedService]);

  const handleCreateClick = () => {
    navigate('/dashboard/service-request-templates/create');
  };

  const handleEditClick = (template: ServiceRequestTemplate) => {
    navigate(`/dashboard/service-request-templates/${template.id}/view`, { 
      state: { template, initialEditState: true } 
    });
    setActiveDropdownId(null);
  };

  const handleViewClick = (template: ServiceRequestTemplate) => {
    navigate(`/dashboard/service-request-templates/${template.id}/view`, { state: { template } });
    setActiveDropdownId(null);
  };

  const handleToggle = async (template: ServiceRequestTemplate) => {
    try {
      await toggleActiveMutation.mutateAsync(template);
      setAlert({ 
        message: `Template ${!template.isActive ? 'activated' : 'deactivated'} successfully`, 
        variant: 'success' 
      });
      setActiveDropdownId(null);
    } catch {
      setAlert({ message: 'Failed to update template status', variant: 'danger' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Service Request Templates" 
        icon={FileText}
        description="Manage form fields for different service requests and general sections."
        actions={
          <Button 
            onClick={handleCreateClick}
            variant='header'
           >
            <Plus className="h-5 w-5" />
            Create Template
          </Button>
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

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search templates by type or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-300 focus:border-primary/10 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-gray-700"
          />
        </div>

        <Dropdown
          label={selectedService}
          trigger={
            <Button variant="secondary" className="h-full px-6 py-3 rounded-2xl flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700">
              <Filter className="h-4 w-4" />
              <span className="font-semibold">{selectedService}</span>
            </Button>
          }
          items={services.map(service => ({
            id: service,
            label: service,
            onClick: () => setSelectedService(service),
            className: selectedService === service ? "bg-primary/5 text-primary font-bold" : ""
          }))}
          align="right"
        />
      </div>

      <TemplateList
        loading={isLoading}
        templates={filteredTemplates}
        activeDropdownId={activeDropdownId}
        setActiveDropdownId={setActiveDropdownId}
        onEdit={handleEditClick}
        onView={handleViewClick}
        onToggleActive={handleToggle}
      />
    </div>
  );
};

const ServiceRequestTemplates: React.FC = () => (
  <TemplatesProvider>
    <ServiceRequestTemplatesContent />
  </TemplatesProvider>
);

export default ServiceRequestTemplates;
