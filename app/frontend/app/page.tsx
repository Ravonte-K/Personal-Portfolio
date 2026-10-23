import Link from "next/link";

export default function HomePage() {
  return (
    <section>
      <div className="hero-shell">
        <p className="hero-kicker">
          
        </p>
        <h1 className="hero-heading">
          Project Portfolio
        </h1>
        <p className="hero-subcopy">
          Computer science and math student working towards machine learning and systems. 
        </p>
      </div>

      <div className="panel">
        <p className="kicker">About Me</p>  
        <p className="section-copy mt-4" style={{ maxWidth: "none" }}>
        I'm a first-year computer science student at Villanova University with an intended double major in mathematics, most interested in machine learning, data-driven systems, and the software that runs them.
        From fall 2025 through spring 2026, I was a generative AI engineering mentee at Blue Yonder, where I built LLM applications with Azure and the OpenAI API.
        </p>
      </div>

      <div>
        <p className="kicker">Overview</p>
        <h2 className="section-title">Applied Learning Through Real Projects</h2>
      </div>

      <div className="content-grid">
        <div className="panel">
          <h3 className="text-2xl font-semibold">Current Work</h3>
          <p className="section-copy">
            I am strengthening my fundamentals in data structures and algorithms through project based work while balencing my universities courseload.
          </p>
        </div>
        <div className="panel">
          <h3 className="text-2xl font-semibold">Featured Projects</h3>
          <ul className="section-copy list-disc space-y-2 pl-5">
            <li>Earnings Call Summarizer: live demo</li>
            <li>Price Prediction Model: live demo</li>
            <li>Jump Shot Analyzer: computer vision, on GitHub</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/projects"
          className="btn-primary w-full sm:w-auto"
        >
          View Projects
        </Link>
        <Link
          href="/resume"
          className="btn-primary w-full sm:w-auto"
        >
          View Experience
        </Link>
      </div>
    </section>
  );
}
