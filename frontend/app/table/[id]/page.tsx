import { getFileDetails } from "@/lib/api"; // 👈 import it

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TableDetailsPage({ params }: PageProps) {
  const { id } = await params;

  // 👇 THIS is where you use it
  const file = await getFileDetails(decodeURIComponent(id));

  if (!file) {
    return <div>File not found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">{file.key}</h1>

      {/* Image */}
      <img
        src={file.imageUrl}
        alt={file.key}
        className="mt-4 w-full max-w-xl rounded-lg border"
      />

      {/* Extracted text */}
      <div className="mt-6 rounded-lg bg-slate-100 p-4">
        <h2 className="font-semibold">Extracted Writing</h2>
        <p className="mt-2 whitespace-pre-wrap">
          {file.extractedText || "No text detected"}
        </p>
      </div>
    </div>
  );
}