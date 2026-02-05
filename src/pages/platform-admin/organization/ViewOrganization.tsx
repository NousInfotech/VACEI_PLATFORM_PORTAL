import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
    Building2, 
    Briefcase,
    LayoutGrid,
    ClipboardList,
    type LucideIcon
} from 'lucide-react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '../../../ui/Table';
import { ShadowCard } from '../../../ui/ShadowCard';
import { Skeleton } from '../../../ui/Skeleton';
import { apiGet } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import type { Organization } from '../../../types/organization';
import PageHeader from '../../common/PageHeader';
import PillTab from '../../common/PillTab';
import type { Engagement } from '../../../data/engagementMockData';


interface Tab {
    id: string;
    label: string;
    icon?: LucideIcon;
}

const formatServiceLabel = (service: string) => {
    return service
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .replace('And', '&');
};

const ViewOrganization: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState('services');

    const { data: organization, isLoading: isOrgLoading } = useQuery<Organization>({
        queryKey: ['organization', id],
        queryFn: () => apiGet<{ data: Organization }>(endPoints.ORGANIZATION.GET_BY_ID(id!)).then(res => res.data),
        enabled: !!id,
    });

    const { data: engagementsData, isLoading: isEngLoading } = useQuery<Engagement[]>({
        queryKey: ['engagements-org', id],
        queryFn: () => apiGet<{ data: Engagement[] }>(`${endPoints.ENGAGEMENT.GET_ALL}?organizationId=${id}`).then(res => res.data),
        enabled: !!id && activeTab === 'engagements',
    });


    const allEngagements = engagementsData || [];

    if (isOrgLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <div className="flex gap-2">
                    {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-10 w-32 rounded-full" />
                    ))}
                </div>
                <div className="mt-8">
                    <Skeleton className="h-64 w-full rounded-[40px]" />
                </div>
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="p-8 text-center text-gray-500">
                Organization not found or failed to load.
            </div>
        );
    }

    const tabs: Tab[] = [
        { id: 'services', label: 'Available Services', icon: LayoutGrid },
        { id: 'engagements', label: 'Engagements', icon: Briefcase },
    ];

    return (
        <div className="space-y-6">
            <PageHeader 
                title={organization.name}
                icon={Building2}
                description="Overview of organization services and professional engagements."
                showBack={true}
                backUrl="/dashboard/organizations"
            />

            <PillTab 
                tabs={tabs} 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
            />

            <div className="mt-8">
                {activeTab === 'services' && (
                    <ShadowCard className="p-8 border-none bg-white rounded-[40px] animate-in fade-in duration-500">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-8 w-1 bg-primary rounded-full" />
                                <h4 className="text-lg font-bold text-gray-900">Configured Services</h4>
                            </div>

                            <div className="border border-gray-100 rounded-3xl overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50/50">
                                        <TableRow className="hover:bg-transparent border-gray-100">
                                            <TableHead className="py-4 px-6 text-nowrap font-bold text-gray-400 uppercase tracking-widest text-[10px]">S.No</TableHead>
                                            <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Service Name</TableHead>
                                            <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="[&_tr:last-child]:border-0 text-nowrap whitespace-nowrap">
                                        {organization.availableServices && organization.availableServices.length > 0 ? (
                                            organization.availableServices.map((service: string, index: number) => (
                                                <TableRow key={service} className="hover:bg-gray-50/50 transition-colors group border-gray-100">
                                                    <TableCell className="py-4 px-6 font-bold text-gray-400 text-xs">
                                                        {(index + 1).toString().padStart(2, '0')}
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-gray-900 group-hover:text-primary transition-colors py-5">
                                                        {formatServiceLabel(service)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-100">
                                                            ACTIVE
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="py-20 text-center">
                                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                                        <ClipboardList className="h-12 w-12 mb-4 opacity-20" />
                                                        <p className="text-lg font-medium opacity-40 italic">No services configured for this organization.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {organization.members && organization.members.length > 0 && (
                                <div className="pt-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-8 w-1 bg-primary rounded-full" />
                                        <h4 className="text-lg font-bold text-gray-900">Administrative Members</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {organization.members.map((member) => (
                                            <div key={member.id} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-4">
                                                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                                                    {member.user.firstName[0]}{member.user.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{member.user.firstName} {member.user.lastName}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{member.user.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ShadowCard>
                )}

                {activeTab === 'engagements' && (
                    <ShadowCard className="p-8 border-none bg-white rounded-[40px] animate-in fade-in duration-500">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-8 w-1 bg-primary rounded-full" />
                                <h4 className="text-lg font-bold text-gray-900">Active Project Engagements</h4>
                            </div>

                            {isEngLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                                </div>
                            ) : (
                                <div className="border border-gray-100 rounded-3xl overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gray-50/50">
                                            <TableRow className="hover:bg-transparent border-gray-100">
                                                <TableHead className="py-4 px-6 text-nowrap font-bold text-gray-400 uppercase tracking-widest text-[10px]">S.No</TableHead>
                                                <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Company Name</TableHead>
                                                <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Service Category</TableHead>
                                                <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Status</TableHead>
                                                <TableHead className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Activated On</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="[&_tr:last-child]:border-0 text-nowrap whitespace-nowrap">
                                            {allEngagements.length > 0 ? (
                                                allEngagements.map((engagement: Engagement, index: number) => (
                                                    <TableRow key={engagement.id} className="hover:bg-gray-50/50 transition-colors group border-gray-100">
                                                        <TableCell className="py-4 px-6 font-bold text-gray-400 text-xs">
                                                            {(index + 1).toString().padStart(2, '0')}
                                                        </TableCell>
                                                        <TableCell className="font-semibold text-gray-900 group-hover:text-primary transition-colors py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                                    <Building2 className="h-4 w-4" />
                                                                </div>
                                                                {engagement.companyName || 'N/A'}
                                                            </div>

                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg">
                                                                {engagement.serviceCategory.replace(/_/g, ' ')}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                                engagement.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-100' :
                                                                'bg-blue-50 text-blue-600 border-blue-100'
                                                            }`}>
                                                                {engagement.status}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-gray-500 font-medium text-xs">
                                                            {new Date(engagement.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="py-20 text-center">
                                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                                            <Briefcase className="h-12 w-12 mb-4 opacity-20" />
                                                            <p className="text-lg font-medium opacity-40 italic">No active engagements found for this organization.</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </ShadowCard>
                )}
            </div>
        </div>
    );
};

export default ViewOrganization;
