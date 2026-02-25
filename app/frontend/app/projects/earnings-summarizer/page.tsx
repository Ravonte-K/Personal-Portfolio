"use client";

import { useState } from "react";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://ml-project-api.fly.dev").replace(/\/$/, "");
// use this if devoloping local
// const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const ANALYZE_FILE_URL = `${API_BASE_URL}/initanalyze/file`;
const ANALYZE_TEXT_URL = `${API_BASE_URL}/initanalyze/text`;
const EXAMPLE_TRANSCRIPT = `VP of Investor Relations
Thank you. Good afternoon, everyone, and welcome to NVIDIA's Conference Call for the Third Quarter of Fiscal 2026. With me today from NVIDIA are Jensen Huang, President and Chief Executive Officer, and Colette Kress, Executive Vice President and Chief Financial Officer. I'd like to remind you that our call is being Webcast Live on NVIDIA's Investor Relations website. The webcast will be available for replay until the conference call to discuss our financial results for the 4th quarter of fiscal 2026. The content of today's call is NVIDIA's property. It can't be reproduced or transcribed without our prior written consent. During this call, we may make forward-looking statements based on current expectations. These are subject to a number of significant risks and uncertainties, and our actual results may differ materially.
EVP and CFO
Thank you, Toshiya. We delivered another outstanding quarter with revenue of $57 billion, up 62% year-over-year, and a record sequential revenue growth of $10 billion, or 22%. Our customers continue to lean into three platform shifts, fueling exponential growth for Accelerated Computing, powerful AI models, and Agentic applications. Yet, we are still in the early innings of these transitions that will impact our work across every industry. We currently have visibility to $500 billion in Blackwell and Rubin revenue from the start of this year through the end of Calendar Year 2026. By executing our annual product cadence and extending our Performance leadership through Full-stack Design, we believe NVIDIA will be the superior choice for the $3 trillion-$4 trillion in annual AI infrastructure build we estimate by the end of the decade. Demand for AI infrastructure continues to exceed our expectations.
Colette Kress
EVP and CFO
The clouds are sold out, and our GPU-installed base, both new and previous generations, including Blackwell, Hopper, and Ampere, is fully utilized. Record Q3 Data Center revenue of $51 billion increased 66% year-over-year, a significant feat at our scale. Compute grew 56% year-over-year, driven primarily by the GB300 ramp, while networking more than doubled given the onset of NVLink scale-up and robust Double-digit growth across Spectrum-X Ethernet and Quantum-X InfiniBand. The World Hyperscalers, a trillion-dollar industry, are transforming search, recommendations, and content understanding from Classical Machine Learning to Generative AI. NVIDIA CUDA excels at both and is the ideal platform for this transition, driving infrastructure investment measured in hundreds of billions of dollars. At Meta, AI recommendation systems are delivering higher quality and more relevant content, leading to more time spent on apps such as Facebook and Threads.`;

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExampleOpen, setIsExampleOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

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

  const handleCopyExampleTranscript = async () => {
    try {
      await navigator.clipboard.writeText(EXAMPLE_TRANSCRIPT);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }
  };

  const openExampleTranscript = () => {
    setCopyStatus("idle");
    setIsExampleOpen(true);
  };

  const closeExampleTranscript = () => {
    setCopyStatus("idle");
    setIsExampleOpen(false);
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
              onClick={openExampleTranscript}
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
          onClick={closeExampleTranscript}
        >
          <div
            className="w-full max-w-3xl rounded-lg bg-white p-5 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="example-transcript-title" className="text-lg font-semibold text-slate-900">
                Example Earnings Call Transcript
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
                  onClick={handleCopyExampleTranscript}
                >
                  Copy all text
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
                  onClick={closeExampleTranscript}
                >
                  Close
                </button>
              </div>
            </div>
            {copyStatus === "success" && <p className="mb-3 text-sm text-emerald-700">Transcript copied.</p>}
            {copyStatus === "error" && <p className="mb-3 text-sm text-red-600">Could not copy transcript.</p>}
            <pre className="max-h-[60vh] overflow-y-auto rounded-md bg-slate-50 p-4 text-sm text-slate-800">
              {EXAMPLE_TRANSCRIPT}
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}
