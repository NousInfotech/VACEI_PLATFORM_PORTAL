import React from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface PillTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

const PillTabs: React.FC<PillTabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = "" 
}) => {
  return (
    <div className={`w-fit max-w-full overflow-x-auto no-scrollbar bg-gray-100 p-1 rounded-xl ${className}`}>
      <div className="flex space-x-1 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap
                ${isActive 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
              `}
            >
              {Icon && <Icon size={18} className="shrink-0" />}
              <span className="font-medium text-sm whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PillTabs;
