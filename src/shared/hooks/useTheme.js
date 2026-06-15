import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/shared/lib/store.js";

export function useTheme() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    document.body.classList.toggle("dark-mode", theme === "dark");
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0f1629" : "#1f3a60");
  }, [theme]);

  return [theme, setTheme];
}
