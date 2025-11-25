import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, getStaggerDelay } from "@/hooks/useAnimations";

interface TestimonialCardProps {
  name: string;
  role?: string;
  avatar?: string;
  quote: string;
  rating?: number;
  beforeAfter?: {
    before: string;
    after: string;
  };
  index?: number;
  className?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  avatar,
  quote,
  rating = 5,
  beforeAfter,
  index = 0,
  className,
}) => {
  return (
    <motion.div
      className={cn("testimonial-card", className)}
      initial={fadeInUp.initial}
      whileInView={fadeInUp.animate}
      viewport={{ once: true, margin: "-50px" }}
      {...getStaggerDelay(index)}
    >
      {/* Quote icon */}
      <div className="absolute -top-3 -left-2 icon-container icon-container-sm bg-primary/20">
        <Quote className="h-4 w-4 text-primary" />
      </div>

      {/* Rating stars */}
      {rating > 0 && (
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < rating ? "text-primary fill-primary" : "text-muted-foreground"
              )}
            />
          ))}
        </div>
      )}

      {/* Quote text */}
      <blockquote className="text-foreground mb-4 leading-relaxed">
        "{quote}"
      </blockquote>

      {/* Before/After if provided */}
      {beforeAfter && (
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 rounded-xl bg-muted/50">
          <div>
            <span className="section-label text-destructive">Antes</span>
            <p className="text-sm text-muted-foreground mt-1">{beforeAfter.before}</p>
          </div>
          <div>
            <span className="section-label text-primary">Depois</span>
            <p className="text-sm text-foreground mt-1">{beforeAfter.after}</p>
          </div>
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-border/30">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p className="font-semibold text-foreground text-sm">{name}</p>
          {role && (
            <p className="text-xs text-muted-foreground">{role}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
