import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, Trash2, Edit2, Eye } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { ShadowCard } from '../../../ui/ShadowCard';
import { Skeleton } from '../../../ui/Skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../ui/Table';
import { apiGet, apiDelete } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import type { Organization } from '../../../types/organization';
import AlertMessage from '../../common/AlertMessage';
import PageHeader from '../../common/PageHeader';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

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
 
      <ShadowCard className="overflow-hidden border border-gray-100 shadow-sm rounded-2xl bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="py-4 px-6 text-nowrap font-bold text-gray-400 uppercase tracking-widest text-[10px]">S.No</TableHead>
              <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Organization</TableHead>
              <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Status</TableHead>
              <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Services</TableHead>
              <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Onboarded</TableHead>
              <TableHead className="text-right px-6 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-0 text-nowrap whitespace-nowrap">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-right px-6"><Skeleton className="h-8 w-12 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filteredOrganizations.length > 0 ? (
              filteredOrganizations.map((org: Organization, index: number) => (
                <TableRow key={org.id} className="hover:bg-gray-50/50 transition-colors group">
                  <TableCell className="py-4 px-6 font-bold text-gray-400 text-xs">
                    {(index + 1).toString().padStart(2, '0')}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 group-hover:text-primary transition-colors py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary text-light">  
                        <Building2 className="h-4 w-4" />
                      </div>
                      {org.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 w-fit ${
                      org.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${org.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500'}`} />
                      {org.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg">
                      {org.availableServices?.length || 0} Services
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500 font-medium text-xs">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/organizations/${org.id}`)}
                        className="rounded-xl border-gray-100 text-primary hover:bg-primary/5 hover:border-primary/20 transition-all shadow-none"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/organizations/${org.id}/edit`, { state: { organization: org } })}
                        className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-none"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(org, 'soft')}
                        className="rounded-xl border-gray-200 text-amber-600 hover:bg-amber-50 transition-all shadow-none"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Building2 className="h-16 w-16 mb-4 opacity-20" />
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">No Organizations Found</h2>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2 text-sm italic">
                      We couldn't find any entities matching your search. Try adjusting your keywords.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ShadowCard>

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
