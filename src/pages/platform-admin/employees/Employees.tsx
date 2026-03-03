import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Users, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { ShadowCard } from '../../../ui/ShadowCard';
import { Skeleton } from '../../../ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/Table';
import { apiGet, apiDelete } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import type { PlatformEmployee, PlatformEmployeeResponse } from '../../../types/platformEmployee';
import PageHeader from '../../common/PageHeader';
import Pagination from '../../common/Pagination';

const formatString = (str: string) => {
  if (!str) return 'N/A';
  return str.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
};

const getStatusBadge = (status: string) => {
  const formatted = formatString(status);
  let colorClass = 'bg-gray-50 text-gray-600 border-gray-200';

  const s = status?.toUpperCase();
  if (s === 'ACTIVE') {
    colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
  } else if (s === 'INACTIVE' || s === 'DELETED') {
    colorClass = 'bg-rose-50 text-rose-700 border-rose-200/60';
  } else if (s === 'PENDING') {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200/60';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${colorClass} uppercase tracking-wider whitespace-nowrap`}>
      {formatted}
    </span>
  );
};

const Employees: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const setPage = (updater: number | ((p: number) => number)) => {
    const newPage = typeof updater === 'function' ? updater(page) : updater;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
  };
  const limit = 10;

  // Fetch ALL employees once and handle search + pagination on the client side
  const { data, isLoading } = useQuery<PlatformEmployeeResponse>({
    queryKey: ['platform-employees'],
    queryFn: () =>
      apiGet<PlatformEmployeeResponse>(endPoints.PLATFORM_EMPLOYEES.GET_ALL, { limit: 1000 }),
  });

  const allEmployees = useMemo(() => data?.data ?? [], [data?.data]);

  const filteredEmployees = useMemo(() => {
    if (!search) return allEmployees;
    const q = search.toLowerCase();
    return allEmployees.filter((emp) => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const email = (emp.email || '').toLowerCase();
      return fullName.includes(q) || email.includes(q);
    });
  }, [allEmployees, search]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / limit));

  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredEmployees.slice(start, start + limit);
  }, [filteredEmployees, page]);

  const handleDelete = async (emp: PlatformEmployee) => {
    if (!window.confirm(`Delete ${emp.firstName} ${emp.lastName}? This will soft-delete the account.`)) return;
    try {
      await apiDelete(endPoints.PLATFORM_EMPLOYEES.DELETE(emp.id));
      queryClient.invalidateQueries({ queryKey: ['platform-employees'] });
    } catch (err) {
      console.error('Failed to delete platform employee', err);
      alert((err as any)?.response?.data?.message || 'Failed to delete.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Employees"
        icon={Users}
        actions={
          <Button
            onClick={() => navigate('/dashboard/employees/create')}
            variant='header'
           >
            <Plus className="h-4 w-4 mr-2" />
            New platform employee
          </Button>
        }
      />

      <div className="relative flex-1 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-6 py-3 bg-white border border-gray-200 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-gray-700 shadow-sm"
        />
      </div>

      <ShadowCard className="overflow-hidden border border-gray-100 shadow-sm rounded-2xl bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="py-4 px-6 text-nowrap">S.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((emp: PlatformEmployee, index: number) => (
                <TableRow key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="py-4 px-6 font-bold text-gray-400 text-xs">
                    {(((page - 1) * limit) + index + 1).toString().padStart(2, '0')}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {emp.firstName} {emp.lastName}
                  </TableCell>
                  <TableCell className="text-gray-600">{emp.email || 'N/A'}</TableCell>
                  <TableCell className="text-gray-600 text-xs font-semibold">
                    {formatString(emp.role)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(emp.status)}
                  </TableCell>
                  <TableCell className="text-gray-500 font-medium text-xs">
                    {new Date(emp.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(emp)}
                        aria-label="Delete platform employee"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Users className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No platform employees found</p>
                    <p className="text-sm mt-1">Create one to get started</p>
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
          totalItems={filteredEmployees.length}
          itemsPerPage={limit}
        />
      </ShadowCard>


    </div>
  );
};

export default Employees;
