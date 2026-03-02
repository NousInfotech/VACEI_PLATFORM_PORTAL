import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  CheckCircle,
  ListChecks,
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import PageHeader from '../../common/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import { ShadowCard } from '../../../ui/ShadowCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/Table';
import AlertMessage from '../../common/AlertMessage';

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

  const { data: requestsRes, isLoading: loadingRequests } = useQuery({
    queryKey: ['support-requests'],
    queryFn: () => apiGet<{ data: SupportRequestRow[]; meta?: { total: number } }>(endPoints.SUPPORT.SUPPORT_REQUESTS, { limit: 100 }),
  });

  const { data: ticketsRes, isLoading: loadingTickets } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => apiGet<{ data: TicketRow[]; meta?: { total: number } }>(endPoints.SUPPORT.TICKETS, { limit: 100 }),
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

  const patchTicketMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch(endPoints.SUPPORT.PATCH_TICKET(id), { status }),
    onSuccess: () => {
      setAlert({ message: 'Ticket status updated', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (err: any) => {
      setAlert({ message: err?.response?.data?.message ?? 'Failed to update ticket', variant: 'danger' });
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
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRequests.map((r: SupportRequestRow) => (
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
                      className="bg-primary hover:bg-primary/90 text-white"
                      disabled={acceptMutation.isPending}
                      onClick={() => acceptMutation.mutate(r.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ShadowCard>

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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTickets.map((t: TicketRow) => (
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
                    <select
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary/20 mr-2"
                      value={t.status}
                      onChange={(e) => patchTicketMutation.mutate({ id: t.id, status: e.target.value })}
                      disabled={patchTicketMutation.isPending}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/dashboard/ticket-management/${t.id}`)}
                    >
                      View / Add update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ShadowCard>
    </div>
  );
};

export default TicketManagement;
