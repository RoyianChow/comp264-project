import { UploadResponse } from "./types";

const API_BASE = "http://127.0.0.1:8000";

export type S3FileRow = {
  key: string;
  size: number;
  lastModified: string | null;
  downloadUrl: string;
};

// Upload image file
export async function uploadFile(file: File): Promise<UploadResponse> {
  try {
    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to upload image");
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

export async function getS3Files(): Promise<S3FileRow[]> {
  const res = await fetch(`${API_BASE}/files`, {
    method: "GET",
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch files");
  }

  return data.files;
}

// Optional: call Textract after upload
export async function extractOrderText(s3Key: string) {
  const res = await fetch(`${API_BASE}/extract-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ s3Key }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to extract order text");
  }

  return data;
}
export async function getFileDetails(key: string) {
  const res = await fetch(
    `${API_BASE}/file-details?key=${encodeURIComponent(key)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch file details");
  }

  return data;
}