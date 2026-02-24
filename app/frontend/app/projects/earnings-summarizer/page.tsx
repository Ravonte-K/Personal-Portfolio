"use client";

import { useState } from "react";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://ml-project-api.fly.dev").replace(/\/$/, "");
const ANALYZE_FILE_URL = `${API_BASE_URL}/initanalyze/file`;
const ANALYZE_TEXT_URL = `${API_BASE_URL}/initanalyze/text`;

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            Drop a transcript file or paste transcript text, then submit for analysis.
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
    </main>
  );
}
