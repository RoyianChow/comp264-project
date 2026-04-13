"use client";

import { useState } from "react";
import { DashboardShell } from "@/app/components/dashboard-shell";
import { FileUploadCard } from "@/app/components/file-upload-card";

export default function HomePage() {
  const [resultId, setResultId] = useState<string | null>(null);

  return (
    <DashboardShell>
      <div className="grid gap-6 lg:grid-cols-[420px,1fr]">
        <FileUploadCard onUploaded={setResultId} />

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Backend Response</h2>
          <p className="mt-2 text-sm text-slate-500">
            After upload, the generated result ID from Chalice will appear here.
          </p>

          {resultId ? (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <p>
                <span className="font-semibold">Result ID:</span> {resultId}
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Upload a CSV file to see the backend response.
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}