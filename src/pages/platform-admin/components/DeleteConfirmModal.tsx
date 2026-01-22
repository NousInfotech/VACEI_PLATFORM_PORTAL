import React, { useState, useEffect } from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { ShadowCard } from '../../../ui/ShadowCard';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName: string;
  loading?: boolean;
  isHardDelete?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Critical Action Required",
  itemName,
  loading = false,
  isHardDelete = false,
}) => {
  const [verificationText, setVerificationText] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    setIsVerified(verificationText === itemName);
  }, [verificationText, itemName]);

  useEffect(() => {
    if (!isOpen) {
      setVerificationText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <ShadowCard className="w-full max-w-lg bg-white p-0 rounded-[32px] shadow-2xl relative overflow-hidden ring-1 ring-black/5">
        {/* Header - Danger Zone */}
        <div className="bg-red-50 p-8 flex flex-col items-center text-center space-y-4 border-b border-red-100">
           <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-red-600 shadow-sm border border-red-100">
              <AlertCircle className="h-8 w-8" />
           </div>
           <div>
              <h2 className="text-xl font-bold text-red-900">{title}</h2>
              <p className="text-red-600/80 text-sm font-medium mt-1">This action cannot be undone.</p>
           </div>
           
           <button 
              onClick={onClose}
              className="absolute right-6 top-6 p-2 text-red-400 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm"
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <p className="text-gray-600 text-sm leading-relaxed">
              {isHardDelete 
                ? <>You are about to <span className="font-bold text-red-600 underline">permanently delete</span> <span className="font-bold text-gray-900">"{itemName}"</span>. This will remove all database records, members, and history forever. This is a development-only feature.</>
                : <>You are about to <span className="font-bold text-amber-600">soft delete</span> <span className="font-bold text-gray-900">"{itemName}"</span>. This will deactivate the entity and hide it from the platform, but the data will remain in the database.</>
              }
            </p>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-3">Verification Step</p>
              <p className="text-xs text-gray-500 mb-4">Please type <span className="font-bold text-gray-900 select-all">{itemName}</span> to confirm.</p>
              
              <input
                type="text"
                value={verificationText}
                onChange={(e) => setVerificationText(e.target.value)}
                placeholder="Type organization name here..."
                className="w-full px-4 py-3 bg-white border-2 border-gray-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/5 rounded-xl outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300"
                autoFocus
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 py-4 rounded-xl border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={!isVerified || loading}
              className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                isVerified 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-200 hover:shadow-xl hover:bg-red-700 active:scale-95' 
                  : 'bg-gray-100 text-gray-400 grayscale cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {isHardDelete ? 'Confirm Permanent Delete' : 'Confirm Soft Delete'}
                </>
              )}
            </Button>
          </div>
        </div>
      </ShadowCard>
    </div>
  );
};
