import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  X, 
  Building2, 
  Briefcase, 
  CheckCircle2, 
  ChevronRight,
  Info,
  Calendar
} from 'lucide-react';
import { Button } from '../../../../../ui/Button';
import { apiGet, apiPost } from '../../../../../config/base';
import { endPoints } from '../../../../../config/endPoint';
import { StatusSuccessModal } from './StatusUpdateModals';

interface CreateEngagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  serviceCategory: string;
  companyName: string;
  serviceRequestId?: string;
  customServiceCycleId?: string | null;
  serviceDetails?: any[];
}

interface Organization {
  id: string;
  name: string;
  availableServices: string[];
  customServiceCycles?: { id: string; isActive: boolean }[];
}

const CreateEngagementModal: React.FC<CreateEngagementModalProps> = ({
  isOpen,
  onClose,
  companyId,
  serviceCategory,
  companyName,
  serviceRequestId,
  customServiceCycleId,
  serviceDetails,
}) => {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Period-specific inputs
  const [periodType, setPeriodType] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'RANGE' | 'YEAR_END'>('MONTHLY');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedQuarter, setSelectedQuarter] = useState('1');
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [yearEndDate, setYearEndDate] = useState(''); // For Audit

  // Set default period type and pre-fill from serviceDetails
  useEffect(() => {
    if (!isOpen) return;

    // 1. Initial Defaults based on service
    if (serviceCategory === 'AUDITING') {
      setPeriodType('YEAR_END');
    } else if (serviceCategory === 'VAT') {
      setPeriodType('QUARTERLY');
    } else if (serviceCategory === 'ACCOUNTING' || serviceCategory === 'PAYROLL') {
      setPeriodType('RANGE');
    } else if (serviceCategory === 'MBR' || serviceCategory === 'TAX') {
      setPeriodType('YEARLY');
    }

    // 2. Pre-fill from serviceDetails if available
    if (serviceDetails && serviceDetails.length > 0) {
      serviceDetails.forEach(detail => {
        const q = detail.question?.toLowerCase() || '';
        const a = detail.answer;

        if (q.includes('year end') && typeof a === 'string') {
          setYearEndDate(a);
        }

        if (q.includes('year') && !q.includes('end') && typeof a === 'string') {
          const match = a.match(/\d{4}/);
          if (match) setSelectedYear(match[0]);
        }

        if (q.includes('month')) {
           if (typeof a === 'string') {
            const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
            const index = months.findIndex(m => a.toLowerCase().includes(m));
            if (index !== -1) setSelectedMonth(String(index + 1));
          }
        }

        if (q.includes('quarter')) {
          if (typeof a === 'string') {
            const match = a.match(/q[1-4]/i);
            if (match) setSelectedQuarter(match[0].toLowerCase().replace('q', ''));
          }
        }

        if ((q.includes('start date') || q.includes('from')) && typeof a === 'string') {
          setStartDate(a);
        }
        if ((q.includes('end date') || q.includes('to')) && typeof a === 'string') {
          setEndDate(a);
        }
      });
    }
  }, [serviceCategory, isOpen, serviceDetails]);

  const { data: orgsData, isLoading: isLoadingOrgs } = useQuery<{ data: Organization[] }>({
    queryKey: ['organizations-list'],
    queryFn: () => apiGet<{ data: Organization[] }>(endPoints.ORGANIZATION.GET_ALL),
    enabled: isOpen,
  });

  const organizations = orgsData?.data || [];

  // Filter organizations that offer the required service
  const eligibleOrgs = organizations.filter(org => {
    if (serviceCategory === 'CUSTOM' && customServiceCycleId) {
      return org.customServiceCycles?.some(cycle => cycle.id === customServiceCycleId && cycle.isActive);
    }
    return org.availableServices?.includes(serviceCategory);
  });

  const handleCreate = async () => {
    if (!selectedOrgId) {
      alert('Please select an organization');
      return;
    }

    setIsSubmitting(true);

    const period: any = {};
    const currentYear = parseInt(selectedYear);

    if (periodType === 'YEARLY') {
      period.year = currentYear;
      period.frequency = 'yearly';
    } else if (periodType === 'MONTHLY') {
      period.year = currentYear;
      period.month = parseInt(selectedMonth);
      period.frequency = 'monthly';
    } else if (periodType === 'QUARTERLY') {
      period.year = currentYear;
      period.quarter = parseInt(selectedQuarter);
      period.frequency = 'quarterly';
    } else if (periodType === 'RANGE') {
      period.startDate = startDate;
      period.endDate = endDate;
    } else if (periodType === 'YEAR_END') {
      period.yearEndDate = yearEndDate;
    }

    const payload = {
      companyId,
      organizationId: selectedOrgId,
      serviceCategory: serviceCategory,
      ...(customServiceCycleId && { customServiceCycleId }),
      ...(serviceRequestId?.trim() && { serviceRequestId }),
      period,
    };

    try {
      const response = await apiPost<any>(endPoints.ENGAGEMENT.CREATE, payload);
      if (response && response.success === false) {
        alert(response.message || 'Failed to create engagement');
      } else {
        setShowSuccess(true);
      }
    } catch (err: any) {
      console.error('Failed to create engagement:', err);
      alert(err.response?.data?.message || 'Failed to create engagement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-2xl max-h-[95vh] flex flex-col rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Briefcase size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Initialize Engagement</h3>
              <p className="text-sm text-gray-500 font-medium">Assign a professional firm to this service</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
          {/* Service Info */}
          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Selected Mandate</p>
                <h4 className="text-lg font-bold text-gray-900">{serviceCategory.charAt(0) + serviceCategory.slice(1).toLowerCase()} Service</h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Company</p>
                <h4 className="text-sm font-bold text-gray-900">{companyName}</h4>
              </div>
            </div>
          </div>

          {/* Period Configuration */}
          {(serviceCategory === 'AUDITING' || 
            serviceCategory === 'ACCOUNTING' || 
            serviceCategory === 'PAYROLL' || 
            serviceCategory === 'VAT' || 
            serviceCategory === 'MBR' || 
            serviceCategory === 'TAX') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Calendar size={16} className="text-primary" />
                <h4 className="text-sm font-bold text-gray-900">Engagement Period</h4>
              </div>

              <div className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* VAT Frequency Selection */}
                  {serviceCategory === 'VAT' && (
                    <div className="space-y-2 col-span-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">VAT Frequency</label>
                       <select 
                        value={periodType}
                        onChange={(e) => setPeriodType(e.target.value as any)}
                        className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-100 focus:border-primary outline-none transition-all duration-300 font-bold text-sm text-gray-700 shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-size-[16px] bg-position-[right_1rem_center] bg-no-repeat"
                      >
                        <option value="YEARLY">Annual</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>
                  )}

                  {/* Audit Year End Date */}
                  {serviceCategory === 'AUDITING' && (
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Year End Date</label>
                      <input 
                        type="date" 
                        value={yearEndDate}
                        onChange={(e) => setYearEndDate(e.target.value)}
                        className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-100 focus:border-primary outline-none transition-all duration-300 font-bold text-sm text-gray-700 shadow-sm"
                      />
                    </div>
                  )}

                  {/* Accounting & Payroll Range */}
                  {(serviceCategory === 'ACCOUNTING' || serviceCategory === 'PAYROLL') && (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Start Date</label>
                        <input 
                          type="date" 
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-100 focus:border-primary outline-none transition-all duration-300 font-bold text-sm text-gray-700 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">End Date</label>
                        <input 
                          type="date" 
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-100 focus:border-primary outline-none transition-all duration-300 font-bold text-sm text-gray-700 shadow-sm"
                        />
                      </div>
                    </>
                  )}

                  {/* Year Selection for others */}
                  {(serviceCategory === 'VAT' || serviceCategory === 'MBR' || serviceCategory === 'TAX') && (
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Year</label>
                      <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-100 focus:border-primary outline-none transition-all duration-300 font-bold text-sm text-gray-700 shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-size-[16px] bg-position-[right_1rem_center] bg-no-repeat"
                      >
                        {[2023, 2024, 2025, 2026, 2027].map(y => (
                          <option key={y} value={String(y)}>{y}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Sub-selectors for VAT Monthly/Quarterly */}
                {serviceCategory === 'VAT' && periodType === 'MONTHLY' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Month</label>
                    <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-100 focus:border-primary outline-none transition-all duration-300 font-bold text-sm text-gray-700 shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-size-[16px] bg-position-[right_1rem_center] bg-no-repeat"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                        <option key={m} value={String(i + 1)}>{m}</option>
                      ))}
                    </select>
                  </div>
                )}

                {serviceCategory === 'VAT' && periodType === 'QUARTERLY' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Quarter</label>
                    <select 
                      value={selectedQuarter}
                      onChange={(e) => setSelectedQuarter(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-100 focus:border-primary outline-none transition-all duration-300 font-bold text-sm text-gray-700 shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-size-[16px] bg-position-[right_1rem_center] bg-no-repeat"
                    >
                      <option value="1">Q1: January – March</option>
                      <option value="2">Q2: April – June</option>
                      <option value="3">Q3: July – September</option>
                      <option value="4">Q4: October – December</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Organization Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-900">Executive Partner</h4>
                <p className="text-[11px] text-gray-400 font-medium italic">Select the firm to handle this engagement</p>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-[10px] font-bold text-gray-500 rounded-full">
                {eligibleOrgs.length} Available
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {isLoadingOrgs ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : eligibleOrgs.length > 0 ? (
                eligibleOrgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => setSelectedOrgId(org.id)}
                    className={`group relative flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 ${
                      selectedOrgId === org.id
                        ? 'bg-primary/5 border-primary shadow-sm'
                        : 'bg-white border-gray-100 hover:border-primary/30 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl transition-colors duration-300 ${
                        selectedOrgId === org.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                      }`}>
                        <Building2 size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-gray-900">{org.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {org.availableServices.slice(0, 3).map(s => (
                            <span key={s} className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {selectedOrgId === org.id && (
                      <div className="p-2 bg-primary/10 rounded-full text-primary scale-in-center">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                    <ChevronRight size={16} className={`text-gray-300 transition-transform duration-300 ${
                      selectedOrgId === org.id ? 'translate-x-1 opacity-100 text-primary' : 'group-hover:translate-x-1'
                    }`} />
                  </button>
                ))
              ) : (
                <div className="p-10 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                    <Info size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-500">No organizations found</p>
                  <p className="text-xs text-gray-400 mt-1">None of the firms offer this service category</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Period</p>
            <p className="text-xs font-bold text-gray-700 mt-0.5">
              {periodType === 'RANGE' ? `${startDate || '...'} to ${endDate || '...'}` : 
               periodType === 'MONTHLY' ? `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(selectedMonth)-1]} ${selectedYear}` :
               periodType === 'QUARTERLY' ? `Q${selectedQuarter} ${selectedYear}` :
               selectedYear}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
            <Button
              onClick={handleCreate}
              disabled={!selectedOrgId || isSubmitting}
              className="px-10 h-[56px] rounded-2xl shadow-xl shadow-primary/20"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Initialize Engagement'
              )}
            </Button>
          </div>
        </div>
      </div>

      <StatusSuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          onClose();
        }}
        title="Engagement Created"
        message="The engagement has been successfully initialized and assigned."
      />
    </div>
  );
};

export default CreateEngagementModal;
