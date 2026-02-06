const projects = [
  {
    title: "Azure Deployment Plan",
    description: "Infrastructure outline for FastAPI + PostgreSQL + Static Web Apps."
  },
  {
    title: "Portfolio UI Shell",
    description: "Reusable layout and navigation for future case studies."
  },
  {
    title: "Health Monitoring",
    description: "Backend health checks and database connectivity validation."
  }
];

export default function ProjectsPage() {
  return (
    <section>
      <h1 className="text-3xl font-bold">Projects</h1>
      <p className="text-slate-300">
        A curated snapshot of active and upcoming work for the portfolio.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project.title}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
          >
            <h2 className="text-xl font-semibold">{project.title}</h2>
            <p className="text-slate-300">{project.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
