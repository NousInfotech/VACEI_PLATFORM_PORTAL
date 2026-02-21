import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { ShadowCard } from '../../../ui/ShadowCard';
import { Input } from '../../../ui/input';
import type {
  ComplianceCalendar,
  CreateComplianceCalendarBody,
  ServiceCategory,
  ComplianceCalendarFrequency,
} from '../../../types/compliance-calendar';

interface ComplianceCalendarFormModalProps {
  initial: ComplianceCalendar | null;
  onClose: () => void;
  onSubmit: (values: CreateComplianceCalendarBody) => void;
  loading: boolean;
  serviceCategories: { value: ServiceCategory; label: string }[];
  frequencies: { value: ComplianceCalendarFrequency; label: string }[];
}

const toDateInput = (iso: string) => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const toDateTimeLocal = (iso: string) => {
  const d = new Date(iso);
  const date = toDateInput(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${date}T${h}:${min}`;
};

export const ComplianceCalendarFormModal: React.FC<ComplianceCalendarFormModalProps> = ({
  initial,
  onClose,
  onSubmit,
  loading,
  serviceCategories,
  frequencies,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState<ComplianceCalendarFrequency>('YEARLY');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('ACCOUNTING');

  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description ?? '');
      setStartDate(toDateTimeLocal(initial.startDate));
      setDueDate(toDateTimeLocal(initial.dueDate));
      setFrequency(initial.frequency);
      setServiceCategory(initial.serviceCategory);
    } else {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      setStartDate(toDateTimeLocal(start.toISOString()));
      setDueDate(toDateTimeLocal(end.toISOString()));
    }
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const start = new Date(startDate).toISOString();
    const due = new Date(dueDate).toISOString();
    onSubmit({
      type: 'GLOBAL',
      companyId: null,
      title: title.trim(),
      description: description.trim() || null,
      startDate: start,
      dueDate: due,
      frequency,
      serviceCategory,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <ShadowCard className="w-full max-w-lg bg-white rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Edit compliance calendar entry' : 'Create compliance calendar entry'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg" disabled={loading}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-gray-500 font-medium">
            Platform entries are global (not tied to a company).
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual filing deadline"
              required
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
              className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start date *</label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Due date *</label>
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Frequency *</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as ComplianceCalendarFrequency)}
                className="flex h-9 w-full rounded-xl border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                {frequencies.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Service category *</label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                className="flex h-9 w-full rounded-xl border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                {serviceCategories.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="header" disabled={loading || !title.trim()}>
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </ShadowCard>
    </div>
  );
};
