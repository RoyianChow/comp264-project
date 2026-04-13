import { UploadResponse } from "./types";

const API_BASE = "http://127.0.0.1:8000";

export async function uploadFile(file: File): Promise<UploadResponse> {
  try {
    const text = await file.text();

    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "text/csv",
      },
      body: text,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to upload CSV");
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Upload failed unexpectedly",
    };
  }
}
/*
type UploadResponse = {
  success: boolean;
  message: string;
  resultId?: string;
};
*/