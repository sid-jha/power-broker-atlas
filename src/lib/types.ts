export type ChapterRef = {
  chapter: number;
  section?: string;
};

export type Chapter = {
  number: number;
  title: string;
  summary: string;
  year_start: number;
  year_end: number;
};

export type EventType =
  | "build"
  | "policy"
  | "appointment"
  | "finance"
  | "opposition"
  | "media"
  | "legal";

export type Event = {
  id: string;
  title: string;
  summary: string;
  year_start: number;
  year_end: number;
  chapter_refs: ChapterRef[];
  type: EventType;
  methods: string[];
  stakeholders: string[];
  power_delta: number;
  quote_snippet?: string;
  sources: Array<{
    citation: string;
    url?: string;
    page?: string;
  }>;
};

export type Stakeholder = {
  id: string;
  name: string;
  type: "person" | "institution";
  description: string;
};

export type Edge = {
  source_id: string;
  target_id: string;
  relation: "ally" | "opponent" | "controls" | "influences";
  year_start: number;
  year_end: number;
  chapter_refs: number[];
  weight: number;
};

export type BuildProperties = {
  id: string;
  name: string;
  category: string;
  year_start: number;
  year_end: number;
  chapter_refs: number[];
  status: "proposed" | "under_construction" | "completed";
  primary_event_id: string;
};
