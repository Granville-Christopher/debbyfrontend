import { useRef } from "react";
import { useInView } from "framer-motion";

export function useScrollReveal(once = true, margin = "-80px") {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once, margin: margin as never });
  return { ref, isInView };
}

