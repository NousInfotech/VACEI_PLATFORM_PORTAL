import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  CheckCircle,
  ListChecks,
  XCircle,
  X,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import PageHeader from '../../common/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import { ShadowCard } from '../../../ui/ShadowCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/Table';
import AlertMessage from '../../common/AlertMessage';
import Pagination from '../../common/Pagination';

interface SupportRequestRow {
  id: string;
  subject: string;
  description: string | null;
  status: string;
  createdAt: string;
  companyId: string | null;
  organizationId: string | null;
  user?: { id: string; firstName: string; lastName: string; email?: string | null };
  company?: { id: string; name: string } | null;
  organization?: { id: string; name: string } | null;
  attachments?: { id: string; file_name: string; url?: string }[];
}

interface TicketRow {
  id: string;
  supportRequestId: string | null;
  category: string;
  status: string;
  createdAt: string;
  supportRequest?: {
    subject: string;
    companyId?: string | null;
    organizationId?: string | null;
    user?: { id: string; firstName: string; lastName: string };
    company?: { id: string; name: string } | null;
    organization?: { id: string; name: string } | null;
  } | null;
}

type TabType = 'company' | 'organization';

const TicketManagement: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [alert, setAlert] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null);
  const [requestsTab, setRequestsTab] = useState<TabType>('company');
  const [ticketsTab, setTicketsTab] = useState<TabType>('company');
  const [detailModalRequest, setDetailModalRequest] = useState<SupportRequestRow | null>(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const requestsPage = parseInt(searchParams.get('rpage') || '1', 10);
  const ticketsPage = parseInt(searchParams.get('tpage') || '1', 10);
  
  const setRequestsPage = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('rpage', String(newPage));
    setSearchParams(nextParams);
  };
  
  const setTicketsPage = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tpage', String(newPage));
    setSearchParams(nextParams);
  };
  
  const limit = 10;

  const { data: requestsRes, isLoading: loadingRequests } = useQuery({
    queryKey: ['support-requests'],
    queryFn: () => apiGet<{ data: SupportRequestRow[]; meta?: { total: number } }>(endPoints.SUPPORT.SUPPORT_REQUESTS, { limit: 1000 }),
  });

  const { data: ticketsRes, isLoading: loadingTickets } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => apiGet<{ data: TicketRow[]; meta?: { total: number } }>(endPoints.SUPPORT.TICKETS, { limit: 1000 }),
  });

  const acceptMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const req = (requestsRes?.data ?? []).find((r: SupportRequestRow) => r.id === requestId);
      const category = req?.organizationId ? 'PARTNER_PORTAL' : 'CLIENT_PORTAL';
      await apiPatch(endPoints.SUPPORT.PATCH_SUPPORT_REQUEST(requestId), { status: 'ACCEPTED' });
      await apiPost(endPoints.SUPPORT.TICKETS, { supportRequestId: requestId, category });
    },
    onSuccess: () => {
      setAlert({ message: 'Support request accepted and ticket created', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (err: any) => {
      setAlert({ message: err?.response?.data?.message ?? 'Failed to accept request', variant: 'danger' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) =>
      apiPatch(endPoints.SUPPORT.PATCH_SUPPORT_REQUEST(requestId), { status: 'REJECTED' }),
    onSuccess: () => {
      setAlert({ message: 'Support request rejected', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
    },
    onError: (err: any) => {
      setAlert({ message: err?.response?.data?.message ?? 'Failed to reject request', variant: 'danger' });
    },
  });

  const requests = requestsRes?.data ?? [];
  const tickets = ticketsRes?.data ?? [];

  const pendingRequests = requests.filter((r: SupportRequestRow) => r.status === 'PENDING');
  const pendingCompany = pendingRequests.filter((r: SupportRequestRow) => r.companyId != null);
  const pendingOrganization = pendingRequests.filter((r: SupportRequestRow) => r.organizationId != null);

  const ticketsCompany = tickets.filter((t: TicketRow) => t.supportRequest?.companyId != null);
  const ticketsOrganization = tickets.filter((t: TicketRow) => t.supportRequest?.organizationId != null);

  const displayRequests = requestsTab === 'company' ? pendingCompany : pendingOrganization;
  const displayTickets = ticketsTab === 'company' ? ticketsCompany : ticketsOrganization;

  const paginatedRequests = displayRequests.slice((requestsPage - 1) * limit, requestsPage * limit);
  const paginatedTickets = displayTickets.slice((ticketsPage - 1) * limit, ticketsPage * limit);
  
  const totalRequestsPages = Math.ceil(displayRequests.length / limit);
  const totalTicketsPages = Math.ceil(displayTickets.length / limit);

  const userName = (r: SupportRequestRow) =>
    r.user ? [r.user.firstName, r.user.lastName].filter(Boolean).join(' ') || r.user.email || '—' : '—';
  const companyOrOrgName = (r: SupportRequestRow) =>
    r.companyId && r.company ? r.company.name : r.organizationId && r.organization ? r.organization.name : '—';

  const ticketUserName = (t: TicketRow) => {
    const u = t.supportRequest?.user;
    return u ? [u.firstName, u.lastName].filter(Boolean).join(' ') || '—' : '—';
  };
  const ticketCompanyOrOrgName = (t: TicketRow) => {
    const sr = t.supportRequest;
    if (!sr) return '—';
    if (sr.company) return sr.company.name;
    if (sr.organization) return sr.organization.name;
    return '—';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ticket Management"
        icon={ListChecks}
        description="Accept support requests and manage tickets."
      />

      {alert && (
        <AlertMessage message={alert.message} variant={alert.variant} onClose={() => setAlert(null)} />
      )}

      <ShadowCard className="p-6 border border-gray-100 shadow-sm rounded-3xl bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Pending Support Requests
          </h2>
          <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
            <button
              type="button"
              onClick={() => setRequestsTab('company')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${requestsTab === 'company' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Company
            </button>
            <button
              type="button"
              onClick={() => setRequestsTab('organization')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${requestsTab === 'organization' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Organization
            </button>
          </div>
        </div>
        {loadingRequests ? (
          <p className="py-6 text-gray-500">Loading...</p>
        ) : displayRequests.length === 0 ? (
          <p className="py-6 text-gray-500">No pending {requestsTab === 'company' ? 'company' : 'organization'} support requests.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Company | Organization</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.map((r: SupportRequestRow) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-gray-900">{userName(r)}</TableCell>
                  <TableCell className="text-gray-700">{companyOrOrgName(r)}</TableCell>
                  <TableCell className="font-medium">{r.subject}</TableCell>
                  <TableCell>
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {r.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      onClick={() => setDetailModalRequest(r)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white mr-2"
                      disabled={acceptMutation.isPending || rejectMutation.isPending}
                      onClick={() => acceptMutation.mutate(r.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      disabled={acceptMutation.isPending || rejectMutation.isPending}
                      onClick={() => rejectMutation.mutate(r.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Pagination 
          currentPage={requestsPage}
          totalPages={totalRequestsPages}
          onPageChange={setRequestsPage}
          totalItems={displayRequests.length}
          itemsPerPage={limit}
        />
      </ShadowCard>

      {/* Support request detail modal - 60% width, subject + description + attachments */}
      {detailModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => setDetailModalRequest(null)}>
          <div className="w-[60%] max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Support request details</h3>
              <button type="button" onClick={() => setDetailModalRequest(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Subject</p>
                <p className="font-medium text-gray-900">{detailModalRequest.subject}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Description</p>
                <p className="text-gray-700 whitespace-pre-wrap">{detailModalRequest.description || '—'}</p>
              </div>
              {(detailModalRequest.attachments?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> Attachments
                  </p>
                  <ul className="space-y-1">
                    {detailModalRequest.attachments!.map((a) => (
                      <li key={a.id}>
                        <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                          {a.file_name}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ShadowCard className="p-6 border border-gray-100 shadow-sm rounded-3xl bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Tickets
          </h2>
          <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
            <button
              type="button"
              onClick={() => setTicketsTab('company')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${ticketsTab === 'company' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Company
            </button>
            <button
              type="button"
              onClick={() => setTicketsTab('organization')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${ticketsTab === 'organization' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Organization
            </button>
          </div>
        </div>
        {loadingTickets ? (
          <p className="py-6 text-gray-500">Loading...</p>
        ) : displayTickets.length === 0 ? (
          <p className="py-6 text-gray-500">No {ticketsTab === 'company' ? 'company' : 'organization'} tickets yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Company | Organization</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTickets.map((t: TicketRow) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-gray-900">{ticketUserName(t)}</TableCell>
                  <TableCell className="text-gray-700">{ticketCompanyOrOrgName(t)}</TableCell>
                  <TableCell className="font-medium">{t.supportRequest?.subject ?? '—'}</TableCell>
                  <TableCell>{t.category?.replace('_', ' ') ?? '—'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'bg-green-100 text-green-800' :
                      t.status === 'ACTIVE' || t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {t.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/dashboard/ticket-management/${t.id}`)}
                    >
                      View ticket
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Pagination 
          currentPage={ticketsPage}
          totalPages={totalTicketsPages}
          onPageChange={setTicketsPage}
          totalItems={displayTickets.length}
          itemsPerPage={limit}
        />
      </ShadowCard>
    </div>
  );
};

export default TicketManagement;
