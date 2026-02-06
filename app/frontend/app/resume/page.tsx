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
      <h1 className="text-3xl font-bold">Resume</h1>
      <p className="text-slate-300">
        Highlighting the experience and skills that power the portfolio.
      </p>
      <div className="space-y-6">
        {experience.map((item) => (
          <div
            key={`${item.role}-${item.company}`}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
          >
            <h2 className="text-xl font-semibold">
              {item.role} · {item.company}
            </h2>
            <p className="text-slate-300">{item.summary}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
