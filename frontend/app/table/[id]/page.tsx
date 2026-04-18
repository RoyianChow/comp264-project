"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  Loader2,
  PauseCircle,
  Square,
  Volume2,
} from "lucide-react";
import {
  getFileDetails,
  generatePollyAudio,
} from "@/lib/api";
import { FileDetails, PageProps } from "@/lib/types";

export default function TableDetailsPage({ params }: PageProps) {
  const [fileId, setFileId] = useState("");
  const [file, setFile] = useState<FileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPreparingAudio, setIsPreparingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadFile() {
      try {
        setLoading(true);
        setError(null);

        const resolvedParams = await params;
        const decodedId = decodeURIComponent(resolvedParams.id);
        setFileId(decodedId);

        const data = await getFileDetails(decodedId);

        if (!mounted) return;
        setFile(data);

        if (data.pollyAudioUrl) {
          setAudioUrl(data.pollyAudioUrl);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError("Failed to load file details");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadFile();

    return () => {
      mounted = false;
      if (audio) {
        audio.pause();
      }
    };
  }, [params]);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  const textLength = useMemo(() => {
    return file?.extractedText?.trim().length ?? 0;
  }, [file]);

  async function handleReadAloud() {
    if (!file?.extractedText?.trim()) return;

    try {
      if (audio && isPlaying) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      let finalAudioUrl = audioUrl;

      if (!finalAudioUrl) {
        setIsPreparingAudio(true);

        const result = await generatePollyAudio({
          key: file.key,
          text: file.extractedText,
        });

        finalAudioUrl = result.audioUrl;
        setAudioUrl(finalAudioUrl);
      }

      if (!finalAudioUrl) {
        throw new Error("No audio URL returned");
      }

      if (!audio) {
        const newAudio = new Audio(finalAudioUrl);

        newAudio.onplay = () => setIsPlaying(true);
        newAudio.onpause = () => setIsPlaying(false);
        newAudio.onended = () => setIsPlaying(false);

        setAudio(newAudio);
        await newAudio.play();
      } else {
        audio.src = finalAudioUrl;
        await audio.play();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate or play audio");
    } finally {
      setIsPreparingAudio(false);
    }
  }

  function handleStopAudio() {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-10 w-44 rounded-xl bg-slate-200" />
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="h-[450px] rounded-3xl bg-white shadow-sm" />
            <div className="h-[450px] rounded-3xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">File not found</h1>
          <p className="mt-2 text-slate-600">
            {error || "We could not find that file."}
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              File Details
            </h1>
            <p className="mt-1 break-all text-sm text-slate-500">{fileId}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Extracted text
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {textLength} characters
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
              <ImageIcon className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">
                Uploaded Image
              </h2>
            </div>

            <div className="p-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img
                  src={file.imageUrl}
                  alt={file.key}
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
                <FileText className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Extracted Writing
                </h2>
              </div>

              <div className="p-6">
                <div className="max-h-[320px] overflow-y-auto rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                  {file.extractedText?.trim() ? (
                    <p className="whitespace-pre-wrap">{file.extractedText}</p>
                  ) : (
                    <p className="text-slate-500">No text detected</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
                <Volume2 className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Read Aloud
                </h2>
              </div>

              <div className="space-y-4 p-6">
                <p className="text-sm text-slate-600">
                  Use AWS Polly to convert the extracted writing into speech.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleReadAloud}
                    disabled={!file.extractedText?.trim() || isPreparingAudio}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPreparingAudio ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing audio...
                      </>
                    ) : isPlaying ? (
                      <>
                        <PauseCircle className="h-4 w-4" />
                        Pause audio
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4" />
                        Read text aloud
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleStopAudio}
                    disabled={!audio}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Square className="h-4 w-4" />
                    Stop
                  </button>
                </div>

                {audioUrl && (
                  <p className="break-all text-xs text-slate-500">
                    Audio ready: {audioUrl}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}