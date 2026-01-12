import { redirect } from "next/navigation";

export default function YearPage({
  params,
}: {
  params: { yyyy: string };
}) {
  const year = Number(params.yyyy);
  if (!Number.isNaN(year)) {
    redirect("/");
  }
  redirect("/");
}
