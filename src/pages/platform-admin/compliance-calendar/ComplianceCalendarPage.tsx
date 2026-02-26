import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/auth-context-core';
import { Button } from '../../../ui/Button';
import PageHeader from '../../common/PageHeader';
import { Skeleton } from '../../../ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/Table';
import { ShadowCard } from '../../../ui/ShadowCard';
import AlertMessage from '../../common/AlertMessage';
import { DeleteConfirmModal } from '../../platform-admin/components/DeleteConfirmModal';
import {
  listComplianceCalendars,
  deleteComplianceCalendar,
} from './complianceCalendarApi';
import type {
  ComplianceCalendar,
  ServiceCategory,
  ComplianceCalendarFrequency,
} from '../../../types/compliance-calendar';
import { RoleEnum } from '../../../data/mockUserData';
import { useNavigate } from 'react-router-dom';
import { ComplianceCalendarDetailModal } from './ComplianceCalendarDetailModal';

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'ACCOUNTING', label: 'Accounting' },
  { value: 'AUDITING', label: 'Auditing' },
  { value: 'VAT', label: 'VAT' },
  { value: 'CFO', label: 'CFO' },
  { value: 'CSP', label: 'CSP' },
  { value: 'LEGAL', label: 'Legal' },
  { value: 'PAYROLL', label: 'Payroll' },
  { value: 'PROJECTS_TRANSACTIONS', label: 'Projects & Transactions' },
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'GRANTS_AND_INCENTIVES', label: 'Grants & Incentives' },
  { value: 'INCORPORATION', label: 'Incorporation' },
  { value: 'MBR', label: 'MBR' },
  { value: 'TAX', label: 'Tax' },
  { value: 'CUSTOM', label: 'Custom' },
];

export const FREQUENCIES: { value: ComplianceCalendarFrequency; label: string }[] = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
  { value: 'CUSTOM', label: 'Custom' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    dateStyle: 'medium',
  });
}

export const ComplianceCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const role = user?.role;

  const isPlatformAdmin = role === RoleEnum.PLATFORM_ADMIN;
  const isPlatformEmployee = role === RoleEnum.PLATFORM_EMPLOYEE;
  const isPlatformRole = isPlatformAdmin || isPlatformEmployee;

  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: '',
    title: '',
  });
  const [detailItem, setDetailItem] = useState<ComplianceCalendar | null>(null);
  const navigate = useNavigate();

  // Platform roles see only GLOBAL entries (API also filters; we pass type=GLOBAL for clarity)
  const listParams = isPlatformRole ? { type: 'GLOBAL' as const } : undefined;

  const { data: response, isLoading } = useQuery({
    queryKey: ['compliance-calendar', listParams],
    queryFn: () => listComplianceCalendars(listParams),
    enabled: isPlatformRole,
  });

  // createMutation and updateMutation are no longer needed here as they are in the new pages
  // We keep the state for alert and delete confirm

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteComplianceCalendar(id),
    onSuccess: () => {
      setAlert({ message: 'Compliance calendar deleted successfully', variant: 'success' });
      setDeleteModal({ isOpen: false, id: '', title: '' });
      queryClient.invalidateQueries({ queryKey: ['compliance-calendar'] });
    },
    onError: () => {
      setAlert({ message: 'Failed to delete compliance calendar', variant: 'danger' });
      setDeleteModal((m) => ({ ...m, isOpen: false }));
    },
  });

  const calendars = response?.data ?? [];
  const filteredCalendars = calendars.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
      SERVICE_CATEGORIES.find((s) => s.value === c.serviceCategory)?.label.toLowerCase().includes(search.toLowerCase())
  );

  const canCreate = isPlatformAdmin;
  const canUpdate = (_item: ComplianceCalendar) => isPlatformAdmin;
  const canDelete = (_item: ComplianceCalendar) => isPlatformAdmin;

  const handleCreate = () => {
    navigate('/dashboard/compliance/create');
  };

  const handleEdit = (item: ComplianceCalendar) => {
    navigate(`/dashboard/compliance/${item.id}/edit`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Calendar"
        icon={ShieldCheck}
        description={
          isPlatformEmployee
            ? 'View platform-wide compliance deadlines (read-only).'
            : 'Create and manage global compliance calendar entries. You can only edit or delete entries you created.'
        }
        actions={
          canCreate ? (
            <Button variant="header" onClick={handleCreate}>
              <Plus className="h-5 w-5" />
              Create Entry
            </Button>
          ) : undefined
        }
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        itemName={deleteModal.title}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={() => deleteMutation.mutate(deleteModal.id)}
        title="Delete compliance calendar entry"
        description={
          <>
            Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteModal.title}"</span>?
            This action cannot be undone.
          </>
        }
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
        <input
          type="text"
          placeholder="Search by title, description or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-300 focus:border-primary/10 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-gray-700"
        />
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
      </div>

      <ShadowCard className="overflow-hidden border border-gray-100 shadow-sm rounded-3xl bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="py-5 px-6">Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6">
                    <Skeleton className="h-5 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-10 w-64" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24 rounded-lg" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24 rounded-lg" />
                  </TableCell>
                  <TableCell className="px-6">
                    <Skeleton className="h-8 w-12 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredCalendars.length > 0 ? (
              filteredCalendars.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <TableCell className="py-4 px-6">
                    <div className="flex flex-col max-w-md">
                      <span className="font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight truncate">
                        {item.title}
                      </span>
                      {item.description && (
                        <span className="text-[11px] text-gray-500 font-medium line-clamp-1 mt-0.5">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-primary/5 text-primary border-primary/10">
                      {SERVICE_CATEGORIES.find((s) => s.value === item.serviceCategory)?.label ?? item.serviceCategory}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-gray-50 text-gray-600 border-gray-200">
                      {FREQUENCIES.find((f) => f.value === item.frequency)?.label ?? item.frequency}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-600 font-medium">
                      {formatDate(item.startDate)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-primary font-bold">
                      {formatDate(item.dueDate)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex justify-end gap-2">
                      {canUpdate(item) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-gray-200 text-gray-600"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete(item) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-gray-200 text-amber-600 hover:bg-amber-50"
                          onClick={() => setDeleteModal({ isOpen: true, id: item.id, title: item.title })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-32 text-center text-gray-500 font-medium"
                >
                  {isPlatformRole
                    ? 'No global compliance calendar entries found.'
                    : 'No compliance calendars found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ShadowCard>

      {detailItem && (
        <ComplianceCalendarDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          serviceCategories={SERVICE_CATEGORIES}
          frequencies={FREQUENCIES}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

export default ComplianceCalendarPage;
