import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Logo({
  className,
  animated = false,
  delay = 0,
}: {
  className?: string;
  animated?: boolean;
  delay?: number;
}) {
  if (!animated) {
    return (
      <svg
        fill="none"
        viewBox="-24 0 604 440"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <g fill="currentColor">
          <path d="m0 260 50.967-60h505.033l-50.967 60z" />
          <path d="m506 0h-88.158l-246.842 440h88.158z" />
          <circle cx="496" cy="135" r="35" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      fill="none"
      viewBox="-24 0 604 440"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g fill="currentColor">
        <motion.path
          d="m506 0h-88.158l-246.842 440h88.158z"
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay, ease: EASE }}
        />
        <motion.path
          d="m0 260 50.967-60h505.033l-50.967 60z"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.55, delay: delay + 0.08, ease: EASE }}
          style={{ transformBox: "fill-box", transformOrigin: "left center" }}
        />
        <motion.circle
          cx="496"
          cy="135"
          r="35"
          initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0,
            delay: delay + 0.3,
          }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      </g>
    </svg>
  );
}
