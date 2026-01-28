import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, History, FileText, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { ShadowCard } from '../../../ui/ShadowCard';
import { apiGet } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import type { IncorporationCycle, IncorporationStatus } from '../../../types/company';
import PageHeader from '../../common/PageHeader';

const IncorpCycle: React.FC = () => {
    const { clientId, companyId } = useParams<{ clientId: string; companyId: string }>();

    // Mocking the cycle data for now as specific cycle GET endpoint wasn't clearly found
    // In a real scenario, this would be an API call
    const { data: cycle } = useQuery<IncorporationCycle>({
        queryKey: ['incorporation-cycle', companyId],
        queryFn: () => apiGet<{ data: IncorporationCycle }>(`${endPoints.COMPANY.BASE}/${companyId}/incorporation`).then(res => res.data),
        enabled: !!companyId,
    });

    const statusSteps: IncorporationStatus[] = ['PENDING', 'IN_PROGRESS', 'APPROVED'];
    const currentStatusIndex = statusSteps.indexOf(cycle?.status || 'PENDING');

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Incorporation Cycle" 
                icon={ClipboardList}
                description="Track and manage company incorporation progress"
                showBack={true}
                backUrl={`/dashboard/clients/${clientId}/company/${companyId}`}
            />

            {/* Status Bar */}
            <ShadowCard className="p-8 border border-gray-100 shadow-sm rounded-2xl bg-white">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
                    <div 
                        className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 transition-all duration-1000 z-0"
                        style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                    ></div>

                    {statusSteps.map((status, index) => {
                        const isActive = index <= currentStatusIndex;
                        return (
                            <div key={status} className="relative z-10 flex flex-col items-center">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                                    isActive ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-gray-100 text-gray-300'
                                }`}>
                                    {isActive ? <CheckCircle2 className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                                </div>
                                <span className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                                    {status.replace('_', ' ')}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </ShadowCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status History */}
                <ShadowCard className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white space-y-6">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                        <History className="h-4 w-4 text-primary" />
                        Status History
                    </h3>
                    <div className="space-y-6">
                        <HistoryItem 
                            status="PENDING" 
                            date={cycle?.startedAt || ''} 
                            description="Incorporation request submitted and pending review."
                            active={true}
                        />
                        {cycle?.status !== 'PENDING' && (
                            <HistoryItem 
                                status={cycle?.status || ''} 
                                date={cycle?.completedAt || ''} 
                                description={`Process updated to ${cycle?.status}.`}
                                active={true}
                            />
                        )}
                    </div>
                </ShadowCard>

                {/* Document Requests */}
                <ShadowCard className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white space-y-6">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Required Documents
                    </h3>
                    <div className="space-y-3">
                        {/* Placeholder for documents */}
                        <p className="text-sm text-gray-400 italic">No specific document requests for this cycle yet.</p>
                    </div>
                </ShadowCard>
            </div>
        </div>
    );
};

const HistoryItem = ({ status, date, description, active }: { status: string; date: string; description: string; active: boolean }) => (
    <div className="flex gap-4 relative">
        <div className={`h-3 w-3 rounded-full mt-1.5 shrink-0 ${active ? 'bg-primary shadow-[0_0_0_4px_rgba(var(--primary-rgb),0.1)]' : 'bg-gray-200'}`}></div>
        <div className="space-y-1">
            <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-tight">{status}</span>
                <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {date ? new Date(date).toLocaleString() : 'Pending'}
                </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        </div>
    </div>
);

export default IncorpCycle;
