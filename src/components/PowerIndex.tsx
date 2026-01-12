"use client";

type PowerIndexProps = {
  score: number;
  label: string;
};

export default function PowerIndex({ score, label }: PowerIndexProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-ink/15 bg-white/80 px-4 py-2 shadow-sm shadow-ink/5">
      <div className="text-right">
        <p className="text-[0.6rem] uppercase tracking-[0.35em] text-ink/60">
          Power Index
        </p>
        <p className="text-2xl font-semibold text-ink">{score}</p>
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-ink/70">
          {label}
        </p>
      </div>
      <div className="flex h-12 w-3 items-end rounded-full bg-ink/10">
        <div
          className="w-full rounded-full bg-ember"
          style={{ height: `${Math.max(8, (score / 100) * 48)}px` }}
        />
      </div>
    </div>
  );
}
