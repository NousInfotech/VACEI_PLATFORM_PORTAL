import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/input';
import { ShadowCard } from '../../../ui/ShadowCard';
import PageHeader from '../../common/PageHeader';
import { createComplianceCalendar } from './complianceCalendarApi';
import { SERVICE_CATEGORIES, FREQUENCIES } from './ComplianceCalendarPage';
import type { ServiceCategory, ComplianceCalendarFrequency, CreateComplianceCalendarBody } from '../../../types/compliance-calendar';

const toDateTimeLocal = (iso: string) => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
};

const CreateComplianceCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  const [startDate, setStartDate] = useState(toDateTimeLocal(start.toISOString()));
  const [dueDate, setDueDate] = useState(toDateTimeLocal(end.toISOString()));
  const [frequency, setFrequency] = useState<ComplianceCalendarFrequency>('YEARLY');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('ACCOUNTING');

  const createMutation = useMutation({
    mutationFn: (body: CreateComplianceCalendarBody) => createComplianceCalendar(body),
    onSuccess: () => {
      toast.success('Compliance calendar created successfully');
      queryClient.invalidateQueries({ queryKey: ['compliance-calendar'] });
      navigate('/dashboard/compliance-calendar');
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || 'Failed to create');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    createMutation.mutate({
      type: 'GLOBAL',
      companyId: null,
      title: title.trim(),
      description: description.trim() || null,
      startDate: new Date(startDate).toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      frequency,
      serviceCategory,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Compliance Calendar Entry"
        icon={ShieldCheck}
        description="Add a new platform-wide compliance deadline."
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
              disabled={createMutation.isPending || !title.trim()}
              className="px-12 rounded-2xl"
            >
              {createMutation.isPending ? 'Saving...' : 'Create Entry'}
            </Button>
          </div>
        </form>
      </ShadowCard>
    </div>
  );
};

export default CreateComplianceCalendarPage;
