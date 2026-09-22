"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

const storageKey = "portfolio-theme";
const changeEvent = "portfolio-theme-change";

function applyTheme(value: string | null) {
  if (value === "light" || value === "dark") {
    document.documentElement.dataset.theme = value;
  } else {
    delete document.documentElement.dataset.theme;
  }
}

function restoreTheme() {
  try {
    applyTheme(localStorage.getItem(storageKey));
  } catch {
    // The control still works for this page when storage is unavailable.
  }
}

function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) {
      restoreTheme();
      notify();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, notify);
  };
}

function getTheme() {
  return document.documentElement.dataset.theme ?? "system";
}

export function ThemePicker() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "system");

  // React's development remount can reset attributes on <html>.
  useLayoutEffect(() => {
    restoreTheme();
    window.dispatchEvent(new Event(changeEvent));
  }, []);

  return (
    <label className="theme-picker">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" />
      </svg>
      <span className="sr-only">Color theme</span>
      <select
        value={theme}
        onChange={(event) => {
          const value = event.target.value;
          applyTheme(value);
          try {
            if (value === "system") localStorage.removeItem(storageKey);
            else localStorage.setItem(storageKey, value);
          } catch {
            // Saving is optional; applying the selected theme is not.
          }
          window.dispatchEvent(new Event(changeEvent));
        }}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
