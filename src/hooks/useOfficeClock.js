import { useEffect, useState } from "react";

/**
 * Live local time for an office, plus whether that office is inside its
 * working hours right now.
 *
 * Formatting runs through Intl with an explicit IANA zone, so this is the
 * real local time in Karachi / Florida — DST included — not an offset we
 * hardcoded and will get wrong twice a year.
 *
 * State only changes when the rendered minute changes, so a mounted clock
 * costs one re-render per minute, not one per second.
 */
export function useOfficeClock(timeZone, workingHours = [9, 18]) {
  const [state, setState] = useState(() => read(timeZone, workingHours));

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      const next = read(timeZone, workingHours);
      setState((prev) =>
        prev.time === next.time && prev.isOpen === next.isOpen ? prev : next,
      );
      // Re-check on the next minute boundary rather than on a fixed interval,
      // so the clock flips exactly when the wall clock does.
      const delay = 60000 - (Date.now() % 60000) + 250;
      frame = window.setTimeout(tick, delay);
    };

    tick();
    return () => window.clearTimeout(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone, workingHours[0], workingHours[1]]);

  return state;
}

function read(timeZone, [open, close]) {
  try {
    const now = new Date();
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);

    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "numeric",
      hour12: false,
      weekday: "short",
    }).formatToParts(now);

    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const isWeekend = weekday === "Sat" || weekday === "Sun";

    return {
      time,
      hour,
      weekday,
      isOpen: !isWeekend && hour >= open && hour < close,
    };
  } catch {
    // An engine without full ICU still renders the shell, just without a clock.
    return { time: "--:--", hour: 0, weekday: "", isOpen: false };
  }
}
