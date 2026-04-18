"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/app/_components/dashboard-shell";
import { FileUploadCard } from "@/app/_components/file-upload-card";
import { getS3Files, deleteS3File, type S3FileRow } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [files, setFiles] = useState<S3FileRow[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadFiles(showRefreshState = false) {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoadingFiles(true);
      }

      setLoadingError(null);
      const data = await getS3Files();
      setFiles(data);
    } catch (err) {
      console.error("Failed to fetch files:", err);
      setLoadingError(
        err instanceof Error ? err.message : "Failed to fetch files"
      );
    } finally {
      setLoadingFiles(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  async function handleRefresh() {
    await loadFiles(true);
  }

  async function handleDelete(key: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this file?"
    );
    if (!confirmDelete) return;

    try {
      setDeletingKey(key);
      await deleteS3File(key);
      setFiles((prev) => prev.filter((file) => file.key !== key));
    } catch (err) {
      console.error("Failed to delete file:", err);
      alert(err instanceof Error ? err.message : "Failed to delete file");
    } finally {
      setDeletingKey(null);
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <DashboardShell>
      <div className="grid gap-6 lg:grid-cols-[420px,1fr]">
        <FileUploadCard />
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-slate-900">
              S3 Uploaded Files
            </h2>
            <p className="text-sm text-slate-500">
              Click a row to open the file details page and view extracted text.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loadingFiles || refreshing}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loadingFiles ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            Loading files...
          </div>
        ) : loadingError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadingError}
          </div>
        ) : files.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            No files found in S3.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">File</th>
                    <th className="px-4 py-3 font-medium">Size</th>
                    <th className="px-4 py-3 font-medium">Last Modified</th>
                    <th className="px-4 py-3 font-medium text-right">Delete</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {files.map((file) => {
                    const isDeleting = deletingKey === file.key;

                    return (
                      <tr
                        key={file.key}
                        className={`transition ${
                          isDeleting
                            ? "bg-slate-50 opacity-60"
                            : "cursor-pointer hover:bg-slate-50"
                        }`}
                        onClick={() => {
                          if (!isDeleting) {
                            router.push(`/table/${encodeURIComponent(file.key)}`);
                          }
                        }}
                      >
                        <td className="max-w-[360px] px-4 py-4">
                          <div className="truncate font-medium text-slate-900">
                            {file.key}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                          {formatFileSize(file.size)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                          {file.lastModified
                            ? new Date(file.lastModified).toLocaleString()
                            : "—"}
                        </td>

                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            disabled={isDeleting}
                            className="inline-flex min-w-[88px] items-center justify-center rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(file.key);
                            }}
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}