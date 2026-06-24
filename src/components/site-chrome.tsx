import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy text-navy-foreground">
            <span className="font-display text-base font-semibold">a</span>
          </div>
          <span className="font-display text-lg font-medium tracking-tight">
            abaad<span className="text-green">.</span>com
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm md:flex">
          <Link to="/" className="text-foreground hover:text-navy">Buy</Link>
          <Link to="/" className="text-muted-foreground hover:text-navy">Rent</Link>
          <Link to="/list" className="text-muted-foreground hover:text-navy">Realtors</Link>
          <Link to="/list" className="text-muted-foreground hover:text-navy">Packages</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden text-sm md:inline-flex">Sign in</Button>
          <Link to="/list">
            <Button className="bg-navy text-navy-foreground hover:bg-navy/90">List property</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:px-6 sm:py-10 md:flex-row md:items-center">
        <p className="font-display text-base tracking-tight">
          abaad<span className="text-green">.</span>com
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} abaad.com — A marketplace for verified realtors in Karachi.
        </p>
      </div>
    </footer>
  );
}
