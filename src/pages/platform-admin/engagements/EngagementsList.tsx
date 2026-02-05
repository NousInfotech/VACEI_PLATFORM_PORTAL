import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  Building2, 
  Eye,
  Briefcase
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import { ShadowCard } from '../../../ui/ShadowCard';
import { Skeleton } from '../../../ui/Skeleton';
import { PageHeader } from '../../common/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/Table';
import { apiGet } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import type { Engagement } from '../../../data/engagementMockData';
import { mockEngagements } from '../../../data/engagementMockData';
import { EngagementStatusModal, type EngagementStatus } from './components/EngagementStatusModal';
import { apiPatch } from '../../../config/base';

const USE_MOCK_DATA = false;

const EngagementsList: React.FC = () => {
  const navigate = useNavigate();
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; engagementId: string; currentStatus: EngagementStatus } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const userRole = localStorage.getItem('userRole') || 'PLATFORM_ADMIN';

  useEffect(() => {
    const fetchEngagements = async () => {
      setLoading(true);
      try {
        const res = await apiGet<{ data: Engagement[] }>(endPoints.ENGAGEMENT.GET_ALL);
        setEngagements(res.data);
      } catch (err) {
        console.error('Failed to fetch engagements', err);
      } finally {
        setLoading(false);
      }
    };

    if (!USE_MOCK_DATA) fetchEngagements();
    else {
      setEngagements(mockEngagements);
      setLoading(false);
    }
  }, []);

  const filteredEngagements = engagements.filter(eng => {
    const searchLower = search.toLowerCase();
    return (
      eng.companyName.toLowerCase().includes(searchLower) || 
      eng.serviceCategory.toLowerCase().includes(searchLower) ||
      eng.organizationName.toLowerCase().includes(searchLower)
    );
  });

  const handleUpdateStatus = async (status: EngagementStatus, reason?: string) => {
    if (!statusModal) return;
    setIsUpdating(true);
    try {
      await apiPatch(endPoints.ENGAGEMENT.UPDATE_STATUS(statusModal.engagementId), { status, reason });
      alert('Status updated successfully');
      // Refresh list
      const res = await apiGet<{ data: Engagement[] }>(endPoints.ENGAGEMENT.GET_ALL);
      setEngagements(res.data);
      setStatusModal(null);
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Global Engagements" 
        icon={ShieldCheck}
      />

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search by company, service, or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-white border border-gray-200 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-gray-700 shadow-sm"
          />
        </div>
      </div>

      <ShadowCard className="overflow-hidden border border-gray-100 shadow-sm rounded-2xl bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="py-4 px-6 text-nowrap">S.No</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Service Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>

              <TableHead className="text-right px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>

                  <TableCell className="text-right px-6"><Skeleton className="h-8 w-12 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filteredEngagements.length > 0 ? (
              filteredEngagements.map((eng, index) => (
                <TableRow key={eng.id} className="hover:bg-gray-50/50 transition-colors group">
                  <TableCell className="py-4 px-6 font-bold text-gray-400 text-xs">
                    {(index + 1).toString().padStart(2, '0')}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    <div className="flex items-center gap-2">
                       <Building2 size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                       {eng.companyName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-primary/5 text-primary rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                          <Briefcase size={12} />
                          {eng.serviceCategory}
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${

                      eng.status === 'ACTIVE' 
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : 'bg-gray-50 text-gray-500 border-gray-100'
                    }`}>
                      {eng.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500 font-medium text-xs">
                    {new Date(eng.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setStatusModal({ isOpen: true, engagementId: eng.id, currentStatus: eng.status as EngagementStatus })}
                        className="rounded-xl hover:bg-primary/5 hover:text-primary transition-all border-gray-200 shadow-none text-[10px] font-bold uppercase"
                      >
                        Status
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/dashboard/engagements/${eng.id}`)}
                        className="rounded-xl hover:bg-primary/5 hover:text-primary transition-all border-gray-200 shadow-none"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">

                    <ShieldCheck className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No engagements found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ShadowCard>

      {statusModal && (
        <EngagementStatusModal 
          isOpen={statusModal.isOpen}
          onClose={() => setStatusModal(null)}
          onConfirm={handleUpdateStatus}
          currentStatus={statusModal.currentStatus}
          userRole={userRole}
          loading={isUpdating}
        />
      )}
    </div>
  );
};

export default EngagementsList;

