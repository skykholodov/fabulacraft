import { useState } from "react";
import { SkipLink, TabPanel, PaginatedList, Combobox } from "./components";
import type { TabPanelItem, ComboboxOption, PaginatedListItem } from "./components";
import "./App.css";

const tabItems: TabPanelItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <span>&#9673;</span>,
    content: (
      <div>
        <h3>Inclusive Design Patterns</h3>
        <p>
          This library provides accessible alternatives to common problematic UI
          patterns. Each component follows WAI-ARIA guidelines, supports keyboard
          navigation, and respects user preferences like reduced motion.
        </p>
        <ul style={{ marginTop: "1rem", paddingLeft: "1.5rem" }}>
          <li>TabPanel replaces auto-advancing carousels</li>
          <li>PaginatedList replaces infinite scroll</li>
          <li>Combobox replaces complex nested dropdowns</li>
        </ul>
      </div>
    ),
  },
  {
    id: "why",
    label: "Why These Alternatives",
    icon: <span>&#9881;</span>,
    content: (
      <div>
        <h3>Problems with Common Patterns</h3>
        <dl style={{ marginTop: "1rem" }}>
          <dt style={{ fontWeight: 600, marginTop: "0.75rem" }}>Carousels</dt>
          <dd style={{ marginLeft: "1.5rem", color: "var(--color-neutral-600)" }}>
            Auto-advancing carousels are difficult for screen reader users to
            pause, low-vision users to read, and motor-impaired users to
            interact with. Content is often missed entirely.
          </dd>
          <dt style={{ fontWeight: 600, marginTop: "0.75rem" }}>Infinite Scroll</dt>
          <dd style={{ marginLeft: "1.5rem", color: "var(--color-neutral-600)" }}>
            Infinite scroll breaks the browser's back button, makes it
            impossible to reach footer content, traps keyboard users, and
            prevents screen reader users from knowing how much content exists.
          </dd>
          <dt style={{ fontWeight: 600, marginTop: "0.75rem" }}>Complex Dropdowns</dt>
          <dd style={{ marginLeft: "1.5rem", color: "var(--color-neutral-600)" }}>
            Deeply nested dropdown menus require precise mouse control, are
            difficult to navigate with keyboards, and often lack proper ARIA
            roles for screen reader users.
          </dd>
        </dl>
      </div>
    ),
  },
  {
    id: "principles",
    label: "Design Principles",
    icon: <span>&#9733;</span>,
    content: (
      <div>
        <h3>Core Principles</h3>
        <ol style={{ marginTop: "1rem", paddingLeft: "1.5rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Perceivable</strong> - Content is presentable in ways all users can perceive.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Operable</strong> - Every interaction works with keyboard, voice, switch, and pointing devices.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Understandable</strong> - Content and interactions are predictable and consistent.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Robust</strong> - Content works across current and future technologies, including assistive tech.
          </li>
        </ol>
      </div>
    ),
  },
  {
    id: "enhancement",
    label: "Progressive Enhancement",
    icon: <span>&#8593;</span>,
    content: (
      <div>
        <h3>Progressive Enhancement Strategy</h3>
        <p>
          All components are built in layers. The base layer works without
          JavaScript. The enhancement layer adds interactivity. The preference
          layer respects user settings.
        </p>
        <div style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
          <div style={{ padding: "1rem", background: "var(--color-success-50)", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--color-success-500)" }}>
            <strong>Base:</strong> Semantic HTML that works everywhere
          </div>
          <div style={{ padding: "1rem", background: "var(--color-primary-50)", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--color-primary-500)" }}>
            <strong>Enhancement:</strong> ARIA roles, keyboard nav, live regions
          </div>
          <div style={{ padding: "1rem", background: "var(--color-warning-50)", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--color-warning-500)" }}>
            <strong>Preference:</strong> Respects reduced-motion, high-contrast, color-scheme
          </div>
        </div>
      </div>
    ),
  },
];

const listItems: PaginatedListItem[] = Array.from({ length: 47 }, (_, i) => ({
  id: `item-${i + 1}`,
  content: (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <strong>Resource {i + 1}</strong>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-neutral-500)" }}>
          Accessible design pattern example with full keyboard support
        </p>
      </div>
      <span
        style={{
          padding: "0.25rem 0.75rem",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          fontWeight: 600,
          background: i % 3 === 0 ? "var(--color-success-50)" : i % 3 === 1 ? "var(--color-warning-50)" : "var(--color-primary-50)",
          color: i % 3 === 0 ? "var(--color-success-700)" : i % 3 === 1 ? "var(--color-warning-700)" : "var(--color-primary-700)",
        }}
      >
        {i % 3 === 0 ? "Guide" : i % 3 === 1 ? "Pattern" : "Component"}
      </span>
    </div>
  ),
}));

const comboboxOptions: ComboboxOption[] = [
  { value: "react", label: "React", group: "Frontend Frameworks", description: "UI library" },
  { value: "vue", label: "Vue.js", group: "Frontend Frameworks", description: "Progressive framework" },
  { value: "angular", label: "Angular", group: "Frontend Frameworks", description: "Full framework" },
  { value: "svelte", label: "Svelte", group: "Frontend Frameworks", description: "Compiler" },
  { value: "tailwind", label: "Tailwind CSS", group: "CSS Tools", description: "Utility-first" },
  { value: "sass", label: "Sass", group: "CSS Tools", description: "Preprocessor" },
  { value: "vite", label: "Vite", group: "Build Tools", description: "Next-gen bundler" },
  { value: "webpack", label: "Webpack", group: "Build Tools", description: "Module bundler" },
  { value: "eslint", label: "ESLint", group: "Quality Tools", description: "Linter" },
  { value: "prettier", label: "Prettier", group: "Quality Tools", description: "Formatter" },
  { value: "jest", label: "Jest", group: "Testing", description: "Test framework" },
  { value: "cypress", label: "Cypress", group: "Testing", description: "E2E testing" },
  { value: "playwright", label: "Playwright", group: "Testing", description: "E2E + a11y" },
  { value: "axe", label: "axe-core", group: "Accessibility", description: "A11y testing" },
  { value: "lighthouse", label: "Lighthouse", group: "Accessibility", description: "Audits" },
];

function App() {
  const [selectedTool, setSelectedTool] = useState("");

  return (
    <>
      <SkipLink targetId="main-content" />

      <header className="app-header">
        <div className="app-header__inner">
          <h1 className="app-header__title">Inclusive UI Patterns</h1>
          <p className="app-header__subtitle">
            Accessible alternatives to common problematic patterns
          </p>
        </div>
      </header>

      <main id="main-content" className="app-main" tabIndex={-1}>
        <section className="app-section" aria-labelledby="section-tabs">
          <h2 id="section-tabs" className="section-title">
            TabPanel
            <span className="section-badge">Carousel Alternative</span>
          </h2>
          <p className="section-description">
            Replaces auto-advancing carousels with user-controlled tabs. Content
            is always visible, navigable by keyboard, and announced to screen
            readers. Arrow keys move between tabs; Home/End jump to first/last.
          </p>
          <TabPanel items={tabItems} label="Inclusive design topics" variant="pills" />
        </section>

        <section className="app-section" aria-labelledby="section-list">
          <h2 id="section-list" className="section-title">
            PaginatedList
            <span className="section-badge">Infinite Scroll Alternative</span>
          </h2>
          <p className="section-description">
            Replaces infinite scroll with predictable pagination. Users always
            know how much content exists, can jump to any page, and the footer
            remains reachable. Screen readers announce page changes.
          </p>
          <PaginatedList
            items={listItems}
            pageSize={8}
            label="Accessibility resources"
            emptyMessage="No resources found."
          />
        </section>

        <section className="app-section" aria-labelledby="section-combobox">
          <h2 id="section-combobox" className="section-title">
            Combobox
            <span className="section-badge">Complex Dropdown Alternative</span>
          </h2>
          <p className="section-description">
            Replaces deeply nested dropdown menus with a searchable combobox.
            Type to filter, arrow keys to navigate, Enter to select. Grouped
            options provide structure without nesting. Screen readers announce
            result counts and selections.
          </p>
          <Combobox
            options={comboboxOptions}
            label="Select a tool"
            placeholder="Search tools..."
            value={selectedTool}
            onChange={setSelectedTool}
            required
          />
          {selectedTool && (
            <p className="selection-feedback" role="status" aria-live="polite">
              Selected: <strong>{selectedTool}</strong>
            </p>
          )}
        </section>

        <section className="app-section" aria-labelledby="section-patterns">
          <h2 id="section-patterns" className="section-title">
            Inclusive Design Patterns Reference
          </h2>
          <div className="patterns-grid">
            <div className="pattern-card">
              <h3>Keyboard Navigation</h3>
              <ul>
                <li>Arrow keys for directional navigation</li>
                <li>Home/End for first/last items</li>
                <li>Escape to dismiss overlays</li>
                <li>Tab moves between widgets, not within</li>
                <li>Focus is always visible and managed</li>
              </ul>
            </div>
            <div className="pattern-card">
              <h3>Screen Reader Support</h3>
              <ul>
                <li>ARIA roles: tablist, tab, tabpanel, combobox, listbox</li>
                <li>Live regions announce dynamic changes</li>
                <li>Labels and descriptions on all controls</li>
                <li>State communicated via aria-selected, aria-expanded</li>
                <li>Position info: "tab 2 of 4"</li>
              </ul>
            </div>
            <div className="pattern-card">
              <h3>Progressive Enhancement</h3>
              <ul>
                <li>Base: semantic HTML works without JS</li>
                <li>Enhanced: ARIA, keyboard, live regions</li>
                <li>Respects prefers-reduced-motion</li>
                <li>Respects prefers-color-scheme</li>
                <li>Respects forced-colors (high contrast)</li>
              </ul>
            </div>
            <div className="pattern-card">
              <h3>Cognitive Accessibility</h3>
              <ul>
                <li>Predictable, consistent interactions</li>
                <li>Clear labels and instructions</li>
                <li>No auto-advancing content</li>
                <li>Visible state changes with announcements</li>
                <li>Simple language in error messages</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>
          Built with WAI-ARIA Authoring Practices, WCAG 2.2, and ARIA 1.3
          patterns. All components tested with keyboard, VoiceOver, and NVDA.
        </p>
      </footer>
    </>
  );
}

export default App;
