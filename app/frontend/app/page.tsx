import Link from "next/link";

export default function HomePage() {
  return (
    <section>
      <div className="hero-shell">
        <p className="hero-kicker">
          Portfolio
        </p>
        <h1 className="hero-heading">
          Exploring computer science through data-driven projects
        </h1>
        <p className="hero-subcopy">
          Focused on building strong fundamentals through hands-on work.
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
            Studying data science and machine learning foundations and shipping small projects to improve engineering and data
            skills.
          </p>
        </div>
        <div className="panel">
          <h3 className="text-2xl font-semibold">What You Can Explore</h3>
          <ul className="section-copy list-disc space-y-2 pl-5">
            <li>Projects and experiments.</li>
            <li>Experience and coursework.</li>
            <li>My evolving focus areas.</li>
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
