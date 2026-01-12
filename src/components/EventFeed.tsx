"use client";

import type { Event } from "@/lib/types";
import { formatYearRange } from "@/lib/selectors";

type EventFeedProps = {
  events: Event[];
  focusedEventId?: string;
  activeYear: number;
  onSelect: (eventId: string) => void;
};

export default function EventFeed({
  events,
  focusedEventId,
  activeYear,
  onSelect,
}: EventFeedProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white/70 p-6 text-sm text-ink/70">
        No events match these filters yet. Try widening the year or clearing
        tags.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const isFocused = event.id === focusedEventId;
        const isBuilt = event.type === "build" && event.year_end <= activeYear;
        return (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelect(event.id)}
            className={`block rounded-2xl border px-4 py-3 transition hover:-translate-y-0.5 hover:border-ember/50 ${
              isFocused
                ? "border-ember bg-ember/10 shadow-lg shadow-ember/10"
                : "border-ink/10 bg-white/70"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink/60">
                  {formatYearRange(event.year_start, event.year_end)}
                </p>
                <h3 className="font-heading text-lg text-ink">{event.title}</h3>
              </div>
              {isBuilt ? <span className="ink-stamp">Completed</span> : null}
            </div>
            <p className="mt-2 text-sm text-ink/80">{event.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {event.methods.map((method) => (
                <span
                  key={method}
                  className="rounded-full border border-ink/20 bg-white/80 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.2em] text-ink/70"
                >
                  {method.replace(/_/g, " ")}
                </span>
              ))}
            </div>
            {event.quote_snippet ? (
              <p className="mt-3 text-xs italic text-ink/70">
                "{event.quote_snippet}"
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
