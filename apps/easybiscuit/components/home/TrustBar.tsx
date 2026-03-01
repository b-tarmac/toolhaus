export function TrustBar() {
  const items = [
    { icon: "🔒", text: "Files processed locally" },
    { icon: "🚫", text: "No ads, ever" },
    { icon: "⚡", text: "No account required" },
    { icon: "🍪", text: "Free to start" },
  ];

  return (
    <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-3 sm:gap-x-8">
      {items.map(({ icon, text }) => (
        <span
          key={text}
          className="inline-flex items-center gap-2 text-sm text-slate-500"
        >
          <span aria-hidden>{icon}</span>
          <span>{text}</span>
        </span>
      ))}
    </div>
  );
}
