import { useState, useRef, useEffect, useCallback } from "react";

interface SkipLinkProps {
  targetId: string;
  label?: string;
}

export function SkipLink({ targetId, label = "Skip to main content" }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="skip-link"
      style={{
        position: "absolute",
        top: "-100%",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "0.75rem 1.5rem",
        background: "var(--color-primary-600)",
        color: "white",
        borderRadius: "var(--radius-md)",
        fontWeight: 600,
        zIndex: 9999,
        transition: "top var(--transition-fast)",
        textDecoration: "none",
      }}
      onFocus={(e) => {
        (e.target as HTMLElement).style.top = "0.5rem";
      }}
      onBlur={(e) => {
        (e.target as HTMLElement).style.top = "-100%";
      }}
    >
      {label}
    </a>
  );
}

export function useReducedMotion(defaultValue = false) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(defaultValue);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

export function useFocusTrap(enabled: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    const container = containerRef.current;
    const selector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);

  return containerRef;
}

export function useLiveRegion(politeness: "polite" | "assertive" = "polite") {
  const [message, setMessage] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const announce = useCallback((text: string, timeout = 5000) => {
    setMessage("");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    requestAnimationFrame(() => {
      setMessage(text);
      timeoutRef.current = setTimeout(() => setMessage(""), timeout);
    });
  }, []);

  const liveRegion = (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {message}
    </div>
  );

  return { announce, liveRegion };
}

export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(forced-colors: active)");
    setIsHighContrast(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isHighContrast;
}
