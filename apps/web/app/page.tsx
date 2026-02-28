import Link from "next/link";
import { tools } from "@/lib/tools-registry";
import { CATEGORY_LABELS } from "@toolhaus/tool-sdk";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";

export default function HomePage() {
  const featured = tools.slice(0, 8);

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Wrench className="h-5 w-5" />
            Toolhaus
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/tools">All Tools</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/pricing">Go Pro</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-16">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            The dev tools hub that actually gets the AI era
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            25+ privacy-first developer tools. JSON formatter, Base64, UUID
            generator, LLM token counter, and more. All processing happens in
            your browser.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/tools">Browse Tools</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-center text-2xl font-semibold">
            Featured Tools
          </h2>
          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <h3 className="font-medium">{tool.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {tool.description}
                </p>
                <span className="mt-2 inline-block text-xs text-muted-foreground">
                  {CATEGORY_LABELS[tool.category] ?? tool.category}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/tools">View all {tools.length} tools</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto mt-24 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold">Privacy-first by design</h2>
          <p className="mt-4 text-muted-foreground">
            No tool logic runs on our servers. Your data never leaves your
            browser. Share results via URL—no sign-in required for free tools.
          </p>
        </section>
      </main>

      <footer className="mt-24 border-t py-8">
        <div className="container flex flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-6">
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Pricing
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Toolhaus
          </p>
        </div>
      </footer>
    </div>
  );
}
