import { useRef } from "react";

export function useSubmitGuard() {
  const busyRef = useRef(false);

  const run = async (fn) => {
    if (busyRef.current) return { skipped: true };
    busyRef.current = true;
    try {
      return await fn();
    } finally {
      busyRef.current = false;
    }
  };

  return { run };
}
