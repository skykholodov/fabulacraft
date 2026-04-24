import { useState, useEffect, useCallback, useRef } from "react";

export function useKeyboardNav() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Tab") setIsKeyboardUser(true); };
    const onMouse = () => setIsKeyboardUser(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onMouse);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onMouse); };
  }, []);
  return isKeyboardUser;
}

export function useAnnounce() {
  const regionRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-atomic", "true");
    Object.assign(el.style, {
      position: "absolute", width: "1px", height: "1px", padding: "0",
      margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: "0",
    });
    document.body.appendChild(el);
    regionRef.current = el;
    return () => { document.body.removeChild(el); };
  }, []);
  const announce = useCallback((message: string) => {
    if (regionRef.current) {
      regionRef.current.textContent = "";
      requestAnimationFrame(() => { if (regionRef.current) regionRef.current.textContent = message; });
    }
  }, []);
  return announce;
}

export function useColorScheme() {
  const [scheme, setScheme] = useState<"light" | "dark" | "no-preference">("no-preference");
  useEffect(() => {
    const darkMql = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => { setScheme(darkMql.matches ? "dark" : "light"); };
    update();
    darkMql.addEventListener("change", update);
    return () => darkMql.removeEventListener("change", update);
  }, []);
  return scheme;
}

export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const check = () => setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
    check();
    window.addEventListener("touchstart", check, { once: true });
    return () => window.removeEventListener("touchstart", check);
  }, []);
  return isTouch;
}

export function usePrefersDataSaver() {
  const [savesData, setSavesData] = useState(false);
  useEffect(() => {
    const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
    if (conn && "saveData" in conn) setSavesData(conn.saveData === true);
  }, []);
  return savesData;
}
