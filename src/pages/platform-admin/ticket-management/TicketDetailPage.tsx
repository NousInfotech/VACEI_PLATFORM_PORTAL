import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { Button } from '../../../ui/Button';
import PageHeader from '../../common/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import { ShadowCard } from '../../../ui/ShadowCard';
import AlertMessage from '../../common/AlertMessage';

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
  supportRequest?: { id: string; subject: string; status: string } | null;
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
      setAlert({ message: 'Update added', variant: 'success' });
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

  if (!ticketId) {
    return (
      <div className="space-y-6">
        <p className="text-gray-500">Missing ticket ID.</p>
        <Button variant="outline" onClick={() => navigate('/dashboard/ticket-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to tickets
        </Button>
      </div>
    );
  }

  if (isLoading || !ticket) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ticket" icon={MessageSquare} description="Loading..." />
        <p className="text-gray-500">{error ? 'Failed to load ticket.' : 'Loading...'}</p>
        <Button variant="outline" onClick={() => navigate('/dashboard/ticket-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  const updates = ticket.updates ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUpdateMutation.mutate({
      title: title.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ticket"
        icon={MessageSquare}
        description={ticket.supportRequest?.subject ?? 'Support ticket'}
        actions={
          <Button variant="outline" onClick={() => navigate('/dashboard/ticket-management')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to tickets
          </Button>
        }
      />

      {alert && (
        <AlertMessage message={alert.message} variant={alert.variant} onClose={() => setAlert(null)} />
      )}

      <ShadowCard className="p-6 border border-gray-100 shadow-sm rounded-3xl bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Subject</p>
            <p className="font-medium text-gray-900">{ticket.supportRequest?.subject ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Status</p>
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
              ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'bg-green-100 text-green-800' :
              ticket.status === 'ACTIVE' || ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {ticket.status}
            </span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-700 mb-3">Updates</h3>
        {updates.length === 0 ? (
          <p className="text-gray-500 py-4">No updates yet. Add one below.</p>
        ) : (
          <ul className="space-y-4 mb-6">
            {updates.map((u) => (
              <li key={u.id} className="border-l-2 border-primary/30 pl-4 py-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span className="font-medium text-gray-700">
                    {u.createdBy ? [u.createdBy.firstName, u.createdBy.lastName].filter(Boolean).join(' ') : 'Unknown'}
                  </span>
                  <span>{new Date(u.createdAt).toLocaleString()}</span>
                </div>
                {u.title && <p className="font-medium text-gray-900">{u.title}</p>}
                {u.description && <p className="text-gray-700 whitespace-pre-wrap">{u.description}</p>}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-700">Add update</h3>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Title (optional)</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Brief title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px]"
              placeholder="Your message..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={createUpdateMutation.isPending || !description.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            Add update
          </Button>
        </form>
      </ShadowCard>
    </div>
  );
};

export default TicketDetailPage;
