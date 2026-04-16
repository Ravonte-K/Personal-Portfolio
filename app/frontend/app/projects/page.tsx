"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Project = {
  title: string;
  description: string;
  href?: string;
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
    description: "A web app that summarizes earnings calls and extracts key risks for retail investors.",
    href: "/projects/earnings-summarizer",
    techStack: ["Python", "FastAPI", "OpenAI API", "PostgreSQL"],
    createdAt: "2025-12",
    details: "Parses transcripts, extracts themes, and ranks key commentary for faster investor research."
  },
  {
    title: "Price Prediction Machine-Learning Model",
    description: "Trains a model to predict next day returns using historical price and volume feature with walk-foward validation.",
    href: "/projects/price-prediction",
    techStack: ["Python", "Pandas", "Yfinance", "MLflow"],
    details: `A supervised ML pipeline for next day return forcasting using historcal data.
              Includes feature engineering like returns, volatility, momentum, rolling stats, walk foward validation and evaluation with ML metrics.`
  },
  {
    title: "Strategy Backtester",
    description: "A modular backtesting engine that can test basic strategies.",
    details: `A lightweight backtesting framework for evaluating simple trading strategies on historical market data.
     Supports momentum, moving average crossover, RSI, and model-driven signals with basic transaction cost modeling. Computes core performance metrics including total return, win rate, Sharpe ratio, and max drawdown.
     Designed to validate ideas quickly and understand how strategy logic translates into real portfolio outcomes.`,
    techStack: ["Python", "Pandas", "Numpy", "Schwab API (for market data)", "Matplotlib","Streamlit"],
    createdAt: "..."
  },
  {
    title: "Jump Shot Analyzer",
    description: "A computer vision jumpshot analyzer that returns metrics based off a short side view video.",
    details: `A computer vision tool that analyzes jump shot form from video using pose estimation. 
    Extracts joint angles and timing (dip, set point, release) and generates a consistency report with visual plots and practical coaching cues. 
    Built as an end-to-end system: video upload → pose tracking → metrics → results dashboard.`,
    techStack: ["OpenCV", "Python", "FastAPI", "Matplotlib"],
    createdAt: "..."
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
