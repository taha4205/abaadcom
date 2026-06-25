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
          <Link to="/" className="text-muted-foreground hover:text-navy">Buy</Link>
          <Link to="/rent" className="text-muted-foreground hover:text-navy">Rent</Link>
          <Link to="/packages" className="text-muted-foreground hover:text-navy">Packages</Link>
          <Link to="/about" className="text-muted-foreground hover:text-navy">About</Link>
          <Link to="/contact" className="text-muted-foreground hover:text-navy">Contact</Link>
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
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <p className="font-display text-base tracking-tight">
              abaad<span className="text-green">.</span>com
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Karachi's curated real estate marketplace.
            </p>
          </div>
          <FooterCol title="Explore" links={[
            { to: "/", label: "Buy" },
            { to: "/rent", label: "Rent" },
          ]} />
          <FooterCol title="Realtors" links={[
            { to: "/packages", label: "Packages" },
            { to: "/list", label: "List property" },
          ]} />
          <FooterCol title="Company" links={[
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
          ]} />
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} abaad.com — Karachi, Pakistan.</p>
          <p className="text-xs text-muted-foreground">Built for buyers, tenants & verified realtors.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-foreground">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="hover:text-navy">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
