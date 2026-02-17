import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  Bell, 
  Calendar,
  Clock,
  AlertCircle,
  AlertTriangle,
  Info,
  Megaphone,
  CheckCircle,
  Check
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import PageHeader from '../../common/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiDelete, apiPatch } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import { Skeleton } from '../../../ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/Table';
import { ShadowCard } from '../../../ui/ShadowCard';
import AlertMessage from '../../common/AlertMessage';
import { DeleteConfirmModal } from '../../platform-admin/components/DeleteConfirmModal';
import type { Notice, NoticeListResponse } from '../../../types/notice';

interface NoticeTypeConfig {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}

const getNoticeTypeConfig = (type: string) => {
  const configs: Record<string, NoticeTypeConfig> = {
    emergency: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    warning: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    update: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    announcement: { icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    reminder: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
    info: { icon: Info, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100' },
    success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
  };
  return configs[type.toLowerCase()] || configs.info;
};

const NoticeManagement: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: '',
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: () => apiGet<NoticeListResponse>(endPoints.NOTICE.GET_ALL),
  });

  const statusMutation = useMutation({
    mutationFn: (id: string) => apiPatch(endPoints.NOTICE.PATCH_STATUS(id), { status: 'PUBLISHED' }),
    onSuccess: () => {
      setAlert({ message: 'Notice published successfully', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
    onError: () => {
      setAlert({ message: 'Failed to publish notice', variant: 'danger' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(endPoints.NOTICE.DELETE(id)),
    onSuccess: () => {
      setAlert({ message: 'Notice deleted successfully', variant: 'success' });
      setDeleteModal({ isOpen: false, id: '', name: '' });
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
    onError: () => {
      setAlert({ message: 'Failed to delete notice', variant: 'danger' });
      setDeleteModal({ ...deleteModal, isOpen: false });
    }
  });

  const notices = response?.data || [];

  const filteredNotices = notices.filter(notice => 
    notice.title.toLowerCase().includes(search.toLowerCase()) ||
    notice.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Notice Management" 
        icon={Bell}
        description="Create and manage system-wide notices for clients and employees."
        actions={
          <Button variant="header" onClick={() => navigate('/dashboard/notice-management/create')}>
            <Plus className="h-5 w-5" />
            Create Notice
          </Button>
        }
      />

      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        itemName={deleteModal.name}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={() => deleteMutation.mutate(deleteModal.id)}
        title="Delete Notice"
        description={<>Are you sure you want to delete the notice <span className="font-bold text-gray-900">"{deleteModal.name}"</span>? This action cannot be undone.</>}
        mode="simple"
      />

      {alert && (
        <AlertMessage 
          message={alert.message} 
          variant={alert.variant} 
          onClose={() => setAlert(null)} 
        />
      )}

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search notices by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-300 focus:border-primary/10 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-gray-700"
        />
      </div>

      <ShadowCard className="overflow-hidden border border-gray-100 shadow-sm rounded-3xl bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="py-5 px-6">S.No</TableHead>
              <TableHead>Notice</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Targets</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead className="text-right px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-5 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-10 w-64" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell className="px-6"><Skeleton className="h-8 w-12 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filteredNotices.length > 0 ? (
              filteredNotices.map((notice: Notice, index: number) => {
                const config = getNoticeTypeConfig(notice.type);
                const Icon = config.icon;
                return (
                  <TableRow key={notice.id} className="hover:bg-gray-50/50 transition-colors group">
                    <TableCell className="py-4 px-6 font-bold text-gray-400 text-xs">
                      {(index + 1).toString().padStart(2, '0')}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col max-w-md">
                        <span className="font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight truncate">
                          {notice.title}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium line-clamp-1 mt-0.5">
                          {notice.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${config.color} ${config.border}`}>
                        <Icon className="h-3 w-3" />
                        {notice.type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {notice.targetRoles.map(role => (
                          <span key={role} className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded uppercase tracking-wide">
                            {role}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${
                        notice.status === 'PUBLISHED' ? 'bg-green-50 text-green-600 border border-green-100' : 
                        notice.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {notice.status || 'DRAFT'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs font-bold text-gray-400">
                        <div className="flex items-center gap-1.5 text-gray-900">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {new Date(notice.scheduledAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 ml-5">
                          {new Date(notice.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-2">
                        {notice.status !== 'PUBLISHED' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="rounded-xl border-green-200 text-green-600 hover:bg-green-50"
                            onClick={() => statusMutation.mutate(notice.id)}
                            disabled={statusMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-xl border-gray-200 text-gray-600"
                          onClick={() => navigate(`/dashboard/notice-management/${notice.id}/edit`)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-xl border-gray-200 text-amber-600 hover:bg-amber-50"
                          onClick={() => setDeleteModal({ isOpen: true, id: notice.id, name: notice.title })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-32 text-center text-gray-500 font-medium">
                  No notices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ShadowCard>
    </div>
  );
};

export default NoticeManagement;
