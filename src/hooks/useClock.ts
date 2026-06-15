import { format } from "date-fns";
import { useEffect, useState } from "react";

export function useClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return format(now, "dd MMM yyyy, hh:mm a");
}
