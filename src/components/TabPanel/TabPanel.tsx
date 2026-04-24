import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { useReducedMotion, useLiveRegion } from "../SkipLink/SkipLink";
import "./TabPanel.css";

export interface TabPanelItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface TabPanelProps {
  items: TabPanelItem[];
  defaultActiveId?: string;
  label: string;
  variant?: "tabs" | "pills";
  onChange?: (id: string) => void;
}

export function TabPanel({
  items,
  defaultActiveId,
  label,
  variant = "tabs",
  onChange,
}: TabPanelProps) {
  const [activeId, setActiveId] = useState(defaultActiveId || items[0]?.id);
  const tabListRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { announce, liveRegion } = useLiveRegion();

  const activeIndex = items.findIndex((item) => item.id === activeId);

  const handleSelect = useCallback(
    (id: string) => {
      setActiveId(id);
      const item = items.find((i) => i.id === id);
      if (item) announce(`Showing ${item.label} panel`);
      onChange?.(id);
    },
    [items, announce, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let newIndex = activeIndex;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          newIndex = (activeIndex + 1) % items.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          newIndex = (activeIndex - 1 + items.length) % items.length;
          break;
        case "Home":
          e.preventDefault();
          newIndex = 0;
          break;
        case "End":
          e.preventDefault();
          newIndex = items.length - 1;
          break;
        default:
          return;
      }
      const newItem = items[newIndex];
      if (newItem) {
        handleSelect(newItem.id);
        const tabEl = tabListRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[newIndex];
        tabEl?.focus();
      }
    },
    [activeIndex, items, handleSelect]
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
    const panel = tabListRef.current
      ?.closest(".tab-panel")
      ?.querySelector('[role="tabpanel"][aria-hidden="false"]');
    panel?.classList.add("panel-enter");
    const timer = setTimeout(() => panel?.classList.remove("panel-enter"), 200);
    return () => clearTimeout(timer);
  }, [activeId, prefersReducedMotion]);

  if (items.length === 0) return null;

  return (
    <div className={`tab-panel tab-panel--${variant}`}>
      {liveRegion}
      <div
        className="tab-panel__tablist"
        role="tablist"
        aria-label={label}
        ref={tabListRef}
        onKeyDown={handleKeyDown}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={item.id === activeId}
            aria-controls={`panel-${item.id}`}
            tabIndex={item.id === activeId ? 0 : -1}
            onClick={() => handleSelect(item.id)}
            className={`tab-panel__tab ${item.id === activeId ? "tab-panel__tab--active" : ""}`}
          >
            {item.icon && (
              <span className="tab-panel__tab-icon" aria-hidden="true">{item.icon}</span>
            )}
            <span>{item.label}</span>
            {item.id === activeId && (
              <span className="sr-only">, tab {index + 1} of {items.length}</span>
            )}
          </button>
        ))}
      </div>
      <div className="tab-panel__panels">
        {items.map((item) => (
          <div
            key={item.id}
            role="tabpanel"
            id={`panel-${item.id}`}
            aria-labelledby={`tab-${item.id}`}
            aria-hidden={item.id !== activeId}
            tabIndex={0}
            className={`tab-panel__panel ${item.id === activeId ? "tab-panel__panel--active" : ""}`}
          >
            {item.id === activeId && item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
