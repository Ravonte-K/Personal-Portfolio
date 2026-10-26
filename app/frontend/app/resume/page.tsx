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
          href="https://drive.google.com/file/d/1m9pxsK66yFal6av-JG80ArYRDxvE_OF_/view?usp=sharing"
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
    summary: `Mentee on Blue Yonder's generative AI development team (supply-chain software), working under the guidance of a generative AI software engineer.

Responsibilities and experiences included:
- Meeting deadlines and maintaining open communication while working through projects and bugs.
- Followed engineers through real-world generative AI workflows
- Developed smaller projects using RAG, prompt engineering, and API integration
- Gained hands-on experience with Azure infrastructure
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
