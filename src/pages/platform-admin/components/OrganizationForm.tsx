import React, { useState } from 'react';
import { Mail, User, Building, Lock, Eye, EyeOff, LayoutGrid, Check } from 'lucide-react';
import { Button } from '../../../ui/Button';
import type { CreateOrganizationDto } from '../../../types/organization';

interface OrganizationFormProps {
  onSubmit: (data: CreateOrganizationDto) => void;
  loading?: boolean;
  initialData?: Partial<CreateOrganizationDto>;
  isEdit?: boolean;
}

export const OrganizationForm: React.FC<OrganizationFormProps> = ({
  onSubmit,
  loading = false,
  initialData,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<CreateOrganizationDto>({
    name: initialData?.name || '',
    availableServices: initialData?.availableServices || [],
    adminEmail: initialData?.adminEmail || '',
    adminFirstName: initialData?.adminFirstName || '',
    adminLastName: initialData?.adminLastName || '',
    adminPassword: '',
  });


  const AVAILABLE_SERVICES = [
    'ACCOUNTING',
    'AUDITING',
    'VAT',
    'CFO',
    'CSP',
    'LEGAL',
    'PAYROLL',
    'PROJECTS_TRANSACTIONS',
    'TECHNOLOGY',
    'GRANTS_AND_INCENTIVES',
    'INCORPORATION',
  ];

  const formatServiceLabel = (service: string) => {
    return service
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .replace('And', '&');
  };

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Organization name is required';
    
    if (!isEdit) {
      if (!formData.adminEmail) newErrors.adminEmail = 'Admin email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) newErrors.adminEmail = 'Valid email is required';
      if (!formData.adminFirstName) newErrors.adminFirstName = 'Admin first name is required';
      if (!formData.adminLastName) newErrors.adminLastName = 'Admin last name is required';
      if (!formData.adminPassword) newErrors.adminPassword = 'Admin password is required';
      else if (formData.adminPassword.length < 6) newErrors.adminPassword = 'Password must be at least 6 characters';
    }

    if (formData.availableServices.length === 0) newErrors.availableServices = 'At least one service must be selected';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      availableServices: prev.availableServices.includes(service)
        ? prev.availableServices.filter(s => s !== service)
        : [...prev.availableServices, service]
    }));
  };

  const toggleAllServices = () => {
    const allSelected = formData.availableServices.length === AVAILABLE_SERVICES.length;
    setFormData(prev => ({
      ...prev,
      availableServices: allSelected ? [] : [...AVAILABLE_SERVICES]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CreateOrganizationDto) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2 bg-primary/5 rounded-lg">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Organization Identity</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          {/* Organization Name */}
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">Organization Name</label>
            <div className="relative group">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Vacei Inc."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-2xl focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-gray-700"
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.name}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <LayoutGrid className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Available Services</h3>
          </div>
          <button
            type="button"
            onClick={toggleAllServices}
            className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors px-3 py-1 bg-primary/5 hover:bg-primary/10 rounded-lg"
          >
            {formData.availableServices.length === AVAILABLE_SERVICES.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {AVAILABLE_SERVICES.map((service) => (
            <button
              key={service}
              type="button"
              onClick={() => toggleService(service)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left group ${
                formData.availableServices.includes(service)
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-100'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider leading-tight">
                {formatServiceLabel(service)}
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                formData.availableServices.includes(service)
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-200'
              }`}>
                {formData.availableServices.includes(service) && (
                  <Check className="h-3 w-3 text-white stroke-[4px]" />
                )}
              </div>
            </button>
          ))}
        </div>
        {errors.availableServices && (
          <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.availableServices}</p>
        )}
      </div>

      {!isEdit && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Administrator Credentials</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            {/* Admin First Name */}
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">First Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  name="adminFirstName"
                  value={formData.adminFirstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-600/10 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-medium text-gray-700"
                />
              </div>
              {errors.adminFirstName && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.adminFirstName}</p>}
            </div>

            {/* Admin Last Name */}
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">Last Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  name="adminLastName"
                  value={formData.adminLastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-600/10 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-medium text-gray-700"
                />
              </div>
              {errors.adminLastName && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.adminLastName}</p>}
            </div>

            {/* Admin Email */}
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="admin@organization.com"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-600/10 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-medium text-gray-700"
                />
              </div>
              {errors.adminEmail && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.adminEmail}</p>}
            </div>

            {/* Admin Password */}
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-600/10 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-medium text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-white transition-all shadow-none hover:shadow-sm"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.adminPassword && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.adminPassword}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-8 border-t border-gray-100">
        <Button
          type="submit"
          disabled={loading}
          className="px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 bg-primary text-white font-bold text-base min-w-[200px]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : isEdit ? 'Update Organization' : 'Onboard Organization'}
        </Button>
      </div>
    </form>
  );
};
