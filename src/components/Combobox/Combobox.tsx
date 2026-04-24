import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { useLiveRegion } from "../SkipLink/SkipLink";
import "./Combobox.css";

export interface ComboboxOption {
  value: string;
  label: string;
  group?: string;
  description?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  noResultsMessage?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
}

export function Combobox({
  options,
  label,
  placeholder = "Search or select...",
  value: controlledValue,
  onChange,
  onSearch,
  noResultsMessage = "No matches found",
  required = false,
  disabled = false,
  clearable = true,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(controlledValue || "");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedValue, setSelectedValue] = useState(controlledValue || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const { announce, liveRegion } = useLiveRegion();

  const filteredOptions = onSearch
    ? options
    : options.filter((opt) => opt.label.toLowerCase().includes(inputValue.toLowerCase()));

  const grouped = filteredOptions.reduce<Record<string, ComboboxOption[]>>(
    (acc, opt) => {
      const group = opt.group || "";
      if (!acc[group]) acc[group] = [];
      acc[group].push(opt);
      return acc;
    },
    {}
  );

  const flatFiltered = filteredOptions;

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInputValue(controlledValue);
      setSelectedValue(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      const activeEl = listboxRef.current?.querySelector(`[data-index="${activeIndex}"]`);
      activeEl?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, isOpen]);

  const handleSelect = useCallback(
    (option: ComboboxOption) => {
      setInputValue(option.label);
      setSelectedValue(option.value);
      setIsOpen(false);
      setActiveIndex(-1);
      announce(`Selected ${option.label}`);
      onChange?.(option.value);
      inputRef.current?.focus();
    },
    [onChange, announce]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);
      setSelectedValue("");
      setIsOpen(true);
      setActiveIndex(0);
      onSearch?.(val);
      if (val.length > 0) {
        announce(`${filteredOptions.length} result${filteredOptions.length !== 1 ? "s" : ""} available`);
      }
    },
    [onSearch, filteredOptions.length, announce]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) { setIsOpen(true); setActiveIndex(0); }
          else setActiveIndex((prev) => (prev < flatFiltered.length - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          if (isOpen) setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (isOpen && activeIndex >= 0 && flatFiltered[activeIndex]) handleSelect(flatFiltered[activeIndex]);
          break;
        case "Escape":
          setIsOpen(false);
          setActiveIndex(-1);
          inputRef.current?.select();
          break;
        case "Tab":
          setIsOpen(false);
          setActiveIndex(-1);
          break;
        case "Backspace":
          if (clearable && inputValue === "" && selectedValue) {
            setSelectedValue("");
            onChange?.("");
          }
          break;
      }
    },
    [disabled, isOpen, activeIndex, flatFiltered, handleSelect, clearable, inputValue, selectedValue, onChange]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    setSelectedValue("");
    onChange?.("");
    inputRef.current?.focus();
    announce("Selection cleared");
  }, [onChange, announce]);

  const labelId = `${generatedId}-label`;
  const inputId = `${generatedId}-input`;
  const listboxId = `${generatedId}-listbox`;

  return (
    <div className="combobox" ref={comboboxRef}>
      {liveRegion}
      <label id={labelId} htmlFor={inputId} className="combobox__label">
        {label}
        {required && <span aria-hidden="true" className="combobox__required">*</span>}
      </label>
      <div className="combobox__control">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          className="combobox__input"
          role="combobox"
          aria-labelledby={labelId}
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={isOpen && activeIndex >= 0 ? `${generatedId}-option-${activeIndex}` : undefined}
          aria-required={required}
          aria-describedby={required ? `${generatedId}-required-hint` : undefined}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (flatFiltered.length > 0) setIsOpen(true); }}
        />
        {clearable && inputValue && !disabled && (
          <button className="combobox__clear" onClick={handleClear} aria-label="Clear selection" tabIndex={-1} type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <button
          className="combobox__toggle"
          onClick={() => { if (!disabled) { setIsOpen(!isOpen); if (!isOpen) inputRef.current?.focus(); } }}
          aria-label={isOpen ? "Close options" : "Open options"}
          tabIndex={-1}
          type="button"
          disabled={disabled}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={isOpen ? "combobox__chevron--open" : ""}>
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {required && (
        <span id={`${generatedId}-required-hint`} className="combobox__hint sr-only">Required field</span>
      )}
      {isOpen && (
        <ul ref={listboxRef} id={listboxId} role="listbox" aria-labelledby={labelId} className="combobox__listbox">
          {flatFiltered.length === 0 ? (
            <li className="combobox__no-results" role="option" aria-selected={false} aria-disabled="true">{noResultsMessage}</li>
          ) : (
            Object.entries(grouped).map(([group, groupOptions]) => (
              <li key={group || "__ungrouped"} role="group">
                {group && <div className="combobox__group-label" role="presentation">{group}</div>}
                {groupOptions.map((option) => {
                  const globalIndex = flatFiltered.indexOf(option);
                  return (
                    <div
                      key={option.value}
                      id={`${generatedId}-option-${globalIndex}`}
                      role="option"
                      aria-selected={selectedValue === option.value}
                      data-index={globalIndex}
                      className={`combobox__option ${activeIndex === globalIndex ? "combobox__option--active" : ""} ${selectedValue === option.value ? "combobox__option--selected" : ""}`}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setActiveIndex(globalIndex)}
                    >
                      <span className="combobox__option-label">{highlightMatch(option.label, inputValue)}</span>
                      {option.description && <span className="combobox__option-desc">{option.description}</span>}
                      {selectedValue === option.value && (
                        <svg className="combobox__check" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="combobox__highlight">{part}</mark> : part
  );
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
