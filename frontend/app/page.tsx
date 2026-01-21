export default function HomePage() {
  return (
    <section>
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Week 1</p>
      <h1 className="text-4xl font-bold">Portfolio Foundation</h1>
      <p className="text-lg text-slate-300">
        This is the live shell for your portfolio. The layout is ready for new projects,
        case studies, and contact information.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-xl font-semibold">Current Focus</h2>
          <p className="text-slate-300">
            Building the initial frontend and deploying the FastAPI backend on Azure.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-xl font-semibold">Next Steps</h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-300">
            <li>Finalize project case studies.</li>
            <li>Add contact and scheduling.</li>
            <li>Connect to live backend metrics.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
