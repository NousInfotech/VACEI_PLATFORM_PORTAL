import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Megaphone, 
  Info, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Bell,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import { ShadowCard } from '../../../ui/ShadowCard';
import { Select } from '../../../ui/Select';
import { apiGet, apiPut, apiPatch } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import type { Notice, NoticeListResponse, UpdateNoticeData } from '../../../types/notice';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../common/PageHeader';
import { Skeleton } from '../../../ui/Skeleton';

const NOTICE_TYPES: { id: string; label: string; icon: React.ReactNode }[] = [
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

interface NoticeEditorProps {
  id: string;
  notice: Notice;
}

const NoticeEditor: React.FC<NoticeEditorProps> = ({ id, notice }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [date, setDate] = useState(() => {
    if (notice.scheduledAt) {
      const scheduledDate = new Date(notice.scheduledAt);
      if (!isNaN(scheduledDate.getTime())) {
        return scheduledDate.toISOString().split('T')[0];
      }
    }
    return "";
  });

  const [time, setTime] = useState(() => {
    if (notice.scheduledAt) {
      const scheduledDate = new Date(notice.scheduledAt);
      if (!isNaN(scheduledDate.getTime())) {
        return scheduledDate.toTimeString().split(' ')[0].substring(0, 5);
      }
    }
    return "";
  });

  const [formData, setFormData] = useState<Omit<UpdateNoticeData, 'scheduledAt'> & { targetRoles: string[], type: string }>({
    title: notice.title || '',
    description: notice.description || '',
    type: notice.type || 'announcement',
    targetRoles: notice.targetRoles || [],
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateNoticeData) => apiPut<{ success: boolean; data: Notice }>(endPoints.NOTICE.UPDATE(id), data as unknown as Record<string, unknown>),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => apiPatch(endPoints.NOTICE.PATCH_STATUS(id), { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['notice', id] });
      navigate('/dashboard/notice-management');
    },
  });

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    
    mutation.mutate({
      ...formData,
      scheduledAt
    }, {
      onSuccess: () => {
        if (status === 'PUBLISHED' || notice.status !== status) {
          statusMutation.mutate(status);
        } else {
          queryClient.invalidateQueries({ queryKey: ['notices'] });
          navigate('/dashboard/notice-management');
        }
      }
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
    <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
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
          </div>
        </ShadowCard>
      </div>

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
                  Updating...
                </div>
              ) : 'Update Broadcast'}
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
          </div>
        </ShadowCard>
      </div>
    </form>
  );
};

const EditNotice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  // Try to find the notice in the list cache first for instant loading
  const cachedNotice = queryClient.getQueryData<NoticeListResponse>(['notices'])?.data.find(n => n.id === id);

  const { data: noticeResponse, isLoading: isLoadingNotice } = useQuery<{ success: boolean; data: Notice }>({
    queryKey: ['notice', id],
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; data: Notice }>(endPoints.NOTICE.GET_BY_ID(id!));
      // Handle both { success, data } and direct notice response
      if (response && response.data) return response;
      return { success: true, data: response as unknown as Notice };
    },
    initialData: cachedNotice ? { success: true, data: cachedNotice } : undefined,
    enabled: !!id,
  });

  if (isLoadingNotice) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[500px] rounded-[32px]" />
          <Skeleton className="h-[400px] rounded-[32px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto">
      <PageHeader 
        title="Edit Notice" 
        icon={Bell}
        description="Modify the details of your scheduled broadcast."
      />

      {noticeResponse?.data ? (
        <NoticeEditor 
          key={noticeResponse.data.id} 
          id={id!} 
          notice={noticeResponse.data} 
        />
      ) : (
        <div className="p-8 text-center text-gray-500">
           Notice not found.
        </div>
      )}
    </div>
  );
};

export default EditNotice;
