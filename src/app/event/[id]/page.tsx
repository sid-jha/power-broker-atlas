import { redirect } from "next/navigation";

export default function EventPage({
  params,
}: {
  params: { id: string };
}) {
  if (params.id) {
    redirect("/");
  }
  redirect("/");
}
