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
      className={cn("bg-[#1A1A1C] border border-white/10 rounded-2xl p-6 shadow-lg relative overflow-hidden group hover:border-lime-500/30 transition-all duration-300", className)}
      initial={fadeInUp.initial}
      whileInView={fadeInUp.animate}
      viewport={{ once: true, margin: "-50px" }}
      {...getStaggerDelay(index)}
    >
      {/* Quote icon */}
      <div className="absolute top-4 right-4 opacity-10">
        <Quote className="h-8 w-8 text-white rotate-180" />
      </div>

      {/* Rating stars */}
      {rating > 0 && (
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < rating ? "text-lime-500 fill-lime-500" : "text-slate-700"
              )}
            />
          ))}
        </div>
      )}

      {/* Quote text */}
      <blockquote className="text-slate-200 mb-6 leading-relaxed relative z-10 text-lg">
        "{quote}"
      </blockquote>

      {/* Before/After if provided */}
      {beforeAfter && (
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-white/5 border border-white/5">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-red-400 block mb-1">Antes</span>
            <p className="text-sm text-slate-400">{beforeAfter.before}</p>
          </div>
          <div className="border-l border-white/10 pl-4">
            <span className="text-xs uppercase tracking-wider font-bold text-lime-400 block mb-1">Depois</span>
            <p className="text-sm text-white">{beforeAfter.after}</p>
          </div>
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-lime-500/20 grayscale group-hover:grayscale-0 transition-all duration-300"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-400 font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-bold text-white text-sm">{name}</p>
          {role && (
            <p className="text-xs text-slate-500">{role}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
