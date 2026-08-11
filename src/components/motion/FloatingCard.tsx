import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Gentle, slow vertical float with a soft hover lift. */
export function FloatingCard({
  children,
  className,
  delay = 0,
  amplitude = 8,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amplitude?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={reduce ? {} : { y: [0, -amplitude, 0] }}
      transition={{ duration: 7 + delay, delay, repeat: Infinity, ease: "easeInOut" }}
      whileHover={reduce ? {} : { y: -amplitude - 4, scale: 1.01 }}
    >
      {children}
    </motion.div>
  );
}
