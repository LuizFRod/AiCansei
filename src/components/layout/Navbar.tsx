"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  Plus,
  User,
  Heart,
  LogOut,
  LayoutGrid,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/feed", label: "Feed", icon: LayoutGrid },
  { href: "/novo-anuncio", label: "Novo Anúncio", icon: Plus },
];

interface UserMenuProps {
  name: string;
  unreadCount?: number;
}

function UserMenu({ name, unreadCount = 0 }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex items-center gap-3">
      {/* Notification bell */}
      <button
        className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        aria-label="Notificacoes"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* User dropdown */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700">
          {name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden text-sm font-medium text-gray-700 md:block">
          {name}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "hidden text-gray-400 transition-transform md:block",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{name}</p>
              <p className="text-xs text-gray-500">Minha conta</p>
            </div>
            <div className="py-1">
              <DropdownLink href="/perfil" icon={User} onClick={() => setOpen(false)}>
                Perfil
              </DropdownLink>
              <DropdownLink href="/meus-anuncios" icon={LayoutGrid} onClick={() => setOpen(false)}>
                Meus Anuncios
              </DropdownLink>
              <DropdownLink href="/favoritos" icon={Heart} onClick={() => setOpen(false)}>
                Favoritos
              </DropdownLink>
            </div>
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DropdownLink({
  href,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  icon: typeof User;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
    >
      <Icon size={16} className="text-gray-400" />
      {children}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Placeholder user data — will be replaced with auth context
  const user = { name: "Usuario" };
  const unreadCount = 3;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-1.5">
          <span className="text-xl">🌱</span>
          <span className="text-lg font-bold text-gray-900">AiCansei</span>
        </Link>

        {/* Search — hidden on mobile */}
        <div className="hidden flex-1 justify-center px-8 md:flex">
          <div className="relative w-full max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar itens..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pr-4 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Desktop nav + user */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            );
          })}
          <div className="mx-2 h-6 w-px bg-gray-200" />
          <UserMenu name={user.name} unreadCount={unreadCount} />
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <UserMenu name={user.name} unreadCount={unreadCount} />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="px-4 py-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar itens..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pr-4 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <nav className="space-y-1 px-2 pb-4">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
