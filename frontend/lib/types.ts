export type UploadResponse = {
  success: boolean;
  message: string;
  s3Key?: string;
  bucket?: string;
};