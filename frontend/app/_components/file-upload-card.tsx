"use client";
import { useRef, useState } from "react";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { uploadFile } from "@/lib/api";

 
//Allow only image formats
const allowedExtensions = [".jpg", ".jpeg", ".png"];
const allowedMimeTypes = ["image/jpeg", "image/png"];

export function FileUploadCard() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  //Validate image file
  const isImageFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some((ext) =>
      fileName.endsWith(ext)
    );

    return hasValidExtension || allowedMimeTypes.includes(file.type);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setError(null);
    setMessage(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!isImageFile(file)) {
      setError("Only JPG and PNG images are supported.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const result = await uploadFile(selectedFile);

      if (!result.success || !result.s3Key) {
        throw new Error(result.message || "Upload failed.");
      }

      setMessage("Image uploaded successfully.");

      

    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-3">
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Upload an image</h2>
          <p className="text-sm text-slate-500">
            Supported types: JPG, PNG
          </p>
        </div>
      </div>

      <div
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="mb-3 text-slate-500">
          <ImageIcon className="h-5 w-5" />
        </div>

        <p className="text-sm font-medium text-slate-700">
          Click here to choose an image
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Upload a handwritten order for text extraction
        </p>
      </div>

      {selectedFile && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <p>
            <span className="font-semibold">Selected:</span> {selectedFile.name}
          </p>
          <p>
            <span className="font-semibold">Size:</span>{" "}
            {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
          <p>
            <span className="font-semibold">Type:</span> {selectedFile.type}
          </p>
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          "Upload image"
        )}
      </button>
    </section>
  );
}