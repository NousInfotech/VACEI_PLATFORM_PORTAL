import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  User, 
  Shield, 
  FileText,
  Activity,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import PageHeader from '../../common/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import { ShadowCard } from '../../../ui/ShadowCard';
import AlertMessage from '../../common/AlertMessage';
import { Skeleton } from '../../../ui/Skeleton';
import { cn } from '../../../lib/utils';

interface TicketUpdateItem {
  id: string;
  title: string | null;
  description: string | null;
  createdAt: string;
  createdBy?: { id: string; firstName: string; lastName: string };
}

interface TicketDetail {
  id: string;
  status: string;
  category: string;
  createdAt: string;
  supportRequest?: { 
    id: string; 
    subject: string; 
    status: string;
    description: string | null;
    user?: { firstName: string; lastName: string; email: string };
    company?: { name: string };
    organization?: { name: string };
  } | null;
  updates?: TicketUpdateItem[];
}

const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [alert, setAlert] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { data: ticketRes, isLoading, error } = useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: () => apiGet<{ data: TicketDetail }>(endPoints.SUPPORT.TICKET_BY_ID(ticketId!)),
    enabled: !!ticketId,
  });

  const createUpdateMutation = useMutation({
    mutationFn: (body: { title?: string; description?: string }) =>
      apiPost<{ data: unknown }>(endPoints.SUPPORT.TICKET_UPDATES(ticketId!), body),
    onSuccess: () => {
      setAlert({ message: 'Communication log added to ticket history.', variant: 'success' });
      setTitle('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (err: any) => {
      setAlert({ message: err?.response?.data?.message ?? 'Failed to add update', variant: 'danger' });
    },
  });

  const ticket = ticketRes?.data;
  const updates = ticket?.updates ?? [];

  const StatusBadge = ({ status }: { status: string }) => {
    let styles = 'bg-gray-100 text-gray-700 border-gray-200';
    const s = status.toUpperCase();

    if (s === 'ACTIVE' || s === 'IN_PROGRESS' || s === 'OPEN') styles = 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'RESOLVED' || s === 'CLOSED') styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'PENDING') styles = 'bg-amber-50 text-amber-700 border-amber-200';

    return (
      <span className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
        styles
      )}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    createUpdateMutation.mutate({
      title: title.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8 pb-10">
        <PageHeader title="Ops Case" icon={Shield} description="Loading case intelligence..." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] md:col-span-1 rounded-4xl" />
          <Skeleton className="h-[600px] md:col-span-2 rounded-4xl" />
        </div>
      </div>
    );
  }

  if (!ticket || error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="p-6 bg-rose-50 rounded-full text-rose-600">
          <Activity className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Ticket Not Found</h2>
        <p className="text-gray-500 max-w-md">The requested operational case could not be retrieved from the intelligence layer.</p>
        <Button variant="default" onClick={() => navigate('/dashboard/ticket-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Command Center
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title={`Case #${ticket.id.slice(0, 8)}`}
        icon={Shield}
        description={ticket.supportRequest?.subject ?? 'Active Operational Ticket'}
        actions={
          <Button variant="header" onClick={() => navigate('/dashboard/ticket-management')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Command Center
          </Button>
        }
      />

      {alert && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertMessage message={alert.message} variant={alert.variant} onClose={() => setAlert(null)} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metadata & Intelligence */}
        <div className="space-y-8">
          <ShadowCard className="p-8 border border-gray-100 shadow-sm rounded-4xl bg-white space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <StatusBadge status={ticket.status} />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">
                  {ticket.category}
                </span>
              </div>

              <div className="h-px bg-gray-50" />

              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    <User className="h-3 w-3 text-primary" />
                    Primary Stakeholder
                  </label>
                  <p className="font-bold text-gray-900">
                    {ticket.supportRequest?.user 
                      ? `${ticket.supportRequest.user.firstName} ${ticket.supportRequest.user.lastName}` 
                      : 'Platform System'}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">{ticket.supportRequest?.user?.email ?? 'Internal Service Only'}</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    <Activity className="h-3 w-3 text-primary" />
                    Related Entity
                  </label>
                  <p className="font-bold text-gray-900">
                    {ticket.supportRequest?.company?.name || ticket.supportRequest?.organization?.name || 'VACEI HQ'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-1.5 py-0.5 bg-gray-100 text-[8px] font-black rounded text-gray-500 uppercase">
                      {ticket.supportRequest?.company ? 'CLIENT' : 'PARTNER'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    <Clock className="h-3 w-3 text-primary" />
                    Operational Logged
                  </label>
                  <p className="font-bold text-gray-900">{new Date(ticket.createdAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}</p>
                  <p className="text-xs text-gray-500 font-medium">{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
          </ShadowCard>

          <ShadowCard className="p-8 bg-primary rounded-4xl text-white space-y-4 shadow-xl shadow-primary/20">
            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-80">
              <ClipboardList className="h-4 w-4" />
              Initial Inquiry
            </h4>
            <div className="space-y-4">
              <p className="text-xl font-bold leading-tight italic">
                "{ticket.supportRequest?.subject}"
              </p>
              <div className="h-px bg-white/20" />
              <p className="text-sm font-medium leading-relaxed opacity-90 line-clamp-6">
                {ticket.supportRequest?.description || 'No descriptive context was provided at the time of intake.'}
              </p>
            </div>
          </ShadowCard>
        </div>

        {/* Right Column: Timeline & Communication */}
        <div className="lg:col-span-2 space-y-8">
          <ShadowCard className="border border-gray-100 shadow-md rounded-4xl bg-white overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-primary">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Case Timeline</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Audit trail & manual logs</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-[500px] custom-scrollbar">
              {updates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Clock className="h-10 w-10" />
                  </div>
                  <p className="font-bold text-gray-900">No Historical Records</p>
                  <p className="text-sm">Initiate the first operational update below.</p>
                </div>
              ) : (
                <div className="relative space-y-12 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
                  {updates.map((u, idx) => (
                    <div key={u.id} className="relative pl-16 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center z-10">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <span className="font-black text-gray-900 text-sm">
                            {u.createdBy ? `${u.createdBy.firstName} ${u.createdBy.lastName}` : 'System Intelligence'}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-200/50">
                            <Clock className="h-3 w-3" />
                            {new Date(u.createdAt).toLocaleString(undefined, { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {u.title && (
                          <h5 className="text-lg font-bold text-primary italic leading-tight">
                            {u.title}
                          </h5>
                        )}
                        <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                          {u.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Response Area */}
            <div className="p-8 bg-gray-50/30 border-t border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Append Update</h4>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-3 text-gray-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium placeholder:text-gray-300"
                      placeholder="Operational Subject (Optional)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <textarea
                      className="w-full bg-white border border-gray-200 rounded-[2rem] p-6 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all min-h-[140px] font-medium placeholder:text-gray-300 custom-scrollbar resize-none"
                      placeholder="Describe the operational progress, resolution steps, or internal notes here..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                    <div className="absolute bottom-6 right-6 flex items-center gap-4">
                      <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-8 py-3 shadow-xl shadow-primary/20 transition-all active:scale-95"
                        disabled={createUpdateMutation.isPending || !description.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Execute Log
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </ShadowCard>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
