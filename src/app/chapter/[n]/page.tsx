import { redirect } from "next/navigation";

export default function ChapterPage({
  params,
}: {
  params: { n: string };
}) {
  const chapter = Number(params.n);
  if (!Number.isNaN(chapter)) {
    redirect("/");
  }
  redirect("/");
}
