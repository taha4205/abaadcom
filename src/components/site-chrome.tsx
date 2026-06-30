import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/lib/use-auth";
import { useWishlist } from "@/lib/wishlist";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, LogOut, List, Heart, ChevronDown, Calculator } from "lucide-react";

export function Header() {
  const [authOpen, setAuthOpen] = useState(false);
  const { user, realtor, signOut } = useAuth();
  const { count } = useWishlist();

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
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link to="/" className="text-muted-foreground hover:text-navy">Buy</Link>
          <Link to="/rent" className="text-muted-foreground hover:text-navy">Rent</Link>
          <Link to="/realtors" className="text-muted-foreground hover:text-navy">Realtors</Link>
          <Link to="/magazine" className="text-muted-foreground hover:text-navy">Magazine</Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 text-muted-foreground hover:text-navy">
                Tools <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link to="/calculator"><Calculator className="mr-2 h-4 w-4" /> Home Loan Calculator</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/packages" className="text-muted-foreground hover:text-navy">Packages</Link>
          <Link to="/about" className="text-muted-foreground hover:text-navy">About</Link>
          <Link to="/contact" className="text-muted-foreground hover:text-navy">Contact</Link>
        </nav>
        <div className="flex items-center gap-1.5">
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-navy"
          >
            <Heart className={`h-5 w-5 ${count > 0 ? "fill-green text-green" : ""}`} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-green px-1 text-[10px] font-semibold text-green-foreground">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden gap-2 text-sm md:inline-flex">
                  <UserIcon className="h-4 w-4" />
                  {realtor?.full_name ?? user.email?.split("@")[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link to="/my-listings"><List className="mr-2 h-4 w-4" /> My Listings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}><LogOut className="mr-2 h-4 w-4" /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" className="hidden text-sm md:inline-flex" onClick={() => setAuthOpen(true)}>Sign in</Button>
          )}
          <Link to="/list">
            <Button className="bg-navy text-navy-foreground hover:bg-navy/90">List property</Button>
          </Link>
        </div>
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
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
            { to: "/magazine", label: "Magazine" },
            { to: "/calculator", label: "Loan Calculator" },
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
