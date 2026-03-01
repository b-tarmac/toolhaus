import { PersonaCard } from "./PersonaCard";

const PERSONAS = [
  {
    icon: "🔨",
    title: "Tradespeople",
    description:
      "Generate invoices on site, scan supplier receipts, calculate job margins — without going back to the office.",
  },
  {
    icon: "💼",
    title: "Freelancers",
    description:
      "Professional invoices, signed contracts, and a polished email signature. Look like a proper business from day one.",
  },
  {
    icon: "🏪",
    title: "Local Business Owners",
    description:
      "QR codes for your counter, resize photos for social media, compress PDFs to email — all in one place.",
  },
  {
    icon: "📋",
    title: "Side Hustlers",
    description:
      "All the business tools you need, free to start, no subscription required until you're ready.",
  },
];

export function PersonaGrid() {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
      <div className="flex min-w-max gap-6 pb-4 lg:grid lg:min-w-0 lg:grid-cols-2 lg:gap-6 lg:pb-0">
        {PERSONAS.map((persona) => (
          <div key={persona.title} className="w-[320px] shrink-0 lg:w-auto">
            <PersonaCard
              icon={persona.icon}
              title={persona.title}
              description={persona.description}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
