import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, Trash2, MoreVertical, Edit2, Users } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ShadowCard } from '../../ui/ShadowCard';
import { Skeleton } from '../../ui/Skeleton';
import { apiGet, apiDelete } from '../../config/base';
import { endPoints } from '../../config/endPoint';
import type { Organization } from '../../types/organization';
import AlertMessage from '../common/AlertMessage';
import PageHeader from '../common/PageHeader';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

const formatServiceLabel = (service: string) => {
  return service
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace('And', '&');
};

const Organizations: React.FC = () => {
  const navigate = useNavigate();
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet<{ data: Organization[] }>(endPoints.ORGANIZATION.GET_ALL);
      setAllOrganizations(response.data);
    } catch {
      setAlert({ message: 'Failed to fetch organizations', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdownId && !(event.target as Element).closest('.dropdown-trigger')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdownId]);

  const filteredOrganizations = allOrganizations.filter(org =>
    org.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteClick = (org: Organization, type: 'soft' | 'hard' = 'soft') => {
    setOrgToDelete(org);
    setDeleteType(type);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orgToDelete) return;
    
    setDeleteLoading(true);
    try {
      const endpoint = deleteType === 'hard' 
        ? endPoints.ORGANIZATION.HARD_DELETE(orgToDelete.id) 
        : endPoints.ORGANIZATION.DELETE(orgToDelete.id);
        
      await apiDelete(endpoint);
      setAlert({ 
        message: `Organization ${deleteType === 'hard' ? 'permanently removed' : 'soft deleted'} successfully`, 
        variant: 'success' 
      });
      setDeleteModalOpen(false);
      fetchOrganizations();
    } catch {
      setAlert({ message: 'Failed to delete organization', variant: 'danger' });
    } finally {
      setDeleteLoading(false);
      setOrgToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-500">Manage all entities and their status</p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/organizations/create')}
          className="flex items-center gap-2 px-6 py-2 rounded-xl shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          Create Organization
        </Button>
      </div> */}

      <PageHeader 
        title="Organizations" 
        icon={Building2}
        actions={
          <Button 
            onClick={() => navigate('/dashboard/organizations/create')} 
            variant='header'
           >
            <Plus className="h-5 w-5" />
            Create Organization
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
            placeholder="Search organizations by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-300 focus:border-primary/10 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-gray-700"
          />
        </div>
 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <ShadowCard key={i} className="p-6 border border-gray-100 shadow-sm bg-white flex flex-col h-[280px] rounded-2xl space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="space-y-3 flex-1">
                <Skeleton className="h-3 w-24" />
                <div className="flex flex-wrap gap-1.5">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-14" />
                </div>
              </div>
              <div className="pt-5 border-t border-gray-50 flex justify-between">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-12 rounded-md" />
              </div>
            </ShadowCard>
          ))
        ) : filteredOrganizations.length > 0 ? (
          filteredOrganizations.map((org: Organization) => (
            <ShadowCard key={org.id} className="p-6 group relative border hover:border-gray-300 border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white flex flex-col h-full rounded-2xl">
              {/* Header: Icon, Name, Status & Actions */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/5 text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 group-hover:text-primary transition-colors leading-tight">
                      {org.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 ${
                        org.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${org.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500'}`} />
                        {org.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="relative dropdown-trigger">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdownId(activeDropdownId === org.id ? null : org.id);
                    }}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      activeDropdownId === org.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 rotate-90' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Actions"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>

                  {/* Floating Dropdown Menu */}
                  {activeDropdownId === org.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                      <button
                        onClick={() => {
                          setActiveDropdownId(null);
                          navigate(`/dashboard/organizations/${org.id}/edit`, { state: { organization: org } });
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
                          <Edit2 className="h-4 w-4" />
                        </div>
                        Edit Details
                      </button>
                      
                      <div className="h-px bg-gray-50 mx-4 my-1" />
                      
                      <button
                        onClick={() => {
                          setActiveDropdownId(null);
                          handleDeleteClick(org, 'soft');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                          <Trash2 className="h-4 w-4" />
                        </div>
                         Delete
                      </button>

                      <button
                        onClick={() => {
                          setActiveDropdownId(null);
                          handleDeleteClick(org, 'hard');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <div className="p-1.5 rounded-lg bg-red-50 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col items-start leading-tight">
                           <span>Hard Delete</span>
                           <span className="text-[9px] uppercase tracking-tighter opacity-70">Dev Only</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Body: Available Services */}
              <div className="mt-5 flex-1">
                {org.availableServices && org.availableServices.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">Available Services</span>
                       <div className="h-px flex-1 bg-gray-50"></div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {org.availableServices.map((service: string) => (
                        <span 
                          key={service} 
                          className="px-2.5 py-1 bg-primary/90 text-light text-[8px] font-medium rounded-full uppercase tracking-tight"
                        >
                          {formatServiceLabel(service)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-50 rounded-xl py-4">
                    <span className="text-xs text-gray-300 italic">No services configured</span>
                  </div>
                )}
              </div>

              {/* Footer: Metadata */}
              <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between text-[10px]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-700 font-medium uppercase tracking-tighter text-[12px]">Onboarded</span>
                  <span className="font-semibold text-gray-600">{new Date(org.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex flex-col gap-0.5 items-end">
                  <span className="text-gray-700 font-medium uppercase tracking-tighter text-[12px]">Administrators</span>
                  <span className="font-bold bg-primary text-light px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <Users className="h-3.5 w-3.5" />
                    {org.members?.length || 0}
                  </span>
                </div>
              </div>
            </ShadowCard>
          ))
        ) : (
          <div className="col-span-full py-32 text-center animate-in zoom-in duration-500">
            <div className="inline-flex p-10 bg-gray-50 rounded-[40px] text-gray-200 shadow-inner">
              <Building2 className="h-20 w-20" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mt-8 tracking-tight">No Organizations Found</h2>
            <p className="text-gray-500 max-w-sm mx-auto mt-4 text-lg">
              We couldn't find any entities matching your search. Try adjusting your keywords.
            </p>
            <Button 
               onClick={() => navigate('/dashboard/organizations/create')}
               variant="outline" 
               className="mt-8 px-8 py-3 rounded-2xl font-bold"
            >
              Add New Organization
            </Button>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={deleteType === 'hard' ? "Hard Delete (Permanent)" : "Soft Delete (Archive)"}
        itemName={orgToDelete?.name || ''}
        loading={deleteLoading}
        isHardDelete={deleteType === 'hard'}
      />
    </div>
  );
};

export default Organizations;
