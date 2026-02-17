import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Megaphone, 
  Info, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Bell,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import { ShadowCard } from '../../../ui/ShadowCard';
import { Select } from '../../../ui/Select';
import { apiPost } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import type { CreateNoticeData, Notice } from '../../../types/notice';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../common/PageHeader';

const NOTICE_TYPES = [
  { id: 'announcement', label: 'Announcement', icon: <Megaphone className="h-4 w-4" /> },
  { id: 'update', label: 'Update', icon: <Info className="h-4 w-4" /> },
  { id: 'emergency', label: 'Emergency', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'warning', label: 'Warning', icon: <AlertCircle className="h-4 w-4" /> },
  { id: 'reminder', label: 'Reminder', icon: <Clock className="h-4 w-4" /> },
  { id: 'success', label: 'Success', icon: <CheckCircle className="h-4 w-4" /> },
];

const TARGET_ROLES = [
  { id: 'CLIENT', label: 'Client' },
  { id: 'ORGANIZATION', label: 'Organization' },
];

const CreateNotice: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Split state for date and time
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA')); // Gets YYYY-MM-DD in local time
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));

  const [formData, setFormData] = useState<Omit<CreateNoticeData, 'scheduledAt'>>({
    title: '',
    description: '',
    type: 'announcement',
    targetRoles: [],
  });

  const mutation = useMutation({
    mutationFn: (data: CreateNoticeData) => apiPost<{ success: boolean; data: Notice }>(endPoints.NOTICE.CREATE, data as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      navigate('/dashboard/notice-management');
    },
  });

  const handleSubmit = (status: 'DRAFT' | 'PUBLISHED') => {
    // Combine date and time into ISO string
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    
    mutation.mutate({
      ...formData,
      scheduledAt,
      status
    });
  };

  const toggleRole = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(roleId)
        ? prev.targetRoles.filter(r => r !== roleId)
        : [...prev.targetRoles, roleId]
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Create New Notice" 
        icon={Bell}
        description="Broadcast information to specific user roles across the platform."
      />

      <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <ShadowCard className="p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Notice Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:ring-4 focus:ring-primary/5 rounded-2xl outline-none transition-all font-semibold text-gray-800 text-lg placeholder:text-gray-300"
                  placeholder="Enter a descriptive title for the notice..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Detail Description</label>
                <textarea
                  required
                  rows={6}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:ring-4 focus:ring-primary/5 rounded-2xl outline-none transition-all font-medium text-gray-700 resize-none leading-relaxed placeholder:text-gray-300"
                  placeholder="Provide all the necessary details users need to know..."
                />
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Target Recipient Roles</label>
              <div className="grid grid-cols-2 gap-4">
                {TARGET_ROLES.map(role => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => toggleRole(role.id)}
                    className={`flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-bold transition-all border-2 ${
                      formData.targetRoles.includes(role.id)
                        ? 'bg-primary/5 text-primary border-primary shadow-lg shadow-primary/5'
                        : 'bg-white text-gray-500 border-gray-100 hover:border-primary/20 hover:bg-gray-50'
                    }`}
                  >
                    {role.label}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      formData.targetRoles.includes(role.id) 
                        ? 'bg-primary border-primary' 
                        : 'bg-transparent border-gray-200'
                    }`}>
                      {formData.targetRoles.includes(role.id) && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
              {formData.targetRoles.length === 0 && (
                <p className="text-[10px] text-red-500 font-bold mt-3 ml-1 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" />
                  At least one recipient role must be selected
                </p>
              )}
            </div>
          </ShadowCard>
        </div>

        {/* Right Column - Sidebar Settings */}
        <div className="space-y-6">
          <ShadowCard className="p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm space-y-8">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Notice Category</label>
              <Select
                fullWidth
                label={NOTICE_TYPES.find(t => t.id === formData.type)?.label || 'Select Type'}
                items={NOTICE_TYPES.map(t => ({
                  ...t,
                  onClick: () => setFormData({ ...formData, type: t.id })
                }))}
                className="rounded-2xl border-gray-100 bg-gray-50/50"
              />
            </div>

            <div className="space-y-6 pt-4 border-t border-gray-50">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0 ml-1">Scheduling Options</label>
              
              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter ml-1">Select Date</label>
                  <div className="relative group">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-2xl outline-none font-bold text-gray-700 transition-all appearance-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter ml-1">Select Time</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-2xl outline-none font-bold text-gray-700 transition-all appearance-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 space-y-4">
              <Button
                type="button"
                onClick={() => handleSubmit('PUBLISHED')}
                disabled={mutation.isPending || formData.targetRoles.length === 0 || !formData.title || !formData.description}
                className="w-full py-5 rounded-[20px] font-black text-base bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : 'Publish Broadcast'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit('DRAFT')}
                disabled={mutation.isPending || !formData.title}
                className="w-full py-4 rounded-[20px] font-bold text-sm border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Save as Draft
              </Button>
              <p className="text-[10px] text-center text-gray-400 font-bold mt-4 uppercase tracking-widest">
                This will be visible once scheduled
              </p>
            </div>
          </ShadowCard>

          {/* <div className="p-6 rounded-[32px] bg-amber-50 border-2 border-amber-100 flex gap-4">
            <div className="p-2 h-fit bg-amber-500 rounded-lg">
              <Info className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 mb-1">Important Note</p>
              <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                Notices cannot be edited once published to ensure transparency. Please review all details carefully before broadcasting.
              </p>
            </div>
          </div> */}
        </div>
      </form>
    </div>
  );
};

export default CreateNotice;
