import { motion } from "motion/react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, cardHover, getStaggerDelay } from "@/hooks/useAnimations";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  index = 0,
  className,
}) => {
  return (
    <motion.div
      className={cn("feature-card", className)}
      initial={fadeInUp.initial}
      whileInView={fadeInUp.animate}
      viewport={{ once: true, margin: "-50px" }}
      {...cardHover}
      {...getStaggerDelay(index)}
    >
      {/* Gradient overlay is handled by CSS ::before */}

      {/* Icon container */}
      <div className="icon-container icon-container-md mb-4">
        <Icon className="h-6 w-6 text-primary" strokeWidth={2.2} />
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

export default FeatureCard;
