import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasMicrosoftToken } from "@/lib/cloud-storage";
import ConnectOneDrive from "@/components/cloud-files/connect-onedrive";
import OneDriveBrowser from "@/components/cloud-files/onedriver-browser";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function FilesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const isConnected = await hasMicrosoftToken(userId);

  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-[600px] rounded-lg" />
        </div>
      }
    >
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">OneDrive Files</h1>
          {!isConnected && <ConnectOneDrive />}
        </div>

        {isConnected ? (
          <OneDriveBrowser />
        ) : (
          <div className="bg-gray-50 rounded-xl border-2 border-dashed p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connect to OneDrive
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Connect your Microsoft account to browse and manage your OneDrive
              files directly in this application.
            </p>
            <ConnectOneDrive />
          </div>
        )}
      </div>
    </Suspense>
  );
}
