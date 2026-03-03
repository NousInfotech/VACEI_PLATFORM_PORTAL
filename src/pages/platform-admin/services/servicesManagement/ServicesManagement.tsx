import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit2, 
  Settings,
  X,
  Save,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Settings02Icon } from '@hugeicons/core-free-icons';
import { Button } from '../../../../ui/Button';
import { ShadowCard } from '../../../../ui/ShadowCard';
import { Skeleton } from '../../../../ui/Skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../../ui/Table';
import AlertMessage from '../../../common/AlertMessage';
import PageHeader from '../../../common/PageHeader';
import { TemplatesProvider, useTemplates } from '../../context/ServicesContext';
import { HugeiconsIcon } from "@hugeicons/react";
import type { CustomService } from '../../../../types/service-request-template';
import Pagination from '../../../common/Pagination';

const ServicesManagementContent: React.FC = () => {
  const { 
    customServices, 
    isLoadingCustomServices,
    createCustomServiceMutation,
    updateCustomServiceMutation,
    patchCustomServiceStatusMutation,
    search,
    setSearch
  } = useTemplates();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<CustomService | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [alert, setAlert] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const setPage = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
  };
  const limit = 10;
  const filteredServices = useMemo(() => customServices.filter(service =>
    service.title.toLowerCase().includes(search.toLowerCase()) ||
    (service.description?.toLowerCase() || '').includes(search.toLowerCase())
  ), [customServices, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / limit));
  const paginatedServices = useMemo(() => {
    return filteredServices.slice((page - 1) * limit, page * limit);
  }, [filteredServices, page]);

  const handleOpenModal = (service: CustomService | null = null) => {
    if (service) {
      setEditingService(service);
      setFormData({ title: service.title, description: service.description || '' });
    } else {
      setEditingService(null);
      setFormData({ title: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({ title: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setAlert({ message: 'Title is required', variant: 'danger' });
      return;
    }

    try {
      if (editingService) {
        await updateCustomServiceMutation.mutateAsync({
          id: editingService.id,
          data: formData
        });
        setAlert({ message: 'Service updated successfully', variant: 'success' });
      } else {
        await createCustomServiceMutation.mutateAsync(formData);
        setAlert({ message: 'Service created successfully', variant: 'success' });
      }
      handleCloseModal();
    } catch {
      setAlert({ message: 'Failed to save service', variant: 'danger' });
    }
  };

  const handleToggleStatus = async (service: CustomService) => {
    try {
      await patchCustomServiceStatusMutation.mutateAsync({
        id: service.id,
        isActive: !service.isActive
      });
      setAlert({ 
        message: `Service ${!service.isActive ? 'activated' : 'deactivated'} successfully`, 
        variant: 'success' 
      });
    } catch {
      setAlert({ message: 'Failed to update status', variant: 'danger' });
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader 
        title="Services Management" 
        icon={Settings}
        description="Manage bespoke services and their configurations"
        actions={
          <Button 
            onClick={() => handleOpenModal()} 
            variant='header'
           >
            <Plus className="h-5 w-5" />
            Create Custom Service
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

      <div className="relative flex-1 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-300 focus:border-primary/10 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-gray-700"
        />
      </div>

      <ShadowCard className="overflow-hidden border border-gray-100 shadow-sm rounded-2xl bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="py-4 px-6 text-nowrap font-bold text-gray-400 uppercase tracking-widest text-[10px]">S.No</TableHead>
              <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Service Name</TableHead>
              <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Description</TableHead>
              <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Status</TableHead>
              <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Created At</TableHead>
              <TableHead className="text-right px-6 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-0 text-nowrap whitespace-nowrap">
            {isLoadingCustomServices ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-right px-6"><Skeleton className="h-8 w-12 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : paginatedServices.length > 0 ? (
              paginatedServices.map((service, index) => (
                <TableRow key={service.id} className="hover:bg-gray-50/50 transition-colors group">
                  <TableCell className="py-4 px-6 font-bold text-gray-400 text-xs">
                    {(((page - 1) * limit) + index + 1).toString().padStart(2, '0')}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 group-hover:text-primary transition-colors py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">  
                        <HugeiconsIcon icon={Settings02Icon} className="h-4 w-4" />
                      </div>
                      {service.title}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 font-medium text-xs max-w-xs truncate">
                    {service.description || 'No description'}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleStatus(service)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        service.isActive 
                          ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' 
                          : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                      }`}
                    >
                      {service.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {service.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </TableCell>
                  <TableCell className="text-gray-500 font-medium text-xs">
                    {new Date(service.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(service)}
                        className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-none"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <HugeiconsIcon icon={Settings02Icon} className="h-16 w-16 mb-4 opacity-20" />
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">No Custom Services Found</h2>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2 text-sm italic">
                      Start by creating a custom service to manage bespoke requests.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filteredServices.length}
          itemsPerPage={limit}
        />
      </ShadowCard>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingService ? 'Edit Custom Service' : 'Create Custom Service'}
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                    Service Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Bespoke Tax Advisory"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe what this service entails..."
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseModal}
                    className="flex-1 rounded-2xl py-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCustomServiceMutation.isPending || updateCustomServiceMutation.isPending}
                    className="flex-1 rounded-2xl py-4"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {editingService ? 'Update Service' : 'Create Service'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ServicesManagement: React.FC = () => (
  <TemplatesProvider>
    <ServicesManagementContent />
  </TemplatesProvider>
);

export default ServicesManagement;
