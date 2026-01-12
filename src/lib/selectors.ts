import type { Chapter, Edge, Event, Stakeholder } from "./types";

export const methodTags = [
  "legal_authority",
  "budget_control",
  "bureaucratic_insulation",
  "patronage_procurement",
  "agenda_setting",
  "public_narrative",
  "engineering_as_politics",
  "process_bulldozing",
  "federal_leverage",
  "institution_building",
] as const;

export const tagLabels: Record<string, string> = {
  legal_authority: "Legal Authority",
  budget_control: "Budget Control",
  bureaucratic_insulation: "Bureaucratic Insulation",
  patronage_procurement: "Patronage Procurement",
  agenda_setting: "Agenda Setting",
  public_narrative: "Public Narrative",
  engineering_as_politics: "Engineering as Politics",
  process_bulldozing: "Process Bulldozing",
  federal_leverage: "Federal Leverage",
  institution_building: "Institution Building",
};

export function getYearExtent(events: Event[], chapters: Chapter[]) {
  const eventYears = events.flatMap((event) => [
    event.year_start,
    event.year_end,
  ]);
  const chapterYears = chapters.flatMap((chapter) => [
    chapter.year_start,
    chapter.year_end,
  ]);
  const allYears = [...eventYears, ...chapterYears];
  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);
  return { minYear, maxYear };
}

export function getChapterByNumber(chapters: Chapter[], number: number) {
  return chapters.find((chapter) => chapter.number === number) ?? null;
}

export function getEventById(events: Event[], id: string) {
  return events.find((event) => event.id === id) ?? null;
}

export function formatYearRange(start: number, end: number) {
  return start === end ? `${start}` : `${start}-${end}`;
}

export function filterEventsByYear(
  events: Event[],
  year: number,
  tags: string[],
  includeOpposition: boolean
) {
  return events
    .filter((event) => event.year_start <= year && event.year_end >= year)
    .filter((event) => (includeOpposition ? true : event.type !== "opposition"))
    .filter((event) =>
      tags.length === 0 ? true : tags.some((tag) => event.methods.includes(tag))
    )
    .sort((a, b) => a.year_start - b.year_start);
}

export function filterEventsByChapter(
  events: Event[],
  chapter: number,
  tags: string[],
  includeOpposition: boolean
) {
  return events
    .filter((event) =>
      event.chapter_refs.some((ref) => ref.chapter === chapter)
    )
    .filter((event) => (includeOpposition ? true : event.type !== "opposition"))
    .filter((event) =>
      tags.length === 0 ? true : tags.some((tag) => event.methods.includes(tag))
    )
    .sort((a, b) => a.year_start - b.year_start);
}

export function computePowerIndex(
  events: Event[],
  activeYear: number,
  includeOpposition: boolean,
  base = 48
) {
  const totalDelta = events
    .filter((event) => event.year_end <= activeYear)
    .filter((event) => (includeOpposition ? true : event.type !== "opposition"))
    .reduce((sum, event) => sum + event.power_delta, 0);
  const raw = base + totalDelta;
  const score = Math.max(0, Math.min(100, raw));
  return {
    score,
    label: getPowerLabel(score),
  };
}

export function getPowerLabel(score: number) {
  if (score >= 75) return "Peak";
  if (score >= 60) return "Rising";
  if (score >= 45) return "Contested";
  return "Declining";
}

export function getActiveYear({
  mode,
  value,
  chapters,
  event,
  fallbackYear,
}: {
  mode: "year" | "chapter" | "event";
  value?: number;
  chapters: Chapter[];
  event?: Event | null;
  fallbackYear: number;
}) {
  if (mode === "year" && value) return value;
  if (mode === "chapter" && value) {
    return getChapterByNumber(chapters, value)?.year_end ?? fallbackYear;
  }
  if (mode === "event" && event) {
    return event.year_end;
  }
  return fallbackYear;
}

export function getEventIds(events: Event[]) {
  return events.map((event) => event.id);
}

export function filterEdgesByYear(edges: Edge[], year: number) {
  return edges.filter(
    (edge) => edge.year_start <= year && edge.year_end >= year
  );
}

export function filterEdgesByChapter(edges: Edge[], chapter: number) {
  return edges.filter((edge) => edge.chapter_refs.includes(chapter));
}

export function resolveStakeholders(
  stakeholders: Stakeholder[],
  ids: string[]
) {
  const lookup = new Map(stakeholders.map((stakeholder) => [stakeholder.id, stakeholder]));
  return ids
    .map((id) => lookup.get(id))
    .filter((stakeholder): stakeholder is Stakeholder => Boolean(stakeholder));
}
