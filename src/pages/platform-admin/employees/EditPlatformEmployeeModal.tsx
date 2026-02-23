import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { apiPatch } from '../../../config/base';
import { endPoints } from '../../../config/endPoint';
import type { PlatformEmployee } from '../../../types/platformEmployee';

interface EditPlatformEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (emp?: PlatformEmployee) => void;
  employee: PlatformEmployee | null;
}

const EditPlatformEmployeeModal: React.FC<EditPlatformEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employee,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFirstName(employee.firstName);
      setLastName(employee.lastName);
      setEmail(employee.email || '');
      setPassword('');
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      alert('First name, last name and email are required.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { firstName, lastName, email };
      if (password) payload.password = password;

      const res = await apiPatch<{ data: PlatformEmployee }>(
        endPoints.PLATFORM_EMPLOYEES.UPDATE(employee.id),
        payload
      );
      onSuccess(res.data);
    } catch (err) {
      console.error('Failed to update platform employee', err);
      alert((err as any)?.response?.data?.message || 'Failed to update. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-lg max-h-[90vh] flex flex-col rounded-[24px] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Edit Platform Employee</h2>
              <p className="text-xs text-gray-500">{employee.email}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">New password (leave blank to keep)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlatformEmployeeModal;
