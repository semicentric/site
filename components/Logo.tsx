import { motion } from "framer-motion";
import { useState } from "react";

export default function Logo({
  className,
  animated = false,
}: {
  className?: string;
  animated?: boolean;
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

  return <AnimatedLogo className={className} />;
}

function AnimatedLogo({ className }: { className?: string }) {
  const [done, setDone] = useState(false);
  const gpu = done ? undefined : ("transform" as const);

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
          initial={{ opacity: 0, x: -30, scaleY: 0.7 }}
          animate={{ opacity: 1, x: 0, scaleY: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.0,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: "center center", willChange: gpu }}
        />
        <motion.path
          d="m0 260 50.967-60h505.033l-50.967 60z"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: "left center", willChange: gpu }}
        />
        <motion.circle
          cx="496"
          cy="135"
          r="35"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            delay: 0.4,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          style={{ transformOrigin: "496px 135px", willChange: gpu }}
          onAnimationComplete={() => setDone(true)}
        />
      </g>
    </svg>
  );
}
