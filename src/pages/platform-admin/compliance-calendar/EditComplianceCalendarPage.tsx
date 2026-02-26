import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/input';
import { ShadowCard } from '../../../ui/ShadowCard';
import PageHeader from '../../common/PageHeader';
import { getComplianceCalendar, updateComplianceCalendar } from './complianceCalendarApi';
import { SERVICE_CATEGORIES, FREQUENCIES } from './ComplianceCalendarPage';
import type { 
  ServiceCategory, 
  ComplianceCalendarFrequency, 
  UpdateComplianceCalendarBody 
} from '../../../types/compliance-calendar';

const toDateTimeLocal = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
};

const EditComplianceCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState<ComplianceCalendarFrequency>('YEARLY');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('ACCOUNTING');

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['compliance-calendar', 'detail', id],
    queryFn: () => getComplianceCalendar(id!),
    enabled: !!id,
    retry: 1,
  });

  useEffect(() => {
    if (response?.data) {
      const item = response.data;
      setTitle(item.title);
      setDescription(item.description ?? '');
      setStartDate(toDateTimeLocal(item.startDate));
      setDueDate(toDateTimeLocal(item.dueDate));
      setFrequency(item.frequency);
      setServiceCategory(item.serviceCategory);
    }
  }, [response]);

  const updateMutation = useMutation({
    mutationFn: (body: UpdateComplianceCalendarBody) => updateComplianceCalendar(id!, body),
    onSuccess: () => {
      toast.success('Compliance calendar updated successfully');
      queryClient.invalidateQueries({ queryKey: ['compliance-calendar'] });
      navigate('/dashboard/compliance');
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || 'Failed to update');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateMutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
      startDate: new Date(startDate).toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      frequency,
      serviceCategory,
    });
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-500 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium">Loading entry details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Error" 
          icon={ShieldCheck}
          actions={
            <Button variant="header" onClick={() => navigate('/dashboard/compliance')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          }
        />
        <ShadowCard className="p-8 text-center text-gray-500 font-medium border border-gray-100 shadow-sm rounded-3xl bg-white mx-auto">
          { (error as any)?.message || 'Failed to load compliance calendar details.' }
        </ShadowCard>
      </div>
    );
  }

  if (!response?.data) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Not Found" 
          icon={ShieldCheck}
          actions={
            <Button variant="header" onClick={() => navigate('/dashboard/compliance')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          }
        />
        <ShadowCard className="p-8 text-center text-gray-500 font-medium border border-gray-100 shadow-sm rounded-3xl bg-white mx-auto">
          The requested compliance calendar entry could not be found.
        </ShadowCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Compliance Calendar Entry"
        icon={ShieldCheck}
        description="Modify an existing global compliance deadline."
        actions={
          <Button variant="header" onClick={() => navigate('/dashboard/compliance')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <ShadowCard className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual filing deadline"
                required
                className="rounded-2xl py-6 px-4 border-gray-200 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about this compliance requirement..."
                rows={4}
                className="flex w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:border-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Start Date *</label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="rounded-2xl py-6 px-4 border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Due Date *</label>
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="rounded-2xl py-6 px-4 border-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Frequency *</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as ComplianceCalendarFrequency)}
                  className="flex h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 py-1 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:border-primary/20 appearance-none font-medium"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Service Category *</label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                  className="flex h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 py-1 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:border-primary/20 appearance-none font-medium"
                >
                  {SERVICE_CATEGORIES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={updateMutation.isPending || !title.trim()}
              className="px-12 rounded-2xl"
            >
              {updateMutation.isPending ? 'Saving...' : 'Update Entry'}
            </Button>
          </div>
        </form>
      </ShadowCard>
    </div>
  );
};

export default EditComplianceCalendarPage;
