import { motion, useSpring, useTransform, useMotionValue } from "motion/react";
import { useEffect, useState } from "react";

interface CountingNumberProps {
  number: number;
  fromNumber?: number;
  delay?: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export const CountingNumber = ({
  number,
  fromNumber = 0,
  delay = 0,
  duration = 2,
  className = "",
  suffix = "",
  prefix = "",
}: CountingNumberProps) => {
  const [displayValue, setDisplayValue] = useState(fromNumber);
  const spring = useSpring(fromNumber, { duration: duration * 1000 });

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });

    const timeout = setTimeout(() => {
      spring.set(number);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [spring, number, delay]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};
