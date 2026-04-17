"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/app/components/dashboard-shell";
import { FileUploadCard } from "@/app/components/file-upload-card";

type S3File = {
  key: string;
  size: number;
  lastModified: string | null;
  downloadUrl: string;
};

export default function HomePage() {
  const router = useRouter();
  const [files, setFiles] = useState<S3File[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      try {
        const res = await fetch("http://127.0.0.1:8000/files");
        const data = await res.json();

        if (data.success) {
          setFiles(data.files);
        }
      } catch (err) {
        console.error("Failed to fetch files:", err);
      } finally {
        setLoadingFiles(false);
      }
    }

    loadFiles();
  }, []);

  return (
    <DashboardShell>
      <div className="grid gap-6 lg:grid-cols-[420px,1fr]">
        <FileUploadCard />
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">S3 Uploaded Files</h2>
        <p className="mt-2 text-sm text-slate-500">
          Click a file to view image details and extracted text.
        </p>

        {loadingFiles ? (
          <div className="mt-4 text-sm text-slate-500">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">
            No files found in S3.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Last Modified</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr
                    key={file.key}
                    className="cursor-pointer border-t hover:bg-slate-50"
                    onClick={() =>
                      router.push(`/table/${encodeURIComponent(file.key)}`)
                    }
                  >
                    <td className="px-4 py-3">{file.key}</td>
                    <td className="px-4 py-3">{file.size} bytes</td>
                    <td className="px-4 py-3">
                      {file.lastModified
                        ? new Date(file.lastModified).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-blue-600 underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/table/${encodeURIComponent(file.key)}`);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}