const experience = [
  {
    role: "Backend Engineer",
    company: "Your Company",
    summary: "Built scalable APIs and deployment pipelines for cloud-native services."
  },
  {
    role: "Full-Stack Developer",
    company: "Your Studio",
    summary: "Designed interactive web experiences with React and Tailwind CSS."
  }
];

export default function ResumePage() {
  return (
    <section>
      <div>
        <p className="kicker">Experience</p>
        <h1 className="section-title">Roles, systems, and outcomes.</h1>
      </div>
      <p className="section-copy">
        Experience that combines product thinking, API architecture, and reliable cloud
        deployment for modern web apps.
      </p>
      <div className="space-y-6">
        {experience.map((item) => (
          <div key={`${item.role}-${item.company}`} className="panel">
            <h2 className="text-2xl font-semibold">
              {item.role} · {item.company}
            </h2>
            <p className="section-copy">{item.summary}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
