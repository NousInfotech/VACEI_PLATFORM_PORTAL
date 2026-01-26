import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CornerDownRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../../ui/Button';
import { ShadowCard } from '../../../../ui/ShadowCard';
import { Skeleton } from '../../../../ui/Skeleton';
import { apiGet } from '../../../../config/base';
import { endPoints } from '../../../../config/endPoint';
import type { ServiceRequestTemplate, FormField } from '../../../../types/service-request-template';

const PreviewField: React.FC<{ field: FormField }> = ({ field }) => {
  return (
    <ShadowCard className="p-8 border-l-8 border-l-primary border border-gray-100 bg-white rounded-2xl hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <label className="text-lg font-semibold text-gray-900 flex gap-2">
            {field.question}
            {field.required && <span className="text-red-500 font-bold">*</span>}
          </label>
        </div>

        {field.placeholder && (
            <p className="text-xs text-gray-400 italic flex items-center gap-1">
                <CornerDownRight className="h-3 w-3" />
                {field.placeholder}
            </p>
        )}

        <div className="mt-4">
          {field.input_type === 'text' && (
            <input
              type="text"
              placeholder={field.placeholder || "Your answer"}
              disabled
              className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-primary transition-colors bg-transparent text-gray-400 cursor-not-allowed"
            />
          )}

          {field.input_type === 'number' && (
            <input
              type="number"
              placeholder={field.placeholder || "0"}
              disabled
              className="w-64 border-b-2 border-gray-100 py-2 outline-none focus:border-primary transition-colors bg-transparent text-gray-400 cursor-not-allowed"
            />
          )}

          {field.input_type === 'text_area' && (
            <textarea
              placeholder={field.placeholder || "Long answer text"}
              disabled
              rows={3}
              className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-primary transition-colors bg-transparent text-gray-400 cursor-not-allowed resize-none"
            />
          )}

          {field.input_type === 'radio' && (
            <div className="space-y-3">
              {(field.options || []).map((option, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="h-5 w-5 rounded-full border-2 border-gray-200 group-hover:border-primary transition-colors" />
                  <span className="text-gray-600 font-medium">{option}</span>
                </div>
              ))}
            </div>
          )}

          {field.input_type === 'checkbox' && (
            <div className="space-y-3">
              {(field.options || []).map((option, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="h-5 w-5 rounded border-2 border-gray-200 group-hover:border-primary transition-colors" />
                  <span className="text-gray-600 font-medium">{option}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ShadowCard>
  );
};

const TemplatePreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: template, isLoading } = useQuery({
    queryKey: ['service-request-template', id],
    queryFn: async () => {
      const response = await apiGet<{ data: ServiceRequestTemplate }>(endPoints.SERVICE_REQUEST_TEMPLATE.GET_BY_ID(id!));
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f7ff] flex items-center justify-center p-8">
        <div className="w-full max-w-3xl space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-60 w-full rounded-2xl" />
          <Skeleton className="h-60 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!id || !template) {
    return (
      <div className="min-h-screen bg-[#f5f7ff] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Template Not Found</h2>
        <Button onClick={() => navigate(-1)} variant="secondary">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0ebf8] flex flex-col items-center py-4 md:py-12 px-4">
      {/* Container - mimics Google Forms white container feel */}
      <div className="w-full max-w-6xl flex flex-col gap-8">
        
        {/* Navigation Action */}
        <div className="flex justify-start">
            <Button 
                onClick={() => navigate(-1)}
                variant="outline"
                className="bg-white border-none shadow-sm rounded-xl px-6 py-2.5 hover:bg-white/80 transition-all font-bold group"
            >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Template
            </Button>
        </div>

        {/* Header Card */}
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-3 bg-primary rounded-t-3xl" />
          <ShadowCard className="p-10 border-none bg-white rounded-3xl shadow-sm">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {template.service?.replace(/_/g, ' ') || 'General Section'}
            </h1>
            {/* <div className="h-1.5 w-24 bg-primary/10 rounded-full mb-8" /> */}
            <p className="text-gray-500 font-medium leading-relaxed max-w-2xl">
              Standardized section preview. This reflects how the form will appear to the client during service fulfillment.
            </p>
          </ShadowCard>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 pb-20">
          {template.formFields.map((field, index) => (
            <PreviewField key={index} field={field} />
          ))}

          {/* Dummy Submission Footer */}
          <div className="flex items-center justify-between pt-6">
            <Button disabled className="rounded-xl px-12 py-3.5 font-bold opacity-40 shadow-none">
              Submit Form
            </Button>
            <div className="flex flex-col items-end">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Preview Mode Only</p>
                <p className="text-[9px] text-gray-300 font-medium">Responses are not captured in this view</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
