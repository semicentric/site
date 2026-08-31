import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export const LOGO_VIEWBOX = "31 164 450 184";
export const LOGO_RATIO = "450/184";

const ORIGIN_X = 131;
const ORIGIN_Y = 262;

const RAYS = [
  { d: "M115 251.5 L126 248.5 L250 174.5 L137 194 L116 238Z", at: 0.1 },
  { d: "M57 262.5 L87.5 266 L98.5 263.5 L64.5 244Z", at: 0.145 },
  { d: "M125.5 265.5 L160 278 L471 256 L147 255.5Z", at: 0 },
  { d: "M41 303.5 L65.5 326.5 L105.5 290 L105.5 276.5Z", at: 0.19 },
  { d: "M203.5 336.5 L129.5 285.5 L129.5 294 L168.5 337.5Z", at: 0.235 },
];

const TRAIL = 2;

export default function Logo({
  className,
  animated = false,
  delay = 0,
}: {
  className?: string;
  animated?: boolean;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  if (!animated || reduced) {
    return (
      <svg
        fill="none"
        viewBox={LOGO_VIEWBOX}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <g fill="currentColor">
          {RAYS.map((ray) => (
            <path key={ray.d} d={ray.d} />
          ))}
        </g>
      </svg>
    );
  }

  return (
    <svg
      fill="none"
      viewBox={LOGO_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g fill="currentColor">
        {RAYS.map((ray, i) => {
          const trail = i === TRAIL;
          return (
            <motion.path
              key={ray.d}
              d={ray.d}
              initial={
                trail
                  ? { opacity: 0, scaleX: 0.06, scaleY: 0.7, filter: "blur(7px)" }
                  : { opacity: 0, scaleX: 0.32, scaleY: 0.32, filter: "blur(5px)" }
              }
              animate={{
                opacity: 1,
                scaleX: 1,
                scaleY: 1,
                filter: "blur(0px)",
              }}
              transition={{
                duration: trail ? 0.6 : 0.45,
                delay: delay + ray.at,
                ease: EASE,
              }}
              style={{
                transformOrigin: `${ORIGIN_X}px ${ORIGIN_Y}px`,
                willChange: "transform, opacity, filter",
              }}
            />
          );
        })}
      </g>
    </svg>
  );
}
