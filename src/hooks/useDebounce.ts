import { useEffect, useState } from "react";

export default function useDebounce<T>(
  value: T,
  delay: number,
  condition = true
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      if (condition) {
        setDebouncedValue(value);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, condition]);

  return debouncedValue;
}
