import { 
  Settings2, 
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Edit2
} from 'lucide-react';
import type { ServiceRequestTemplate } from '../../../../types/service-request-template';
import { Button } from '../../../../ui/Button';
import { useTemplates } from '../../context/ServicesContext';

interface TemplateCardProps {
  template: ServiceRequestTemplate;
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;
  onEdit: (template: ServiceRequestTemplate) => void;
  onView: (template: ServiceRequestTemplate) => void;
  onToggleActive: (template: ServiceRequestTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  activeDropdownId,
  setActiveDropdownId,
  onEdit,
  onView,
  onToggleActive,
}) => {
  const { formatServiceLabel } = useTemplates();

  return (
    <div className="group p-5 bg-white border border-gray-100 hover:border-gray-400 transition-all duration-300 rounded-[28px] grid grid-cols-12 items-center gap-4">
      <div className="col-span-4 flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${template.type === 'GENERAL' ? 'bg-indigo-50 text-indigo-600' : 'bg-primary/5 text-primary'}`}>
          <Settings2 className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-md font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight uppercase tracking-tight">
            {formatServiceLabel(template.service)}
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
            {template.type} Template
          </p>
        </div>
      </div>

      <div className="col-span-3 flex flex-col items-start gap-1">
        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Last Update</span>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-3.5 w-3.5 text-gray-300" />
          <span className="text-xs font-bold leading-none">
            {new Date(template.updatedAt).toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      <div className="col-span-2 flex flex-col items-start gap-1">
        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Status</span>
        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          template.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
        }`}>
          {template.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {template.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="col-span-3 flex justify-end items-center gap-2">
        <Button
          onClick={() => onView(template)}
          variant="secondary"
          className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 border-none transition-all group/btn"
          title="View Details"
        >
          <Eye className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
        </Button>

        <div className="relative dropdown-trigger">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdownId(activeDropdownId === template.id ? null : template.id);
            }}
            className={`p-2 rounded-lg transition-all duration-200 ${
              activeDropdownId === template.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20 rotate-90' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {activeDropdownId === template.id && (
            <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2.5 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
              <button
                onClick={() => onView(template)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors group/item"
              >
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover/item:bg-indigo-100 transition-colors">
                  <Eye className="h-4 w-4" />
                </div>
                View Details
              </button>
              <button
                onClick={() => onEdit(template)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors group/item"
              >
                <div className="p-1.5 rounded-lg bg-primary/5 text-primary group-hover/item:bg-primary/10 transition-colors">
                  <Edit2 className="h-4 w-4" />
                </div>
                Edit Template
              </button>
              
              <button
                onClick={() => {
                  onToggleActive(template);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors group/item ${
                  template.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${
                  template.isActive 
                    ? 'bg-amber-50 text-amber-600 group-hover/item:bg-amber-100' 
                    : 'bg-green-50 text-green-600 group-hover/item:bg-green-100'
                }`}>
                  {template.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </div>
                {template.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
