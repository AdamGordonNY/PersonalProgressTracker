"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

export default function OneDriveBrowser() {
  const { userId } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("root");
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string; name: string }[]
  >([{ id: "root", name: "OneDrive" }]);

  const fetchData = useCallback(
    async (path: string = "root", name?: string) => {
      if (!userId) return;

      const res = await fetch(`/api/onedrive/${path}`);
      const data = await res.json();

      if (data.value) {
        setFiles(data.value);

        // Update breadcrumbs
        if (name && name !== breadcrumbs[breadcrumbs.length - 1]?.name) {
          setBreadcrumbs((prev) => [...prev, { id: path, name }]);
        }
      }
    },
    [userId, breadcrumbs]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData, userId]);

  const navigateTo = (item: any) => {
    if (item.folder) {
      fetchData(`items/${item.id}/children`, item.name);
    } else {
      // Handle file selection
      console.log("File selected:", item);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center mb-4 flex-wrap gap-2">
        {breadcrumbs.map((crumb, index) => (
          <button
            key={crumb.id}
            onClick={() => {
              const newCrumbs = breadcrumbs.slice(0, index + 1);
              setBreadcrumbs(newCrumbs);
              fetchData(crumb.id, crumb.name);
            }}
            className={`px-3 py-1 rounded flex items-center ${
              index === breadcrumbs.length - 1
                ? "bg-blue-100 text-blue-800 font-medium"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {crumb.name}
            {index < breadcrumbs.length - 1 && (
              <span className="mx-2 text-gray-400">/</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {files.map((item) => (
          <div
            key={item.id}
            onClick={() => navigateTo(item)}
            className="border p-3 rounded-lg hover:shadow-md transition-shadow cursor-pointer flex flex-col"
          >
            <div className="flex items-center mb-2">
              {item.folder ? (
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FolderIcon />
                </div>
              ) : (
                <div className="bg-gray-100 p-2 rounded-lg">
                  <FileIcon extension={item.name.split(".").pop()} />
                </div>
              )}
            </div>
            <div className="font-medium truncate text-sm">{item.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              {item.lastModifiedDateTime &&
                formatDate(item.lastModifiedDateTime)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FolderIcon() {
  return (
    <svg
      className="w-6 h-6 text-blue-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  );
}

function FileIcon({ extension }: { extension?: string }) {
  const color =
    extension === "docx"
      ? "text-blue-500"
      : extension === "xlsx"
        ? "text-green-500"
        : extension === "pptx"
          ? "text-orange-500"
          : "text-gray-500";

  return (
    <svg
      className={`w-6 h-6 ${color}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
