import React, { useState } from 'react';
import { X, Building2, MapPin, Globe, FileText, PieChart, BarChart3, Hash } from 'lucide-react';
import { Button } from '../../../../../ui/Button';
import { apiPost } from '../../../../../config/base';
import { endPoints } from '../../../../../config/endPoint';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
}

const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientId,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    industry: [''],
    summary: '',
    authorizedShares: 0,
    issuedShares: 0,
    registrationNumber: '',
  });

  const [shareClasses, setShareClasses] = useState({
    A: 0,
    B: 0,
    C: 0,
    ORDINARY: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const shareDetails = [
        { class: 'A', issued: shareClasses.A },
        { class: 'B', issued: shareClasses.B },
        { class: 'C', issued: shareClasses.C },
        { class: 'ORDINARY', issued: shareClasses.ORDINARY },
      ].filter(s => s.issued > 0);

      await apiPost(endPoints.COMPANY.CREATE, {
        ...formData,
        clientId,
        incorporationStatus: true,
        industry: Array.isArray(formData.industry) ? formData.industry : [formData.industry],
        shareDetails,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create company:', err);
      alert('Failed to create company');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-green-50 rounded-xl text-green-600">
              <Building2 size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Create New Company</h3>
              <p className="text-xs text-gray-500 font-medium">Add a new managed company for this client</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form id="create-company-form" onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Building2 size={14} /> Company Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Hash size={14} /> Registration Number
              </label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={14} /> Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Globe size={14} /> Industry
              </label>
              <input
                type="text"
                value={formData.industry[0] || ''}
                onChange={(e) => setFormData({ ...formData, industry: [e.target.value] })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <PieChart size={14} /> Authorized Shares
              </label>
              <input
                type="number"
                value={formData.authorizedShares}
                onChange={(e) => setFormData({ ...formData, authorizedShares: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={14} /> Issued Shares
              </label>
              <input
                type="number"
                value={formData.issuedShares}
                onChange={(e) => setFormData({ ...formData, issuedShares: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
              />
            </div>

            {/* Share Classes Breakdown */}
            <div className="md:col-span-2 p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
              <h4 className="text-xs font-bold text-gray-900 border-b-2 border-primary pb-1 uppercase tracking-widest inline-block">Share Class Breakdown</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Class A</label>
                  <input
                    type="number"
                    value={shareClasses.A}
                    onChange={(e) => setShareClasses({ ...shareClasses, A: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Class B</label>
                  <input
                    type="number"
                    value={shareClasses.B}
                    onChange={(e) => setShareClasses({ ...shareClasses, B: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Class C</label>
                  <input
                    type="number"
                    value={shareClasses.C}
                    onChange={(e) => setShareClasses({ ...shareClasses, C: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ordinary</label>
                  <input
                    type="number"
                    value={shareClasses.ORDINARY}
                    onChange={(e) => setShareClasses({ ...shareClasses, ORDINARY: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <FileText size={14} /> Description
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium resize-none"
              />
            </div>
          </div>
        </form>

        <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-50 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2 rounded-xl border-gray-200 text-gray-500 hover:bg-white"
          >
            Cancel
          </Button>
          <Button
            form="create-company-form"
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2 rounded-xl bg-green-600 text-white shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Company'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCompanyModal;
