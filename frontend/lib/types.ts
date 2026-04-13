export type AnalysisResult = {
  id: string;
  fileName: string;
  fileType: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  extractedText?: string;
  entities?: string[];
  keyPhrases?: string[];
  uploadedAt?: string;
};

export type UploadResponse = {
  success: boolean;
  message: string;
  resultId?: string;
};