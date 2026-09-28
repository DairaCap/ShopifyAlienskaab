import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  as?: keyof HTMLElementTagNameMap;
  delay?: number;
  duration?: number;
  yOffset?: number;
  once?: boolean;
  style?: React.CSSProperties;
};

export default function ScrollReveal({
  children,
  className = "",
  as: Tag = "div",
  delay = 0,
  duration = 0.8,
  yOffset = 40,
  once = true,
  style,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const animation = gsap.from(el, {
      y: yOffset,
      opacity: 0,
      duration,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        toggleActions: once ? "play none none reverse" : "play none none reset",
        // OPTIMIZED: Limit callbacks to reduce work
        limitCallbacks: true,
      },
    });

    // Cleanup function
    return () => {
      animation.kill();
    };
  }, [delay, duration, yOffset, once]);

  return (
    // @ts-expect-error dynamic tag ref
    // <-- 3. Inyectamos el style en el Tag
    <Tag ref={ref} className={`scroll-reveal ${className}`.trim()} style={style}>
      {children}
    </Tag>
  );
}
