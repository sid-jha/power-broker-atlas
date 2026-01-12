"use client";

import { useMemo, useState } from "react";
import chaptersData from "@/data/chapters.json";
import eventsData from "@/data/events.json";
import {
  computePowerIndex,
  filterEventsByChapter,
  filterEventsByYear,
  formatYearRange,
  getChapterByNumber,
  getEventById,
  getYearExtent,
  methodTags,
  tagLabels,
} from "@/lib/selectors";
import type { Chapter, Event } from "@/lib/types";
import EventFeed from "@/components/EventFeed";
import MapPanel from "@/components/MapPanel";
import PowerIndex from "@/components/PowerIndex";

const chapters = chaptersData as Chapter[];
const events = eventsData as Event[];

export default function PowerBrokerPage() {
  const [chapterSearch, setChapterSearch] = useState("");
  const [mode, setMode] = useState<"year" | "chapter">("year");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null);
  const { minYear, maxYear } = getYearExtent(events, chapters);
  const [activeYear, setActiveYear] = useState(minYear);
  const [selectedChapter, setSelectedChapter] = useState(
    chapters[0]?.number ?? 1
  );

  const focusedEvent = useMemo(() => {
    if (!focusedEventId) return null;
    return getEventById(events, focusedEventId);
  }, [focusedEventId]);

  const activeChapter = chapters.find(
    (chapter) =>
      activeYear >= chapter.year_start && activeYear <= chapter.year_end
  );

  const filteredEvents =
    mode === "chapter"
      ? filterEventsByChapter(
          events,
          selectedChapter,
          selectedTags,
          false
        )
      : filterEventsByYear(events, activeYear, selectedTags, false);

  const mergedEvents = useMemo(() => {
    if (!focusedEvent) return filteredEvents;
    const without = filteredEvents.filter((event) => event.id !== focusedEvent.id);
    return [focusedEvent, ...without];
  }, [filteredEvents, focusedEvent]);

  const visibleEvents = mergedEvents.slice(0, 8);

  const mapEventIds = useMemo(() => {
    if (selectedTags.length === 0) return [];
    const ids = new Set(filteredEvents.map((event) => event.id));
    if (focusedEvent) ids.add(focusedEvent.id);
    return Array.from(ids);
  }, [filteredEvents, focusedEvent, selectedTags]);

  const powerIndex = computePowerIndex(events, activeYear, false, 46);

  const navigateToYear = (year: number) => {
    setMode("year");
    setActiveYear(year);
  };

  const navigateToChapter = (chapter: number) => {
    setMode("chapter");
    setSelectedChapter(chapter);
    const chapterYear = getChapterByNumber(chapters, chapter)?.year_end ?? minYear;
    setActiveYear(chapterYear);
  };

  const toggleTag = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((item) => item !== tag)
      : [...selectedTags, tag];
    setSelectedTags(next);
  };

  const handleEventSelect = (eventId: string) => {
    setFocusedEventId(eventId);
  };

  const filteredChapters = chapters.filter((chapter) => {
    const query = chapterSearch.toLowerCase();
    return (
      chapter.title.toLowerCase().includes(query) ||
      chapter.summary.toLowerCase().includes(query) ||
      chapter.number.toString().includes(query)
    );
  });

  return (
    <div className="min-h-screen text-ink">
      <header className="flex flex-col gap-4 border-b border-ink/10 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-ink/60">
            The Power Broker Atlas
          </p>
          <h1 className="mt-2 text-2xl font-heading text-ink lg:text-3xl">
            Construction, coalitions, and collapse across the city map
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink/70">
            Move through chapters or years to watch infrastructure rise while
            the power index pivots under pressure.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PowerIndex score={powerIndex.score} label={powerIndex.label} />
        </div>
      </header>

      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[260px_minmax(0,1fr)_340px]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-4 shadow-sm">
            <div className="flex rounded-full border border-ink/15 bg-white/80 p-1 text-xs uppercase tracking-[0.3em]">
              <button
                type="button"
                onClick={() => navigateToChapter(selectedChapter)}
                className={`flex-1 rounded-full px-3 py-1 ${
                  mode === "chapter" ? "bg-ink text-paper" : "text-ink/60"
                }`}
              >
                By Chapter
              </button>
              <button
                type="button"
                onClick={() => navigateToYear(activeYear)}
                className={`flex-1 rounded-full px-3 py-1 ${
                  mode === "year" ? "bg-ink text-paper" : "text-ink/60"
                }`}
              >
                By Year
              </button>
            </div>

            {mode === "chapter" ? (
              <div className="mt-4 space-y-3">
                <input
                  value={chapterSearch}
                  onChange={(event) => setChapterSearch(event.target.value)}
                  placeholder="Search chapters"
                  className="w-full rounded-full border border-ink/15 bg-white/80 px-4 py-2 text-sm text-ink placeholder:text-ink/40"
                />
                <div className="space-y-2">
                  {filteredChapters.map((chapter) => (
                    <button
                      key={chapter.number}
                      type="button"
                      onClick={() => navigateToChapter(chapter.number)}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                        chapter.number === selectedChapter
                          ? "border-ember/50 bg-ember/10 text-ink"
                          : "border-ink/10 bg-white/80 text-ink/70 hover:border-ember/30"
                      }`}
                    >
                      <div className="text-xs uppercase tracking-[0.3em] text-ink/50">
                        Chapter {chapter.number}
                      </div>
                      <div className="font-heading text-base text-ink">
                        {chapter.title}
                      </div>
                      <div className="text-xs text-ink/60">
                        {chapter.summary}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-ink/10 bg-white/80 px-3 py-3 text-center">
                  <div className="text-xs uppercase tracking-[0.35em] text-ink/60">
                    Year Focus
                  </div>
                  <div className="mt-2 text-3xl font-heading text-ink">
                    {activeYear}
                  </div>
                  {activeChapter ? (
                    <div className="mt-2 text-xs text-ink/60">
                      Chapter {activeChapter.number}: {activeChapter.title}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 rounded-full border border-ink/15 bg-white/80 px-3 py-2">
                  <span className="text-[0.6rem] uppercase tracking-[0.35em] text-ink/60">
                    Jump
                  </span>
                  <input
                    type="number"
                    min={minYear}
                    max={maxYear}
                    value={activeYear}
                    onChange={(event) => {
                      const nextYear = Number(event.target.value);
                      if (Number.isNaN(nextYear)) return;
                      navigateToYear(
                        Math.min(maxYear, Math.max(minYear, nextYear))
                      );
                    }}
                    className="w-full bg-transparent text-right text-sm text-ink focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min={minYear}
                  max={maxYear}
                  value={activeYear}
                  onChange={(event) => navigateToYear(Number(event.target.value))}
                  className="w-full accent-ember"
                />
                <div className="flex justify-between text-[0.6rem] uppercase tracking-[0.2em] text-ink/50">
                  <span>{minYear}</span>
                  <span>{maxYear}</span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white/70 p-4 text-sm text-ink/70">
            <div className="text-xs uppercase tracking-[0.35em] text-ink/50">
              Current Window
            </div>
            <div className="mt-2 font-heading text-lg text-ink">
              {mode === "chapter"
                ? `Chapter ${selectedChapter}`
                : `Year ${activeYear}`}
            </div>
            {activeChapter ? (
              <p className="mt-2 text-xs text-ink/60">
                {formatYearRange(activeChapter.year_start, activeChapter.year_end)}{" "}
                - {activeChapter.summary}
              </p>
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
          <div className="map-shell h-[380px] md:h-[520px]">
            <MapPanel
              activeYear={activeYear}
              activeEventIds={mapEventIds}
            />
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm text-ink/70">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.3em] text-ink/60">
              <span>Builds on the map</span>
              <span className="text-ink/50">
                {mode === "chapter" ? `Chapter ${selectedChapter}` : `Year ${activeYear}`}
              </span>
            </div>
            <p className="mt-2 text-xs text-ink/60">
              Inked lines trace parkways and expressways. Stamped circles mark pools and bridges.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-4">
            <div className="text-xs uppercase tracking-[0.3em] text-ink/50">
              Methods of Power
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {methodTags.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] transition ${
                      isActive
                        ? "border-ember/50 bg-ember/15 text-ember"
                        : "border-ink/20 bg-white/80 text-ink/60 hover:border-ember/30"
                    }`}
                  >
                    {tagLabels[tag]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white/70 p-4">
            <div className="text-xs uppercase tracking-[0.35em] text-ink/50">
              Event Feed
            </div>
            <div className="mt-4">
              <EventFeed
                events={visibleEvents}
                focusedEventId={focusedEvent?.id}
                activeYear={activeYear}
                onSelect={handleEventSelect}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
