interface PersonaCardProps {
  icon: string;
  title: string;
  description: string;
}

export function PersonaCard({ icon, title, description }: PersonaCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-amber-100 bg-white p-6">
      <span className="text-4xl" aria-hidden>
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
    </div>
  );
}
