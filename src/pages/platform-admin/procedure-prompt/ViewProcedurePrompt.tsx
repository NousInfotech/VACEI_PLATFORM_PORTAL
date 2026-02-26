import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  MessageSquare, 
  ArrowLeft, 
  Globe, 
  Building, 
  Type, 
  FileText,
  Layers,
  Tag,
  Edit2
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import PageHeader from '../../common/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import { ShadowCard } from '../../../ui/ShadowCard';
import { Skeleton } from '../../../ui/Skeleton';
import type { ProcedurePrompt } from '../../../types/procedure-prompt';

const ViewProcedurePrompt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: promptData, isLoading: isPromptLoading } = useQuery({
    queryKey: ['procedure-prompt', id],
    queryFn: () => apiGet<{ data: ProcedurePrompt }>(endPoints.PROCEDURE_PROMPT.GET_BY_ID(id!)),
    enabled: !!id,
  });

  const prompt = promptData?.data;

  if (isPromptLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="View Procedure Prompt" icon={MessageSquare} />
        <ShadowCard className="p-8 border border-gray-100 shadow-sm rounded-3xl bg-white mx-auto space-y-6">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </ShadowCard>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Prompt Not Found" 
          icon={MessageSquare}
          actions={
            <Button variant="header" onClick={() => navigate('/dashboard/procedure-prompts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          }
        />
        <ShadowCard className="p-8 text-center text-gray-500 font-medium border border-gray-100 shadow-sm rounded-3xl bg-white mx-auto">
          The requested procedure prompt could not be found.
        </ShadowCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Procedure Prompt Details" 
        icon={MessageSquare}
        description="View the full details of this AI procedure prompt."
        actions={
          <div className="flex gap-2">
            <Button variant="header" onClick={() => navigate('/dashboard/procedure-prompts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="header" onClick={() => navigate(`/dashboard/procedure-prompts/${id}/edit`)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Prompt
            </Button>
          </div>
        }
      />

      <ShadowCard className="p-8 border border-gray-100 shadow-sm rounded-3xl bg-white mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Type className="h-3 w-3" />
              Prompt Title
            </label>
            <p className="text-lg font-bold text-gray-900 leading-tight">
              {prompt.title}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Globe className="h-3 w-3" />
              Scope Type
            </label>
            <div className="flex items-center gap-2.5">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                prompt.scopeType === 'GLOBAL' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
              }`}>
                {prompt.scopeType === 'GLOBAL' ? <Globe className="h-3.5 w-3.5" /> : <Building className="h-3.5 w-3.5" />}
                {prompt.scopeType}
              </div>
              {prompt.organization?.name && (
                <span className="text-sm font-semibold text-gray-600">
                  - {prompt.organization.name}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-3 w-3" />
              Procedure Type
            </label>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border bg-amber-50 text-amber-600 border-amber-100">
              <Layers className="h-3.5 w-3.5" />
              {prompt.procedureType}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-3 w-3" />
              Category
            </label>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border bg-green-50 text-green-600 border-green-100">
              <Tag className="h-3.5 w-3.5" />
              {prompt.category}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-3 w-3" />
            Description
          </label>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-gray-700 font-medium leading-relaxed">
            {prompt.description || 'No description provided'}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="h-3 w-3" />
            Prompt Text
          </label>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-emerald-400 font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-inner h-[400px] overflow-y-auto custom-scrollbar">
            {prompt.prompt}
          </div>
        </div>
      </ShadowCard>
    </div>
  );
};

export default ViewProcedurePrompt;
