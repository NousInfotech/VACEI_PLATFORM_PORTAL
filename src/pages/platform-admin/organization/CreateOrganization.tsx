import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { ShadowCard } from '../../../ui/ShadowCard';
import { OrganizationForm } from '../components/OrganizationForm';
import { apiPost } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import type { CreateOrganizationDto } from '../../../types/organization';
import AlertMessage from '../../common/AlertMessage';
import { PageHeader } from '../../common/PageHeader';

const CreateOrganization: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null);

  const handleSubmit = async (data: CreateOrganizationDto) => {
    setLoading(true);
    setAlert(null);
    try {
      await apiPost(endPoints.ORGANIZATION.CREATE, data as unknown as Record<string, unknown>);
      setAlert({ message: 'Organization created successfully!', variant: 'success' });
      setTimeout(() => navigate('/dashboard/organizations'), 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create organization';
      setAlert({ message: errorMessage, variant: 'danger' });
    } finally {
      setLoading(false);
    }
    console.log(data);
  };

  return (
    <div className="mx-auto space-y-8">
      <PageHeader
        title="Create New Organization"
        icon={PlusCircle}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/organizations')}
            className="p-3 rounded-2xl h-12 w-12 flex items-center justify-center border-white/20 hover:bg-white/10 text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        }
      />

      {alert && (
        <div className="animate-in fade-in slide-in-from-top duration-300">
          <AlertMessage
            message={alert.message}
            variant={alert.variant}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <ShadowCard className="p-10 bg-white border-none shadow-sm rounded-3xl">
        <OrganizationForm onSubmit={handleSubmit} loading={loading} />
      </ShadowCard>
    </div>
  );
};

export default CreateOrganization;
