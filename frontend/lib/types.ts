import { ReactNode } from "react";

export type UploadResponse = {
  success: boolean;
  message: string;
  s3Key?: string;
  bucket?: string;
};

export type S3FileRow = {
  key: string;
  size: number;
  lastModified: string | null;
  downloadUrl: string;
};

export type FileDetails = {
  success: boolean;
  key: string;
  imageUrl: string;
  extractedText: string;
  pollyAudioUrl?: string | null;
};

export type PollyResponse = {
  success: boolean;
  audioUrl: string;
  audioKey?: string;
  message?: string;
};
export type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export type DashboardShellProps = {
  children: ReactNode;
};