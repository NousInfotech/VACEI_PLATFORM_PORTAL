import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ShadowCard } from '../../ui/ShadowCard';
import { OrganizationForm } from './components/OrganizationForm';
import { apiGet, apiPut } from '../../config/base';
import { endPoints } from '../../config/endPoint';
import type { Organization, CreateOrganizationDto } from '../../types/organization';
import AlertMessage from '../common/AlertMessage';
import { PageHeader } from '../common/PageHeader';

const EditOrganization: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const organizationFromState = location.state?.organization as Organization | undefined;
  
  const [loading, setLoading] = useState(!organizationFromState);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(organizationFromState || null);
  const [alert, setAlert] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null);

  const fetchOrganization = useCallback(async () => {
    if (!id) return;
    // Only show loading if we don't have data yet
    if (!organization) setLoading(true);
    try {
      const response = await apiGet<{ data: Organization }>(endPoints.ORGANIZATION.GET_BY_ID(id));
      setOrganization(response.data);
    } catch {
      if (!organization) {
        setAlert({ message: 'Failed to fetch organization details', variant: 'danger' });
      }
    } finally {
      setLoading(false);
    }
  }, [id, organization]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  const handleSubmit = async (data: CreateOrganizationDto) => {
    if (!id) return;
    setUpdateLoading(true);
    setAlert(null);
    try {
      await apiPut(endPoints.ORGANIZATION.UPDATE(id), {
        name: data.name,
        availableServices: data.availableServices
      });
      setAlert({ message: 'Organization updated successfully!', variant: 'success' });
      setTimeout(() => navigate('/dashboard/organizations'), 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update organization';
      setAlert({ message: errorMessage, variant: 'danger' });
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Edit Organization"
        icon={Edit2}
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
        {loading ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-8 bg-gray-100 rounded-lg w-1/4" />
            <div className="space-y-4">
              <div className="h-12 bg-gray-50 rounded-2xl w-full" />
            </div>
            <div className="h-8 bg-gray-100 rounded-lg w-1/4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {Array.from({ length: 8 }).map((_, i) => (
                 <div key={i} className="h-16 bg-gray-50 rounded-2xl w-full" />
               ))}
            </div>
          </div>
        ) : (
          <OrganizationForm 
            key={organization?.id || 'new'}
            isEdit 
            onSubmit={handleSubmit} 
            loading={updateLoading} 
            initialData={organization ? {
                name: organization.name,
                availableServices: organization.availableServices
            } : undefined}
          />
        )}
      </ShadowCard>
    </div>
  );
};

export default EditOrganization;
