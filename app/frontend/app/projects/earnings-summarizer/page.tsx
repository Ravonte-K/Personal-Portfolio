"use client";

import { useState } from "react";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://ml-project-api.fly.dev").replace(/\/$/, "");
// use this if devoloping local
// const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const ANALYZE_FILE_URL = `${API_BASE_URL}/initanalyze/file`;
const ANALYZE_TEXT_URL = `${API_BASE_URL}/initanalyze/text`;
const EXAMPLE_TRANSCRIPT = `Operator: Good afternoon, and welcome to Toyota Corp's Q2 2025 earnings call.

CEO: Thank you for joining us. We delivered revenue of $4.2 billion, up 12% year over year, with strength in cloud and enterprise software.

CFO: Gross margin was 58.4%, up 90 basis points. Operating income was $810 million, and diluted EPS came in at $1.18.

Analyst: Can you comment on demand trends heading into Q3?

CEO: We continue to see resilient demand in large enterprise accounts. Our pipeline remains healthy, and renewal rates were above expectations.

Analyst: What are you assuming for guidance?

CFO: For Q3, we expect revenue between $4.25 and $4.35 billion and operating margin in the 18.5% to 19.0% range.

CEO: In closing, we are focused on disciplined execution and long-term value creation.`;

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExampleOpen, setIsExampleOpen] = useState(false);

  const isSupportedTextFile = (file: File) => {
    return file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".txt");
  };

  const handleFileSelect = (file: File) => {
    if (!isSupportedTextFile(file)) {
      setError("Please choose a .txt or other text file.");
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleSubmit = async () => {
    const trimmedText = text.trim();

    if (!selectedFile && !trimmedText) {
      setError("Please drop a file or paste transcript text first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      let res: Response;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        res = await fetch(ANALYZE_FILE_URL, {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch(ANALYZE_TEXT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: trimmedText }),
        });
      }

      if (!res.ok) {
        throw new Error(`Backend returned ${res.status}`);
      }

      const data = await res.json();
      if (typeof data === "string") {
        setResult(data.replace(/\\n/g, "\n"));
      } else {
        setResult(JSON.stringify(data, null, 2));
      }
    } catch {
      setError("Failed to analyze input. Check backend endpoint and payload handling.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <header className="w-full border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-6">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Earnings Call Summarizer</h1>
          <p className="mt-1 text-sm text-slate-600">
            Drop a transcript file or paste transcript text, then submit for analysis. Or use{" "}
            <button
              type="button"
              className="font-medium text-sky-700 underline decoration-sky-500 underline-offset-2 transition hover:text-sky-900"
              onClick={() => setIsExampleOpen(true)}
            >
              this example text
            </button>
          </p>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8">
        <div
          className={`w-full rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            dragActive ? "border-black bg-gray-50" : "border-gray-300"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileSelect(file);
          }}
        >
          <p className="mb-2">Drop an earnings call transcript text file</p>
          <label className="cursor-pointer underline">
            or click to choose a file
            <input
              className="hidden"
              type="file"
              accept=".txt,text/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </label>
          {selectedFile && <p className="mt-2 text-sm">Selected file: {selectedFile.name}</p>}
        </div>

        <textarea
          className="min-h-56 w-full rounded-lg border border-slate-300 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Or paste earnings call transcript text here"
        />

        <button
          className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Working..." : "Submit"}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {result && (
          <pre className="mt-2 rounded-lg bg-slate-100 p-4 text-sm" style={{ whiteSpace: "pre-wrap" }}>
            {result}
          </pre>
        )}
      </section>

      {isExampleOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="example-transcript-title"
          onClick={() => setIsExampleOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-lg bg-white p-5 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="example-transcript-title" className="text-lg font-semibold text-slate-900">
                Example Earnings Call Transcript
              </h2>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
                onClick={() => setIsExampleOpen(false)}
              >
                Close
              </button>
            </div>
            <pre className="max-h-[60vh] overflow-y-auto rounded-md bg-slate-50 p-4 text-sm text-slate-800">
              {EXAMPLE_TRANSCRIPT}
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}
