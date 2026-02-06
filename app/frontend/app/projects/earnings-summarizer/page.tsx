"use client";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const readTextFile = (file: File) => {
    if (!file.type.startsWith("text/")) {
      alert("Please drop a .txt or other text file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === "string" ? reader.result : "";
      setText(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    const res = await fetch("http://127.0.0.1:8000/initanalyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    if (typeof data === "string") {
      setResult(data.replace(/\\n/g, "\n"));
      return;
    }
    setResult(data);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <header className="w-full border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Earnings Call Summarizer
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Paste or drop a transcript to generate a summary.
          </p>
        </div>
      </header>
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">

      <div
        className={`w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
          if (file) readTextFile(file);
        }}
      >
        <p className="mb-2">Drop a earnings call transcript text file</p>
        <label className="cursor-pointer underline">
          or click to choose a file
          <input
            className="hidden"
            type="file"
            accept=".txt,text/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) readTextFile(file);
            }}
          />
        </label>
        {fileName && <p className="mt-2 text-sm">{fileName}</p>}
      </div>

      <textarea
        className="w-full min-h-56 rounded-lg border border-slate-300 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add earnings call transcript text file"
      />
      <button
        className="inline-flex w-fit items-center rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        onClick={handleSubmit}
      >
        Submit
      </button>
      
      {result && (
        <pre className="mt-2 rounded-lg bg-slate-100 p-4 text-sm" style={{ whiteSpace: "pre-wrap" }}>
          {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
        </pre>
  
      )}
      </section>
    </main>
  );
}
