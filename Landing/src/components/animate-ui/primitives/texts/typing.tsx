import { motion } from "motion/react";

interface TypingTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  cursor?: boolean;
}

export const TypingText = ({
  text,
  className = "",
  delay = 0,
  duration = 1.5,
  cursor = false
}: TypingTextProps) => {
  return (
    <div className="inline-flex items-center">
      <motion.div
        className={className}
        initial={{ width: 0 }}
        animate={{ width: "auto" }}
        transition={{
          duration,
          delay,
          ease: "easeOut"
        }}
        style={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          display: "inline-block"
        }}
      >
        {text}
      </motion.div>
      {cursor && <TypingTextCursor />}
    </div>
  );
};

export const TypingTextCursor = ({ className = "" }: { className?: string }) => {
  return (
    <motion.span
      className={`inline-block w-0.5 h-6 bg-lime-400 ml-1 ${className}`}
      animate={{ opacity: [1, 0] }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        repeatType: "reverse",
      }}
    />
  );
};
