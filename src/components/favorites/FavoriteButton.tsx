"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface FavoriteButtonProps {
  announcementId: string;
  initialFavorited?: boolean;
  initialCount?: number;
  size?: "sm" | "md";
  showCount?: boolean;
}

export function FavoriteButton({
  announcementId,
  initialFavorited = false,
  initialCount = 0,
  size = "md",
  showCount = false,
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFavorited(data.favorited);
        setCount(data.count);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  const iconSize = size === "sm" ? 16 : 20;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full transition-colors ${
        favorited
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400"
      } ${size === "sm" ? "px-2 py-1" : "px-3 py-1.5"}`}
    >
      <Heart
        size={iconSize}
        fill={favorited ? "currentColor" : "none"}
        className={loading ? "animate-pulse" : ""}
      />
      {showCount && count > 0 && (
        <span className="text-xs font-medium">{count}</span>
      )}
    </button>
  );
}
