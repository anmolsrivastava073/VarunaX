"use client";

import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Force manual scroll restoration
      window.history.scrollRestoration = "manual";
      
      // 2. Instantly jump to the top
      window.scrollTo(0, 0);

      // 3. Silently remove the #hash from the URL if it exists
      if (window.location.hash) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
    }
  }, []);

  return null;
}