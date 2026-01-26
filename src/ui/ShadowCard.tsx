import type { ReactNode } from "react";

interface ShadowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  animate?: boolean;
  hover?: boolean;
}

export const ShadowCard = ({ 
  children, 
  className = "", 
  animate = false, 
  ...props
}: ShadowCardProps) => {
  const hasBg = className.includes("bg-");

  const baseStyles = `${!hasBg ? "bg-white" : ""} rounded-2xl shadow-lg shadow-gray-300/30 transition-all duration-300`;
  const animationStyles = animate ? "animate-slide-in-right" : "";
 
  return (
    <div 
      className={`${baseStyles} ${animationStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ShadowCard;
