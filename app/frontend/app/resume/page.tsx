const experience = [
  {
    role: "Education",

    summary: 
    `Villanova University — B.S. Computer Science, expected 2030 (intended math double major)
    Relevant coursework: Discrete Structures, Algorithms & Data Structures I, Calculus I

    Hopkins High School — AP Calculus BC, AP Computer Science A, AP Computer Science Principles, AP Statistics, AP Macroeconomics, AP Calculus AB`
  },
  {
    role: "Resume",
    summary: (
      <>
        PDF of resume{" "}
        <a
          href="https://drive.google.com/file/d/1szXp4RbZRObedDPV52D9rVIzqpqBPw6r/view?usp=sharing"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          here
        </a>
      </>
    )
  },
  {
    role: "Generative AI Engineering Mentee",
    company: "Blue Yonder",
    summary: `Learned first hand from a generative AI software engineer at Blue Yonder. Blue Yonder is a supply chain company that serves a wide variety of clients. Specifically, I worked with the generative AI development team, following and learning from engineers. I have built smaller projects utilizing the same skillset as their production.

Responsabilities and experiences included:
- Meeting deadlines and having open comunication working through projects and problems.
- Built LLM-powered features using the same stack as production
- Followed engineers through real-world generative AI workflows
- Developed smaller projects using RAG, prompt engineering, and API integration
- Gained hands-on experience with cloud-based AI infrastructure
- Gained experience working with various other interesting frameworks and libraries.
`
  },
  {
    role: "LLM course",
    company: "Coursera",
    summary: "Completed an LLM course recommended by my mentor.",
    certificateUrl: "https://coursera.org/share/c41cf4d59e225d9a5362c8e326183996"
  },
  {
    role: "Independent Learning and Research",
    company: "",
    summary: `Self-studying machine learning, finance, and software engineering through hands-on projects.
     Built Python pipelines for financial data analysis, trained ML models for price prediction, and developed full-stack apps using FastAPI, React, and Tailwind. Currently focused on strengthening and fully understanding fundamentals of both my fields of interest.`
  },

];

export default function ResumePage() {
  return (
    <section>
      <div>
        <p className="kicker">Experience</p>
        <h1 className="section-title">Roles, Coursework, and Independent Learning</h1>
      </div>
      <p className="section-copy">
        Experience focused on building fundamentals and building real projects.
      </p>
      <div className="space-y-6">
        {experience.map((item) => (
          <div key={`${item.role}-${item.company}`} className="panel">
            <h2 className="text-2xl font-semibold">
              {item.role}
              {item.company ? " · " + item.company : null}
            </h2>
            <p className="section-copy whitespace-pre-line">{item.summary}</p>
            {item.certificateUrl ? (
              <a
                href={item.certificateUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block underline"
              >
                View certificate
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
