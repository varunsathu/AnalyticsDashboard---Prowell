import { useState, useEffect } from "react";

export function useFocusMode() {
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("focusMode");
    if (stored) {
      setFocusMode(JSON.parse(stored));
    }
  }, []);

  const toggleFocusMode = () => {
    const newFocusMode = !focusMode;
    setFocusMode(newFocusMode);
    localStorage.setItem("focusMode", JSON.stringify(newFocusMode));
  };

  return {
    focusMode,
    toggleFocusMode,
  };
}
