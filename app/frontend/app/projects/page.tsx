"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Project = {
  title: string;
  description: string;
  href?: string;
  repoUrl?: string;
  techStack?: string[];
  createdAt?: string;
  details?: string;
};

const defaultProjectProperties = {
  techStack: ["TypeScript", "React", "Next.js"],
  createdAt: "2026-01",
  details: "This build explores practical patterns for shipping a clean UI with maintainable code."
};

const projects: Project[] = [
  {
    title: "Earnings Call Summarizer",
    description: "A web app that summarizes earnings calls and extracts key risks for retail investors. While pulling the sentiment from the transcribed earnings call and comparing that with current market data.",
    href: "/projects/earnings-summarizer",
    techStack: ["Python", "FastAPI", "OpenAI API"],
    createdAt: "2025-12",
    details: "Paste or upload an earnings-call transcript. An OpenAI model extracts the company’s ticker as structured JSON, the backend pulls growth estimates, insider purchases, and analyst price targets via yfinance, and the model summarizes the call and flags where management’s commentary agrees or conflicts with that data."
  },
  {
    title: "Price Prediction Machine-Learning Model",
    description: "A supervised ML pipeline that predicts SPY’s direction and 10-trading-day return, uses logistic regression for direction, random forest for return, using 5-day return.",
    href: "/projects/price-prediction",
    techStack: ["Python", "Pandas", "Scikit-learn"],
    repoUrl: 'https://github.com/Ravonte-K/Personal-Portfolio/blob/main/app/backend/ml.py',
    details: `A supervised ML pipeline for 10 trading day forcasting using historcal data.
              Includes feature engineering like returns, volatility, momentum, rolling stats, walk foward validation and evaluation with ML metrics. The model also outpreforms baseline models like simple MA and always up.
              logistic regression for direction, random forest for return, using 5-day return, 20/60-day momentum, and distance from the 50-day moving average. Evaluated on a chronological 80/20 split against naive baselines, after fixing look-ahead leakage from an earlier random split.`
  },
  {
    title: "Strategy Backtester",
    description: " A modular backtesting engine that can test basic strategies.",
    details: `*PLANNED* A lightweight backtesting framework for evaluating simple trading strategies on historical market data.
     Supports momentum, moving average crossover, RSI, and model-driven signals with basic transaction cost modeling. Computes core performance metrics including total return, win rate, Sharpe ratio, and max drawdown.
     Designed to validate ideas quickly and understand how strategy logic translates into real portfolio outcomes.`,
    techStack: ["Python", "Pandas", "Numpy", "Schwab API (for market data)", "Matplotlib","Streamlit"],
    createdAt: "..."
  },
  {
    title: "Jump Shot Analyzer",
    description: "Real-time shot detection from a webcam using pose estimation.",
    details: `Tracks the shooting arm with MediaPipe Pose, computes elbow and wrist angles and their angular velocity frame by frame, and detects shot attempts with a small state machine. Logs each shot's peak velocities and joint paths and plots them after the session. A proof of concept; known issues and next steps are in the repo.`,
    repoUrl: "https://github.com/Ravonte-K/jumpshotTracker",
    techStack: ["Python", "OpenCV", "MediaPipe", "NumPy", "Matplotlib"],
    createdAt: "2026-05"
  }
];

function TechStackViz({ techStack }: { techStack: string[] }) {
  const wheelPalette = ["#7ca6bf", "#9bbf9b", "#f2b880", "#9f9ad8", "#88c6c6", "#dda3a9"];
  const segmentSize = 100 / techStack.length;

  return (
    <div className="stack-viz">
      <div className="stack-meter" aria-hidden="true">
        {techStack.map((tech, index) => (
          <span
            key={`${tech}-${index}`}
            className="stack-meter-segment"
            style={{
              width: `${segmentSize}%`,
              backgroundColor: wheelPalette[index % wheelPalette.length]
            }}
          />
        ))}
      </div>
      <p className="stack-list">
        <span className="stack-label">Tech stack:</span> {techStack.join(" • ")}
      </p>
    </div>
  );
}

export default function ProjectsPage() {
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeProjectIndex === null) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveProjectIndex(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [activeProjectIndex]);

  const activeProject = activeProjectIndex !== null ? projects[activeProjectIndex] : null;
  const activeProjectDetails = activeProject?.details ?? defaultProjectProperties.details;
  const activeProjectDate = activeProject?.createdAt ?? defaultProjectProperties.createdAt;
  const activeProjectStack = activeProject?.techStack ?? defaultProjectProperties.techStack;

  return (
    <section>
      <div>
        <p className="kicker">Projects</p>
        <h1 className="section-title">Selected builds and technical experiments</h1>
      </div>
      <p className="section-copy">
        A snapshot of active and upcoming work.
      </p>
      <div className="content-grid">
        {projects.map((project, index) => (
          <article key={`${project.title}-${index}`} className="panel">
            {(() => {
              const createdAt = project.createdAt ?? defaultProjectProperties.createdAt;

              return (
                <>
                  <p className="project-date">Built: {createdAt}</p>
                  <h2 className="text-2xl font-semibold">{project.title}</h2>
                  <p className="section-copy">{project.description}</p>
                  <div className="project-actions">
                    <button
                      type="button"
                      className="btn-secondary inline-flex w-full sm:w-auto"
                      onClick={() => setActiveProjectIndex(index)}
                    >
                      Project details
                    </button>
                    {project.href ? (
                      <Link
                        href={project.href}
                        className="btn-secondary inline-flex w-full sm:w-auto"
                      >
                        Live example
                      </Link>
                    ) : null}
                  </div>
                </>
              );
            })()}
          </article>
        ))}
      </div>
      {activeProject ? (
        <div
          className="project-modal-overlay"
          role="button"
          tabIndex={0}
          onClick={() => setActiveProjectIndex(null)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              setActiveProjectIndex(null);
            }
          }}
        >
          <div className="project-modal" onClick={(event) => event.stopPropagation()}>
            <p className="project-date">Built: {activeProjectDate}</p>
            <h3 className="project-modal-title">{activeProject.title}</h3>
            <p className="project-modal-copy">{activeProjectDetails}</p>
            {activeProject.repoUrl ? (
              <a
                href={activeProject.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-base font-bold underline underline-offset-2 opacity-70 hover:opacity-100"
              >
                Repository ↗
              </a>
            ) : null}
            <TechStackViz techStack={activeProjectStack} />
            <button
              type="button"
              className="btn-secondary mt-5 inline-flex w-full sm:w-auto"
              onClick={() => setActiveProjectIndex(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
