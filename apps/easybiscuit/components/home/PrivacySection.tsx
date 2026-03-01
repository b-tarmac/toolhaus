export function PrivacySection() {
  const columns = [
    {
      icon: "🖥️",
      heading: "Processed in your browser",
      body: "Every tool runs using WebAssembly technology directly in your browser. Your files are never sent to any server.",
    },
    {
      icon: "🚫",
      heading: "No tracking, no ads",
      body: "EasyBiscuit is subscription-funded. No ad networks, no tracking pixels, no third-party scripts watching what you do.",
    },
    {
      icon: "🔑",
      heading: "No account required",
      body: "Every tool works without signing up. Create a free account only when you want to save your work or get more daily uses.",
    },
  ];

  return (
    <section className="bg-amber-50 py-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3 text-center">
          {columns.map(({ icon, heading, body }) => (
            <div key={heading}>
              <span className="text-4xl" aria-hidden>
                {icon}
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{heading}</h3>
              <p className="mt-2 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
