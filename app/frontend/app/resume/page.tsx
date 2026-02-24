const experience = [
  {
    role: "AI Engineer Mentorship",
    company: "Blue Yonder",
    summary: `Learning first hand from a generative AI software engineer at blue yonder. 
    Blue yonder is a supply chain company that serves a wide variety of clients. Specifically I follow the generative AI development team following and learning from engineers.
    Built scalable APIs and deployment pipelines for cloud-native services.`
  },
  {
    role: "LLM course",
    company: "Coursera",
    summary: "Designed interactive web experiences with React and Tailwind CSS."
  },
  {
    role: "Independent Learning and Research",
    company: "",
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
