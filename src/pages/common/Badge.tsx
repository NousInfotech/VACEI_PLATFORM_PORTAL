import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'label' | 'danger' | 'success' | 'gray';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  className = '', 
  variant = 'primary' 
}) => {
  const variants = {
    primary: 'bg-primary text-white py-1.5 px-3 rounded-lg shadow-sm shadow-primary/10',
    label: 'text-gray-400 p-0',
    danger: 'bg-red-50 text-red-600 py-1.5 px-3 rounded-lg border border-red-100',
    success: 'bg-green-50 text-green-600 py-1.5 px-3 rounded-lg border border-green-100',
    gray: 'bg-gray-50 text-gray-600 py-1.5 px-3 rounded-lg border border-gray-100'
  };

  return (
    <span className={`inline-flex items-center justify-center uppercase tracking-widest font-bold text-[10px] transition-all duration-200 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
