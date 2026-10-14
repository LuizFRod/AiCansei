"use client";

import { useState, useCallback } from "react";

export function useFavorites() {
  const [favoriting, setFavoriting] = useState<string | null>(null);

  const toggleFavorite = useCallback(async (announcementId: string): Promise<{ favorited: boolean; count: number } | null> => {
    setFavoriting(announcementId);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId }),
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      return null;
    } finally {
      setFavoriting(null);
    }
  }, []);

  return { toggleFavorite, favoriting };
}
