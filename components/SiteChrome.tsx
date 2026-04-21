import Link from "next/link";

const socials = [
  {
    name: "X",
    href: "https://x.com/usesigma?s=21",
    label: "Open Sigma on X",
    icon: (
      <path d="M13.74 10.38 21.13 2h-1.75l-6.42 7.28L7.83 2H1.92l7.75 11.02L1.92 21.8h1.75l6.78-7.69 5.42 7.69h5.91l-8.04-11.42Zm-2.4 2.72-.79-1.1L4.31 3.29h2.68l5.05 7.04.78 1.1 6.55 9.14h-2.68l-5.35-7.47Z" />
    )
  },
  {
    name: "Telegram",
    href: "https://t.me/sigmaofficialchat",
    label: "Open Sigma Telegram chat",
    icon: (
      <path d="M21.58 3.32a1.5 1.5 0 0 0-1.55-.22L3.24 9.58c-.72.28-1.18.78-1.22 1.34-.04.56.35 1.07 1.04 1.38l4.3 1.88 1.72 5.31c.22.67.62 1.07 1.12 1.11.43.03.86-.2 1.24-.66l2.25-2.75 4.4 3.26c.44.32.88.43 1.27.32.45-.13.78-.52.94-1.1L22.1 4.82c.18-.7-.01-1.22-.52-1.5ZM8.16 13.1l8.4-5.31-6.52 7.03-.25 2.87-1.05-3.24a1.7 1.7 0 0 0-.58-1.35Zm10.45 5.85-4.5-3.34a1 1 0 0 0-1.37.17l-1.18 1.44.14-1.57 7.07-7.62-1.23 10.72.07.05-.01.04Z" />
    )
  }
];

function SocialIconLink({
  social,
  className,
  iconClassName
}: {
  social: (typeof socials)[number];
  className: string;
  iconClassName: string;
}) {
  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      className={className}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={iconClassName}
        fill="currentColor"
      >
        {social.icon}
      </svg>
    </a>
  );
}

export function SiteHeader() {
  return (
    <nav className="sticky top-0 z-30 border-b border-white/10 bg-ink/80 backdrop-blur-xl sm:static">
      <div className="relative mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Go to Sigma home">
          <span className="font-serif text-4xl font-bold italic tracking-normal text-white drop-shadow-[0_0_18px_rgba(84,240,178,0.28)] sm:text-5xl">
            Sigma
          </span>
        </Link>
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
            <span className="h-2 w-2 rounded-full bg-acid shadow-[0_0_18px_rgba(84,240,178,0.9)]" />
            Live token intelligence
          </div>
          <div className="flex items-center gap-2">
            {socials.map((social) => (
              <SocialIconLink
                key={social.name}
                social={social}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-acid/50 hover:text-acid focus:outline-none focus:ring-2 focus:ring-acid/60"
                iconClassName="h-5 w-5"
              />
            ))}
          </div>
        </div>
        <details className="group sm:hidden">
          <summary
            aria-label="Open navigation menu"
            className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white transition hover:border-acid/50 [&::-webkit-details-marker]:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </summary>
          <div className="absolute right-5 top-16 z-20 w-56 rounded-3xl border border-white/10 bg-panel/95 p-3 shadow-glow backdrop-blur-xl">
            <Link
              href="/"
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06] hover:text-acid"
            >
              Home
            </Link>
            <Link
              href="/get-started"
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06] hover:text-acid"
            >
              Launch App
            </Link>
            <Link
              href="/#why-choose-us"
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06] hover:text-acid"
            >
              Why Choose Us
            </Link>
            <Link
              href="/#how-it-works"
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06] hover:text-acid"
            >
              How It Works
            </Link>
            <div className="my-2 h-px bg-white/10" />
            <div className="grid grid-cols-2 gap-2">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm font-medium text-slate-200 transition hover:border-acid/40 hover:text-acid"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                  >
                    {social.icon}
                  </svg>
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </details>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-ink/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-8 text-center sm:px-8">
        <p className="text-sm text-slate-400">2026 Sigma. All rights reserved.</p>
        <div className="flex items-center gap-3">
          {socials.map((social) => (
            <SocialIconLink
              key={social.name}
              social={social}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-acid/50 hover:text-acid focus:outline-none focus:ring-2 focus:ring-acid/60"
              iconClassName="h-5 w-5"
            />
          ))}
        </div>
      </div>
    </footer>
  );
}
