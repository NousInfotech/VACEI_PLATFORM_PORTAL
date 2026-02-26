import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { ShadowCard } from '../../../ui/ShadowCard';
import { OrganizationForm } from '../components/OrganizationForm';
import { apiPost } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import type { CreateOrganizationDto, Organization } from '../../../types/organization';
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
      // 1. Create Organization (including custom services)
      await apiPost<{ data: Organization }>(endPoints.ORGANIZATION.CREATE, {
        name: data.name,
        availableServices: data.availableServices,
        adminEmail: data.adminEmail,
        adminFirstName: data.adminFirstName,
        adminLastName: data.adminLastName,
        adminPassword: data.adminPassword,
        customServiceCycleIds: data.customServiceCycleIds
      });

      setAlert({ message: 'Organization created successfully!', variant: 'success' });
      setTimeout(() => navigate('/dashboard/organizations'), 1500);
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || (typeof error === 'string' ? error : 'Failed to create organization');
      setAlert({ message: errorMessage, variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto space-y-8">
      <PageHeader
        title="Create New Organization"
        icon={PlusCircle}
        actions={
          <Button
            variant="header"
            onClick={() => navigate('/dashboard/organizations')}
           >
            <ArrowLeft className="h-4 w-4" />
            Back
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
