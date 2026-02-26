import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { apiPost } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import type { PlatformEmployee } from '../../../types/platformEmployee';
import PageHeader from '../../common/PageHeader';
import { ShadowCard } from '../../../ui/ShadowCard';
import { toast } from 'sonner';

const CreatePlatformEmployee: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName || !password) {
      toast.error('First name, last name, email and password are required.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        firstName,
        lastName,
        email,
        password,
      };
      if (phone) payload.phone = phone;

      await apiPost<{ data: PlatformEmployee }>(endPoints.PLATFORM_EMPLOYEES.CREATE, payload);
      toast.success('Platform employee created successfully');
      navigate('/dashboard/employees');
    } catch (err) {
      console.error('Failed to create platform employee', err);
      toast.error((err as any)?.response?.data?.message || 'Failed to create platform employee. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mx-auto">
      <PageHeader 
        title="New Platform Employee" 
        icon={Users}
        actions={
          <Button
            variant="header"
            onClick={() => navigate('/dashboard/employees')}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
        }
      />

      <ShadowCard className="p-8 border border-gray-100 shadow-sm rounded-2xl bg-white mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium text-gray-700"
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium text-gray-700"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium text-gray-700"
                placeholder="employee@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium text-gray-700"
                placeholder="+356 ..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium text-gray-700"
                placeholder="Minimum 6 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl px-6 font-semibold"
              onClick={() => navigate('/dashboard/employees')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl px-8 font-semibold"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Employee'}
            </Button>
          </div>
        </form>
      </ShadowCard>
    </div>
  );
};

export default CreatePlatformEmployee;
