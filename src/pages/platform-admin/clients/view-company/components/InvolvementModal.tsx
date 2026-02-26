import React, { useState, useEffect } from 'react';
import { X, Users, ShieldCheck, Plus, Search, Building2 } from 'lucide-react';
import { Button } from '../../../../../ui/Button';
import { apiGet, apiPost, apiPut } from '../../../../../config/base';
import { endPoints } from '../../../../../config/endPoint';
import type { CompanyInvolvement, RepresentationRole } from '../../../../../types/company';

interface InvolvementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
  involvement?: CompanyInvolvement | null;
  mode: 'add' | 'edit';
  existingInvolvements?: CompanyInvolvement[];
}

interface Person {
  id: string;
  name: string;
  address: string;
  nationality: string;
}

interface MiniCompany {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
}

const ROLES: RepresentationRole[] = ['DIRECTOR', 'SHAREHOLDER', 'LEGAL_REPRESENTATIVE', 'SECRETARY'];

const InvolvementModal: React.FC<InvolvementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  involvement,
  mode,
  existingInvolvements = [],
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [persons, setPersons] = useState<Person[]>([]);
  const [companies, setCompanies] = useState<MiniCompany[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [selectedHolderCompanyId, setSelectedHolderCompanyId] = useState<string>('');
  const [partyType, setPartyType] = useState<'PERSON' | 'COMPANY'>('PERSON');
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  
  const [formData, setFormData] = useState({
    role: [] as RepresentationRole[],
    classA: 0,
    classB: 0,
    classC: 0,
    ordinary: 0,
    personName: '',
    personAddress: '',
    personNationality: '',
    companyName: '',
    companyRegNumber: '',
    companyAddress: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchPersons();
      fetchCompanies();
      if (mode === 'edit' && involvement) {
        setFormData({
          role: involvement.role || [],
          classA: involvement.classA || 0,
          classB: involvement.classB || 0,
          classC: involvement.classC || 0,
          ordinary: involvement.ordinary || 0,
          personName: involvement.person?.name || involvement.holderCompany?.name || '',
          personAddress: involvement.person?.address || involvement.holderCompany?.address || '',
          personNationality: involvement.person?.nationality || '',
          companyName: involvement.holderCompany?.name || '',
          companyRegNumber: involvement.holderCompany?.registrationNumber || '',
          companyAddress: involvement.holderCompany?.address || '',
        });
        setPartyType(involvement.partyType || 'PERSON');
        setSelectedPersonId(involvement.person?.id || '');
        setSelectedHolderCompanyId(involvement.holderCompany?.id || '');
      } else {
        resetForm();
      }
    }
  }, [isOpen, mode, involvement]);

  const fetchPersons = async () => {
    try {
      const response = await apiGet<{ data: Person[] }>(endPoints.PERSON.GET_ALL);
      setPersons(response.data || []);
    } catch (err) {
      console.error('Failed to fetch persons:', err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await apiGet<{ data: MiniCompany[] }>(endPoints.COMPANY.GET_ALL);
      // Filter out the current company if needed, but usually fine
      setCompanies(response.data || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      role: [],
      classA: 0,
      classB: 0,
      classC: 0,
      ordinary: 0,
      personName: '',
      personAddress: '',
      personNationality: '',
      companyName: '',
      companyRegNumber: '',
      companyAddress: '',
    });
    setSelectedPersonId('');
    setSelectedHolderCompanyId('');
    setPartyType('PERSON');
    setShowPersonForm(false);
    setShowCompanyForm(false);
    setSearchTerm('');
  };

  const toggleRole = (role: RepresentationRole) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      role: prev.role.includes(role)
        ? prev.role.filter((r: RepresentationRole) => r !== role)
        : [...prev.role, role]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role.length === 0) {
      alert('Please select at least one role');
      return;
    }

    setIsSubmitting(true);
    try {
      let personId = partyType === 'PERSON' ? selectedPersonId : undefined;
      let holderCompanyId = partyType === 'COMPANY' ? selectedHolderCompanyId : undefined;

      if (mode === 'add' && partyType === 'PERSON' && showPersonForm) {
        const personResponse = await apiPost<{ data: Person }>(endPoints.PERSON.CREATE, {
          name: formData.personName,
          address: formData.personAddress,
          nationality: formData.personNationality,
        });
        personId = personResponse.data.id;
      }

      if (mode === 'add' && partyType === 'COMPANY' && showCompanyForm) {
        const companyResponse = await apiPost<{ data: MiniCompany }>(endPoints.COMPANY.CREATE, {
          name: formData.companyName,
          registrationNumber: formData.companyRegNumber,
          address: formData.companyAddress,
          companyType: 'NON_PRIMARY',
          clientId: null,
          incorporationStatus: true,
        });
        holderCompanyId = companyResponse.data.id;
      }

      if (mode === 'add' && !personId && !holderCompanyId) {
        alert(`Please select a ${partyType === 'PERSON' ? 'person' : 'company'} or create a new one`);
        setIsSubmitting(false);
        return;
      }

      if (mode === 'add') {
        await apiPost(endPoints.INVOLVEMENT.CREATE, {
          companyId,
          partyType,
          personId,
          holderCompanyId,
          role: formData.role,
          classA: formData.classA,
          classB: formData.classB,
          classC: formData.classC,
          ordinary: formData.ordinary,
        });
      } else if (involvement) {
        await apiPut(endPoints.INVOLVEMENT.UPDATE(involvement.id), {
          role: formData.role,
          classA: formData.classA,
          classB: formData.classB,
          classC: formData.classC,
          ordinary: formData.ordinary,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save involvement:', err);
      alert('Failed to save involvement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPersons = persons.filter((p: Person) => {
    const isAlreadyInvolved = existingInvolvements.some(inv => inv.person?.id === p.id);
    return !isAlreadyInvolved && p.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredCompanies = companies.filter((c: MiniCompany) => {
    const isAlreadyInvolved = existingInvolvements.some(inv => inv.holderCompany?.id === c.id);
    const isCurrentCompany = c.id === companyId;
    return !isAlreadyInvolved && !isCurrentCompany && c.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${mode === 'add' ? 'bg-green-50 text-green-600' : 'bg-primary/10 text-primary'}`}>
              {mode === 'add' ? <Plus size={22} /> : <Users size={22} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{mode === 'add' ? 'Add Involvement' : 'Edit Involvement'}</h3>
              <p className="text-xs text-gray-500 font-medium">Manage shareholder or representative roles</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Party Type Selection (only for Add mode) */}
          {mode === 'add' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                Party Type
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => { setPartyType('PERSON'); resetForm(); }}
                  className={`flex-1 py-3 px-4 rounded-2xl border transition-all font-bold text-sm flex items-center justify-center gap-2 ${partyType === 'PERSON' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                >
                  <Users size={18} />
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => { setPartyType('COMPANY'); resetForm(); setPartyType('COMPANY'); }}
                  className={`flex-1 py-3 px-4 rounded-2xl border transition-all font-bold text-sm flex items-center justify-center gap-2 ${partyType === 'COMPANY' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                >
                  <Building2 size={18} />
                  Company
                </button>
              </div>
            </div>
          )}

          {/* Selection Area (only for Add mode) */}
          {mode === 'add' && (
            <div className="space-y-4">
              {partyType === 'PERSON' ? (
                // Individual Selection
                !showPersonForm ? (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Search size={14} /> Select Person
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search existing persons..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                      {filteredPersons.length > 0 ? (
                        filteredPersons.map((p: Person) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedPersonId(p.id);
                              setSearchTerm(p.name);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-all flex items-center justify-between ${selectedPersonId === p.id ? 'bg-primary/5 text-primary' : 'text-gray-700'}`}
                          >
                            <div>
                              <span className="font-bold">{p.name}</span>
                              <span className="ml-2 text-xs text-gray-400">{p.nationality}</span>
                            </div>
                            {selectedPersonId === p.id && <ShieldCheck size={16} />}
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-gray-400 font-medium">No results found</div>
                      )}
                    </div>
                    <div className="flex items-center justify-center py-2">
                      <button
                        type="button"
                        onClick={() => setShowPersonForm(true)}
                        className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus size={14} /> Or create a new person
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-gray-900 border-b-2 border-primary pb-1 uppercase tracking-widest">New Person Details</h4>
                      <button type="button" onClick={() => setShowPersonForm(false)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Back to Search</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                        <input
                          type="text"
                          value={formData.personName}
                          onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm font-medium"
                          required={showPersonForm}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nationality</label>
                        <input
                          type="text"
                          value={formData.personNationality}
                          onChange={(e) => setFormData({ ...formData, personNationality: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm font-medium"
                          required={showPersonForm}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</label>
                        <input
                          type="text"
                          value={formData.personAddress}
                          onChange={(e) => setFormData({ ...formData, personAddress: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm font-medium"
                          required={showPersonForm}
                        />
                      </div>
                    </div>
                  </div>
                )
              ) : (
                // Company Selection
                !showCompanyForm ? (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Building2 size={14} /> Select Company
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search existing companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                      {filteredCompanies.length > 0 ? (
                        filteredCompanies.map((c: MiniCompany) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedHolderCompanyId(c.id);
                              setSearchTerm(c.name);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-all flex items-center justify-between ${selectedHolderCompanyId === c.id ? 'bg-primary/5 text-primary' : 'text-gray-700'}`}
                          >
                            <div>
                              <span className="font-bold">{c.name}</span>
                              <span className="ml-2 text-xs text-gray-400">{c.registrationNumber}</span>
                            </div>
                            {selectedHolderCompanyId === c.id && <ShieldCheck size={16} />}
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-gray-400 font-medium">No results found</div>
                      )}
                    </div>
                    <div className="flex items-center justify-center py-2">
                      <button
                        type="button"
                        onClick={() => setShowCompanyForm(true)}
                        className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus size={14} /> Or create a new company
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-gray-900 border-b-2 border-primary pb-1 uppercase tracking-widest">New Company Details</h4>
                      <button type="button" onClick={() => setShowCompanyForm(false)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Back to Search</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company Name</label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm font-medium"
                          required={showCompanyForm}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registration Number</label>
                        <input
                          type="text"
                          value={formData.companyRegNumber}
                          onChange={(e) => setFormData({ ...formData, companyRegNumber: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm font-medium"
                          required={showCompanyForm}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</label>
                        <input
                          type="text"
                          value={formData.companyAddress}
                          onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm font-medium"
                          required={showCompanyForm}
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Roles Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={14} /> Assign Roles
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-4 py-2 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest ${
                    formData.role.includes(role)
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'bg-white text-gray-400 border-gray-100 hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {role.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Share Counts (only if shareholder) */}
          {formData.role.includes('SHAREHOLDER') && (
            <div className="space-y-4 pt-2 border-t border-gray-50">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Plus size={14} /> Share Allocation
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Class A</label>
                  <input
                    type="number"
                    value={formData.classA}
                    onChange={(e) => setFormData({ ...formData, classA: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Class B</label>
                  <input
                    type="number"
                    value={formData.classB}
                    onChange={(e) => setFormData({ ...formData, classB: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Class C</label>
                  <input
                    type="number"
                    value={formData.classC}
                    onChange={(e) => setFormData({ ...formData, classC: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ordinary</label>
                  <input
                    type="number"
                    value={formData.ordinary}
                    onChange={(e) => setFormData({ ...formData, ordinary: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          )}
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
            onClick={handleSubmit}
            disabled={
              isSubmitting || 
              (mode === 'add' && (
                (partyType === 'PERSON' && !selectedPersonId && !showPersonForm) ||
                (partyType === 'COMPANY' && !selectedHolderCompanyId && !showCompanyForm)
              ))
            }
            className={`px-8 py-2 rounded-xl text-white shadow-lg transition-all disabled:opacity-50 ${mode === 'add' ? 'bg-green-600 shadow-green-600/20 hover:bg-green-700' : 'bg-primary shadow-primary/20 hover:bg-primary/90'}`}
          >
            {isSubmitting 
              ? 'Saving...' 
              : mode === 'edit' 
                ? 'Save Changes' 
                : partyType === 'PERSON' 
                  ? 'Add Member' 
                  : 'Add Company'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvolvementModal;
