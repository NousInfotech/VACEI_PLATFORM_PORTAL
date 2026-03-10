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
import { Skeleton } from '../../../ui/Skeleton';

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
    queryFn: () => apiGet<{ data: SupportRequestRow[]; meta?: { total: number } }>(endPoints.SUPPORT.SUPPORT_REQUESTS, { limit: 100 }),
    refetchInterval: 5000,
  });

  const { data: ticketsRes, isLoading: loadingTickets } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => apiGet<{ data: TicketRow[]; meta?: { total: number } }>(endPoints.SUPPORT.TICKETS, { limit: 100 }),
    refetchInterval: 10000,
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

  const activeTickets = tickets.filter((t: TicketRow) => t.status === 'ACTIVE' || t.status === 'IN_PROGRESS');
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

  const StatusBadge = ({ status, type }: { status: string; type: 'ticket' | 'request' }) => {
    let styles = 'bg-gray-100 text-gray-700 border-gray-200';
    const s = status.toUpperCase();

    if (type === 'request') {
      if (s === 'PENDING') styles = 'bg-amber-50 text-amber-700 border-amber-200';
      if (s === 'ACCEPTED') styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (s === 'REJECTED') styles = 'bg-rose-50 text-rose-700 border-rose-200';
    } else {
      if (s === 'ACTIVE' || s === 'IN_PROGRESS') styles = 'bg-blue-50 text-blue-700 border-blue-200';
      if (s === 'RESOLVED' || s === 'CLOSED') styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (s === 'PENDING') styles = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Service Operations"
        icon={ListChecks}
        description="Manage support intake and active helpdesk tickets across the platform."
      />

      {alert && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertMessage message={alert.message} variant={alert.variant} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-linear-to-br from-amber-50 to-white p-6 rounded-3xl border border-amber-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-amber-200 text-amber-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900/60 uppercase tracking-wider text-[11px]">Pending Requests</p>
              <h4 className="text-3xl font-black text-amber-900">{pendingRequests.length}</h4>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-white p-6 rounded-3xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-blue-200 text-blue-600">
              <ListChecks className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900/60 uppercase tracking-wider text-[11px]">Active Tickets</p>
              <h4 className="text-3xl font-black text-blue-900">{activeTickets.length}</h4>
            </div>
          </div>
        </div>

        {/* <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-emerald-200 text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900/60 uppercase tracking-wider text-[11px]">Daily Throughput</p>
              <h4 className="text-3xl font-black text-emerald-900">High</h4>
            </div>
          </div>
        </div> */}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Support Requests Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Pending Support Requests</h2>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-fit">
              <button
                onClick={() => setRequestsTab('company')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${requestsTab === 'company' ? 'bg-white text-primary shadow-sm scale-105' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Clients
              </button>
              <button
                onClick={() => setRequestsTab('organization')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${requestsTab === 'organization' ? 'bg-white text-primary shadow-sm scale-105' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Partners
              </button>
            </div>
          </div>

          <ShadowCard className="overflow-hidden border border-gray-100 shadow-md rounded-[2.5rem] bg-white">
            <div>
              {loadingRequests ? (
                <div className="p-10 space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                </div>
              ) : displayRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
                  <div className="p-6 bg-gray-50 rounded-full">
                    <CheckCircle className="h-12 w-12 opacity-20" />
                  </div>
                  <p className="font-semibold text-lg">Inbox Zero</p>
                  <p className="text-sm">All {requestsTab} requests have been processed.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="border-none">
                      <TableHead className="py-5 px-6 text-gray-400 uppercase tracking-widest text-[10px] font-black">Submitting User</TableHead>
                      <TableHead className="text-gray-400 uppercase tracking-widest text-[10px] font-black">Entity</TableHead>
                      <TableHead className="text-gray-400 uppercase tracking-widest text-[10px] font-black">Inquiry Subject</TableHead>
                      <TableHead className="text-gray-400 uppercase tracking-widest text-[10px] font-black">Status</TableHead>
                      <TableHead className="text-gray-400 uppercase tracking-widest text-[10px] font-black">Date</TableHead>
                      <TableHead className="text-right px-6 text-gray-400 uppercase tracking-widest text-[10px] font-black">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRequests.map((r: SupportRequestRow) => (
                      <TableRow key={r.id} className="group hover:bg-gray-50/30 transition-colors border-b border-gray-50 last:border-none">
                        <TableCell className="py-5 px-6 font-bold text-gray-900">{userName(r)}</TableCell>
                        <TableCell className="text-gray-600 font-medium">{companyOrOrgName(r)}</TableCell>
                        <TableCell className="font-semibold text-primary/80 italic">"{r.subject}"</TableCell>
                        <TableCell><StatusBadge status={r.status} type="request" /></TableCell>
                        <TableCell className="text-gray-500 font-medium">{new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                        <TableCell className="text-right px-6">
                          <div className="flex justify-end items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl border-gray-200 hover:bg-white hover:text-primary hover:border-primary/20 shadow-sm"
                              onClick={() => setDetailModalRequest(r)}
                            >
                              Details
                            </Button>
                            <div className="h-8 w-px bg-gray-100 mx-1" />
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
                              disabled={acceptMutation.isPending || rejectMutation.isPending}
                              onClick={() => acceptMutation.mutate(r.id)}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-xl"
                              disabled={acceptMutation.isPending || rejectMutation.isPending}
                              onClick={() => rejectMutation.mutate(r.id)}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1.5" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            
            {displayRequests.length > 0 && (
              <div className="p-6 border-t border-gray-50 bg-gray-50/20">
                <Pagination 
                  currentPage={requestsPage}
                  totalPages={totalRequestsPages}
                  onPageChange={setRequestsPage}
                  totalItems={displayRequests.length}
                  itemsPerPage={limit}
                />
              </div>
            )}
          </ShadowCard>
        </section>

        {/* Tickets Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600/10 text-blue-600 rounded-xl">
                <ListChecks className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Tickets</h2>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 w-fit">
              <button
                onClick={() => setTicketsTab('company')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${ticketsTab === 'company' ? 'bg-white text-blue-600 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Clients
              </button>
              <button
                onClick={() => setTicketsTab('organization')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${ticketsTab === 'organization' ? 'bg-white text-blue-600 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Partners
              </button>
            </div>
          </div>

          <ShadowCard className="overflow-hidden border border-gray-100 shadow-md rounded-[2.5rem] bg-white">
            <div>
              {loadingTickets ? (
                <div className="p-10 space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                </div>
              ) : displayTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3 text-center">
                  <div className="p-6 bg-gray-50 rounded-full">
                    <ListChecks className="h-12 w-12 opacity-20" />
                  </div>
                  <p className="font-semibold text-lg">No Active Tickets</p>
                  <p className="text-sm">There are no support tickets in the current pipeline.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="border-none">
                      <TableHead className="py-5 px-6 text-gray-400 uppercase tracking-widest text-[10px] font-black">Primary User</TableHead>
                      <TableHead className="text-gray-400 uppercase tracking-widest text-[10px] font-black">Related Entity</TableHead>
                      <TableHead className="text-gray-400 uppercase tracking-widest text-[10px] font-black">Ticket Subject</TableHead>
                      <TableHead className="text-gray-400 uppercase tracking-widest text-[10px] font-black">Status</TableHead>
                      <TableHead className="text-gray-400 uppercase tracking-widest text-[10px] font-black">Created</TableHead>
                      <TableHead className="text-right px-6 text-gray-400 uppercase tracking-widest text-[10px] font-black">Control</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTickets.map((t: TicketRow) => (
                      <TableRow key={t.id} className="group hover:bg-gray-50/30 transition-colors border-b border-gray-50 last:border-none">
                        <TableCell className="py-5 px-6 font-bold text-gray-900">{ticketUserName(t)}</TableCell>
                        <TableCell className="text-gray-600 font-medium">{ticketCompanyOrOrgName(t)}</TableCell>
                        <TableCell className="font-semibold text-blue-900/70 truncate max-w-[200px]">
                          {t.supportRequest?.subject ?? 'Service Extension'}
                        </TableCell>
                        <TableCell><StatusBadge status={t.status} type="ticket" /></TableCell>
                        <TableCell className="text-gray-500 font-medium">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right px-6">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/dashboard/ticket-management/${t.id}`)}
                          >
                            View Ticket
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {displayTickets.length > 0 && (
              <div className="p-6 border-t border-gray-50 bg-gray-50/20">
                <Pagination 
                  currentPage={ticketsPage}
                  totalPages={totalTicketsPages}
                  onPageChange={setTicketsPage}
                  totalItems={displayTickets.length}
                  itemsPerPage={limit}
                />
              </div>
            )}
          </ShadowCard>
        </section>
      </div>

      {/* Detail Modal */}
      {detailModalRequest && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-6 bg-gray-950/40 backdrop-blur-[2px] animate-in fade-in duration-300" 
          onClick={() => setDetailModalRequest(null)}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-8 pb-4 border-b border-gray-100 flex items-center justify-between bg-linear-to-r from-gray-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Request Analytics</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inquiry Details & Assets</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setDetailModalRequest(null)} 
                className="p-2.5 text-gray-400 hover:text-rose-600 rounded-2xl hover:bg-rose-50 transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8 pt-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-4xl border border-gray-100">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Submitted By</label>
                  <p className="font-bold text-gray-900">{userName(detailModalRequest)}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Origin</label>
                  <p className="font-bold text-gray-900">{companyOrOrgName(detailModalRequest)}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    <FileText className="h-3 w-3 text-primary" />
                    Subject Matter
                  </label>
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-lg font-bold text-primary italic leading-tight">
                      "{detailModalRequest.subject}"
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Inquiry Description</label>
                  <div className="prose prose-sm max-w-none text-gray-700 bg-white p-6 rounded-3xl border border-gray-100 leading-relaxed min-h-[100px]">
                    {detailModalRequest.description || 'No descriptive context provided by the user.'}
                  </div>
                </div>

                {detailModalRequest.attachments && detailModalRequest.attachments.length > 0 && (
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                      <ExternalLink className="h-3 w-3 text-emerald-500" />
                      Supporting Documents ({detailModalRequest.attachments.length})
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {detailModalRequest.attachments.map((a) => (
                        <a 
                          key={a.id}
                          href={a.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
                              <FileText className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-bold text-emerald-900">{a.file_name}</span>
                          </div>
                          <ExternalLink className="h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-all" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 pt-0 flex justify-end gap-3 mt-4">
               <Button
                variant="outline"
                className="rounded-2xl border-gray-200 px-8 font-bold"
                onClick={() => setDetailModalRequest(null)}
              >
                Dismiss
              </Button>
              <Button
                className="bg-primary text-white hover:bg-primary/90 rounded-2xl px-10 font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all"
                onClick={() => {
                  acceptMutation.mutate(detailModalRequest.id);
                  setDetailModalRequest(null);
                }}
              >
                Approve & Tokenize
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketManagement;
