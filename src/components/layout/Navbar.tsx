"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  Shield,
  MessageCircle,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/feed", label: "Feed", icon: LayoutGrid },
  { href: "/mensagens", label: "Mensagens", icon: MessageCircle },
  { href: "/anuncio/novo", label: "Novo Anúncio", icon: Plus },
];

interface UserMenuProps {
  name: string;
  unreadCount?: number;
  isAdmin?: boolean;
}

function UserMenu({ name, unreadCount = 0, isAdmin }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative flex items-center gap-3">
      {/* Notification bell */}
      <Link
        href="/notificacoes"
        className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        aria-label="Notificações"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>

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
                Meus Anúncios
              </DropdownLink>
              <DropdownLink href="/favoritos" icon={Heart} onClick={() => setOpen(false)}>
                Favoritos
              </DropdownLink>
              {isAdmin && (
                <DropdownLink href="/admin" icon={Shield} onClick={() => setOpen(false)}>
                  Painel Admin
                </DropdownLink>
              )}
            </div>
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={() => { setOpen(false); handleLogout(); }}
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
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const user = session?.user;
  const isLoggedIn = !!user;
  const isAdmin = user && "role" in user && (user as { role: string }).role === "ADMIN";

  useEffect(() => {
    if (isLoggedIn) {
      fetch("/api/notifications?unreadOnly=true")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setUnreadCount(data.length);
          } else if (data?.count !== undefined) {
            setUnreadCount(data.count);
          }
        })
        .catch(() => {});
    }
  }, [isLoggedIn]);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={isLoggedIn ? "/feed" : "/"} className="flex shrink-0 items-center gap-1.5">
          <span className="text-xl">🌱</span>
          <span className="text-lg font-bold text-gray-900">AiCansei</span>
        </Link>

        {/* Search — hidden on mobile */}
        {isLoggedIn && (
          <div className="hidden flex-1 justify-center px-8 md:flex">
            <div className="relative w-full max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Link
                href="/feed"
                className="block w-full rounded-full border border-gray-200 bg-gray-50 py-2 pr-4 pl-9 text-sm text-gray-400 transition-colors hover:bg-white hover:text-gray-900"
              >
                Buscar itens...
              </Link>
            </div>
          </div>
        )}

        {/* Desktop nav + user */}
        <div className="hidden items-center gap-1 md:flex">
          {isLoggedIn ? (
            <>
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
              <UserMenu name={user?.name || "Usuário"} unreadCount={unreadCount} isAdmin={isAdmin} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          {isLoggedIn ? (
            <>
              <UserMenu name={user?.name || "Usuário"} unreadCount={unreadCount} isAdmin={isAdmin} />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && isLoggedIn && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <nav className="space-y-1 px-2 py-3">
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
            <Link
              href="/meus-anuncios"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <LayoutGrid size={18} />
              Meus Anúncios
            </Link>
            <Link
              href="/favoritos"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <Heart size={18} />
              Favoritos
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
