import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CloudFiles } from "@/components/cloud-files/cloud-files";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function CloudPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-4">
          <div className="h-10 w-64 rounded-md bg-muted mb-6"></div>
          <Skeleton className="h-[600px] rounded-md" />
        </div>
      }
    >
      <CloudFiles />
    </Suspense>
  );
}
