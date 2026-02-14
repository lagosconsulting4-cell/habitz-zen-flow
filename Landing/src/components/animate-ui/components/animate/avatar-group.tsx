import { motion } from "motion/react";
import { ReactNode } from "react";

interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  className?: string;
}

export const AvatarGroup = ({ children, max = 5, className = "" }: AvatarGroupProps) => {
  const childArray = Array.isArray(children) ? children : [children];
  const displayChildren = max ? childArray.slice(0, max) : childArray;
  const remaining = max && childArray.length > max ? childArray.length - max : 0;

  return (
    <div className={`flex items-center -space-x-3 ${className}`}>
      {displayChildren.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          {child}
        </motion.div>
      ))}
      {remaining > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: displayChildren.length * 0.1, duration: 0.3 }}
          className="w-12 h-12 rounded-full bg-slate-700 border-2 border-[#0A0A0B] flex items-center justify-center text-sm font-semibold text-white"
        >
          +{remaining}
        </motion.div>
      )}
    </div>
  );
};

export const AvatarGroupTooltip = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};
