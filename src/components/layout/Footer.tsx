import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
  { href: "/termos", label: "Termos" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <p className="text-sm text-gray-600">
            AiCansei &copy; {new Date().getFullYear()}
          </p>
          <p className="text-xs text-gray-400">
            Feito com &#10084;&#65039; para doar mais
          </p>
        </div>

        <nav className="flex items-center gap-6">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-500 transition-colors hover:text-emerald-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
