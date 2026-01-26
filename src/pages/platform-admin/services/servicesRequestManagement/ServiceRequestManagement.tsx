import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Inbox, 
  Filter
} from 'lucide-react';
import { Button } from '../../../../ui/Button';
import PageHeader from '../../../common/PageHeader';
import Dropdown from '../../../common/Dropdown';
import { RequestCard } from './RequestCard';
import { mockRequests } from './serviceMockData';
import type { ServiceRequest } from '../../../../types/service-request-template';

const ServiceRequestManagement: React.FC = () => {
  const navigate = useNavigate();
  const [requests] = useState(mockRequests);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const statuses = useMemo(() => {
    const uniqueStatuses = Array.from(new Set(requests.map(r => r.status)));
    return ['All Statuses', ...uniqueStatuses.sort()];
  }, [requests]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdownId && !(event.target as Element).closest('.dropdown-trigger')) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdownId]);

  const handleView = (request: ServiceRequest) => {
    navigate(`/dashboard/service-request-management/${request.id}`);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = req.clientName.toLowerCase().includes(search.toLowerCase()) ||
                           req.service.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = selectedStatus === 'All Statuses' || req.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, selectedStatus]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Service Request Management" 
        icon={Inbox}
        description="Monitor and manage incoming service requests from clients."
        actions={
          <Button variant='header'>
            <Plus className="h-5 w-5" />
            New Manual Request
          </Button>
        } 
      />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search requests by client or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-300 focus:border-primary/10 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-gray-700"
          />
        </div>

        <Dropdown
          label={selectedStatus}
          trigger={
            <Button variant="secondary" className="h-full px-6 py-3 rounded-2xl flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700">
              <Filter className="h-4 w-4" />
              <span className="font-semibold">{selectedStatus}</span>
            </Button>
          }
          items={statuses.map(status => ({
            id: status,
            label: status.replace(/_/g, ' '),
            onClick: () => setSelectedStatus(status),
            className: selectedStatus === status ? "bg-primary/5 text-primary font-bold" : ""
          }))}
          align="right"
        />
      </div>

      <div className="space-y-4">
        {filteredRequests.map((req) => (
          <RequestCard 
            key={req.id}
            request={req}
            activeDropdownId={activeDropdownId}
            setActiveDropdownId={setActiveDropdownId}
            onView={handleView}
          />
        ))}

        {filteredRequests.length === 0 && (
          <div className="py-32 text-center">
            <div className="inline-flex p-10 bg-gray-50 rounded-[40px] text-gray-200">
              <Inbox className="h-20 w-20" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-8">No Requests Found</h2>
            <p className="text-gray-400 font-medium mt-4">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceRequestManagement;
