import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CloudFiles } from "@/components/cloud-files/cloud-files";

export default async function CloudPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <CloudFiles />;
}
