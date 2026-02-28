const TOOLHAUS_BASE = "https://toolhaus.dev";

interface OpenInBrowserProps {
  toolSlug: string;
  input?: string;
  children?: React.ReactNode;
}

export function OpenInBrowser({
  toolSlug,
  input = "",
  children = "Open in Browser",
}: OpenInBrowserProps) {
  const url = `${TOOLHAUS_BASE}/tools/${toolSlug}${input ? `?input=${encodeURIComponent(input)}` : ""}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="open-in-browser"
    >
      {children}
    </a>
  );
}
