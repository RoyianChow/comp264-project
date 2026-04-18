"use client";

import { DashboardShellProps } from "@/lib/types";

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            COMP264 Cloud ML Project
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Smart Retail AI Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Upload retail documents or images, trigger AWS processing, and review extracted text,
            entities, and key phrases in one place.
          </p>
        </header>

        <div className="flex-1">{children}</div>
      </div>
    </main>
  );
}