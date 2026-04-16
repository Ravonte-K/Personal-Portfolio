"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://ml-project-api.fly.dev").replace(/\/$/, "");

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");


const DEFAULT_URL = `${API_BASE_URL}/predict/default`;
const PREDICT_URL = `${API_BASE_URL}/predict/file`;

type PricePoint = { date: string; close: number };

type PredictionResult = {
  historical: PricePoint[];
  predictions: PricePoint[];
};

type ChartPoint = {
  date: string;
  actual: number | null;
  predicted: number | null;
};

function buildChartData(result: PredictionResult): ChartPoint[] {
  const historical: ChartPoint[] = result.historical.map((p) => ({
    date: p.date,
    actual: p.close,
    predicted: null,
  }));

  if (historical.length > 0) {
    historical[historical.length - 1].predicted =
      historical[historical.length - 1].actual;
  }

  const predictions: ChartPoint[] = result.predictions.map((p) => ({
    date: p.date,
    actual: null,
    predicted: p.close,
  }));

  return [...historical, ...predictions];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

export default function PricePredictionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-load SPY default on mount
  useEffect(() => {
    fetch(DEFAULT_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json() as Promise<PredictionResult>;
      })
      .then((data) => setResult(data))
      .catch(() => setError("Failed to load default SPY data. Is the backend running?"))
      .finally(() => setIsLoading(false));
  }, []);

  const isCsvFile = (file: File) =>
    file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");

  const handleFileSelect = (file: File) => {
    if (!isCsvFile(file)) {
      setError("Please choose a .csv file.");
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please drop a CSV file first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(PREDICT_URL, { method: "POST", body: formData });

      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail ?? `Server returned ${res.status}`);
      }

      const data: PredictionResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get prediction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const chartData = result ? buildChartData(result) : [];
  const tickInterval = Math.max(1, Math.floor(chartData.length / 8));

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <header className="w-full border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-6">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Price Prediction Model</h1>
          <p className="mt-1 text-sm text-slate-600">
            SPY 10-day price forecast. Optionally upload your own OHLCV CSV to run a custom prediction.
          </p>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8">

        {/* Chart */}
        {isLoading && (
          <div className="flex h-64 items-center justify-center rounded-lg border border-slate-200 bg-white">
            <p className="text-sm text-slate-500">Loading SPY data...</p>
          </div>
        )}
        {!isLoading && result && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-4 text-sm font-medium text-slate-700">
              Historical price vs. 10-day model forecast
            </p>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  interval={tickInterval}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <YAxis
                  tickFormatter={(v) => `$${v}`}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  domain={["auto", "auto"]}
                  width={60}
                />
                <Tooltip
                  formatter={(value, name) => [
                    typeof value === "number" ? `$${value.toFixed(2)}` : value,
                    name === "actual" ? "Actual" : "Predicted",
                  ]}
                  labelFormatter={(label) => formatDate(label as string)}
                  contentStyle={{ fontSize: 12 }}
                />
                <Legend
                  formatter={(value) => (value === "actual" ? "Actual" : "Predicted")}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#334155"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#f97316"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 3, fill: "#f97316" }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Optional custom CSV upload */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">Run on your own data</p>
          <div
            className={`w-full rounded-lg border-2 border-dashed p-5 text-center transition-colors ${
              dragActive ? "border-black bg-gray-50" : "border-gray-300"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileSelect(file);
            }}
          >
            <p className="mb-2 text-sm">Drop a CSV file with OHLCV columns</p>
            <label className="cursor-pointer text-sm underline">
              or click to choose a file
              <input
                className="hidden"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </label>
            {selectedFile && (
              <p className="mt-2 text-sm text-slate-600">Selected: {selectedFile.name}</p>
            )}
          </div>
          <button
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedFile}
          >
            {isSubmitting ? "Predicting..." : "Predict"}
          </button>
        </div>

      </section>
    </main>
  );
}
