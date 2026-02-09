import Link from "next/link";

const projects = [
  {
    title: "Earnings Call Summarizer",
    description: "Summarizes earnings calls and surfaces key business insights.",
    href: "/projects/earnings-summarizer"
  },
  {
    title: "Example Project",
    description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iusto, praesentium."
  },
  {
    title: "Example Project",
    description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iusto, praesentium."
  },
  {
    title: "Example Project",
    description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iusto, praesentium."
  }
];

export default function ProjectsPage() {
  return (
    <section>
      <div>
        <p className="kicker">Projects</p>
        <h1 className="section-title">Selected builds and technical experiments.</h1>
      </div>
      <p className="section-copy">
        A snapshot of active and upcoming work.
      </p>
      <div className="content-grid">
        {projects.map((project) => (
          <article key={project.title} className="panel">
            <h2 className="text-2xl font-semibold">{project.title}</h2>
            <p className="section-copy">{project.description}</p>
            {project.href ? (
              <Link
                href={project.href}
                className="btn-secondary mt-4 inline-flex"
              >
                Live example
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
