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
  const motionValue = useMotionValue(fromNumber);
  const spring = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const [displayValue, setDisplayValue] = useState(fromNumber);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });

    const timeout = setTimeout(() => {
      motionValue.set(number);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [number, delay, motionValue, spring]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};
