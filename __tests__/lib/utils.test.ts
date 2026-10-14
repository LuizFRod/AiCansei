import { vi } from "vitest";
import { cn, formatDate, formatRelativeTime, truncate } from "@/lib/utils";

// ─── cn() ────────────────────────────────────────────────────────────────────

describe("cn()", () => {
  it("returns an empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  it("returns a single class name unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("concatenates multiple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles undefined and null gracefully", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("handles empty strings", () => {
    expect(cn("foo", "", "bar")).toBe("foo bar");
  });

  it("handles false and true booleans", () => {
    expect(cn("foo", false && "hidden", true && "visible")).toBe("foo visible");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe(
      "base active"
    );
  });

  it("handles object syntax", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("handles arrays", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("handles mixed types", () => {
    expect(cn("a", undefined, "b", null, "c", 0 && "d", { e: true })).toBe(
      "a b c e"
    );
  });
});

// ─── formatDate() ────────────────────────────────────────────────────────────

describe("formatDate()", () => {
  it("formats a Date object to pt-BR format DD/MM/YYYY", () => {
    const date = new Date(2025, 0, 15); // 15 January 2025
    expect(formatDate(date)).toBe("15/01/2025");
  });

  it("formats an ISO string to pt-BR format", () => {
    expect(formatDate("2024-12-25T12:00:00")).toBe("25/12/2024");
  });

  it("handles first day of year", () => {
    const date = new Date(2026, 0, 1);
    expect(formatDate(date)).toBe("01/01/2026");
  });

  it("handles last day of year", () => {
    const date = new Date(2025, 11, 31);
    expect(formatDate(date)).toBe("31/12/2025");
  });

  it("pads single-digit days and months", () => {
    const date = new Date(2025, 2, 5); // 5 March 2025
    expect(formatDate(date)).toBe("05/03/2025");
  });

  it("handles leap year date", () => {
    const date = new Date(2024, 1, 29); // 29 February 2024
    expect(formatDate(date)).toBe("29/02/2024");
  });

  it("handles a datetime ISO string (ignores time for date-only output)", () => {
    expect(formatDate("2025-07-04T15:30:00Z")).toBe("04/07/2025");
  });
});

// ─── formatRelativeTime() ────────────────────────────────────────────────────

describe("formatRelativeTime()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'agora' for a date less than 1 minute ago", () => {
    const now = new Date("2025-06-15T12:00:00Z");
    vi.setSystemTime(now);
    const recent = new Date(now.getTime() - 30_000); // 30 seconds ago
    expect(formatRelativeTime(recent)).toBe("agora");
  });

  it("returns 'agora' for the exact same time", () => {
    const now = new Date("2025-06-15T12:00:00Z");
    vi.setSystemTime(now);
    expect(formatRelativeTime(now)).toBe("agora");
  });

  it("returns minutes format for 1-59 minutes", () => {
    const now = new Date("2025-06-15T12:00:00Z");
    vi.setSystemTime(now);
    const fiveMinAgo = new Date(now.getTime() - 5 * 60_000);
    expect(formatRelativeTime(fiveMinAgo)).toBe("há 5min");

    const thirtyMinAgo = new Date(now.getTime() - 30 * 60_000);
    expect(formatRelativeTime(thirtyMinAgo)).toBe("há 30min");

    const fiftyNineMinAgo = new Date(now.getTime() - 59 * 60_000);
    expect(formatRelativeTime(fiftyNineMinAgo)).toBe("há 59min");
  });

  it("returns 1min for exactly 1 minute", () => {
    const now = new Date("2025-06-15T12:00:00Z");
    vi.setSystemTime(now);
    const oneMinAgo = new Date(now.getTime() - 60_000);
    expect(formatRelativeTime(oneMinAgo)).toBe("há 1min");
  });

  it("returns hours format for 1-23 hours", () => {
    const now = new Date("2025-06-15T12:00:00Z");
    vi.setSystemTime(now);
    const twoHoursAgo = new Date(now.getTime() - 2 * 3_600_000);
    expect(formatRelativeTime(twoHoursAgo)).toBe("há 2h");

    const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 3_600_000);
    expect(formatRelativeTime(twentyThreeHoursAgo)).toBe("há 23h");
  });

  it("returns days format for 1-6 days", () => {
    const now = new Date("2025-06-15T12:00:00Z");
    vi.setSystemTime(now);
    const threeDaysAgo = new Date(now.getTime() - 3 * 86_400_000);
    expect(formatRelativeTime(threeDaysAgo)).toBe("há 3d");

    const sixDaysAgo = new Date(now.getTime() - 6 * 86_400_000);
    expect(formatRelativeTime(sixDaysAgo)).toBe("há 6d");
  });

  it("returns formatted date for 7+ days", () => {
    const now = new Date("2025-06-15T12:00:00Z");
    vi.setSystemTime(now);
    const tenDaysAgo = new Date(now.getTime() - 10 * 86_400_000);
    expect(formatRelativeTime(tenDaysAgo)).toBe("05/06/2025");

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);
    expect(formatRelativeTime(thirtyDaysAgo)).toBe("16/05/2025");
  });

  it("handles ISO string input", () => {
    const now = new Date("2025-06-15T12:00:00Z");
    vi.setSystemTime(now);
    expect(formatRelativeTime("2025-06-15T10:00:00Z")).toBe("há 2h");
  });

  it("returns 1h for exactly 1 hour", () => {
    const now = new Date("2025-06-15T12:00:00Z");
    vi.setSystemTime(now);
    const oneHourAgo = new Date(now.getTime() - 3_600_000);
    expect(formatRelativeTime(oneHourAgo)).toBe("há 1h");
  });

  it("returns 1d for exactly 1 day", () => {
    const now = new Date("2025-06-15T12:00:00Z");
    vi.setSystemTime(now);
    const oneDayAgo = new Date(now.getTime() - 86_400_000);
    expect(formatRelativeTime(oneDayAgo)).toBe("há 1d");
  });
});

// ─── truncate() ──────────────────────────────────────────────────────────────

describe("truncate()", () => {
  it("returns the string unchanged when shorter than maxLength", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("returns the string unchanged when exactly maxLength", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates and adds ellipsis when longer than maxLength", () => {
    expect(truncate("hello world", 5)).toBe("hello...");
  });

  it("truncates to exactly maxLength + '...'", () => {
    const result = truncate("abcdefghij", 3);
    expect(result).toBe("abc...");
    expect(result.length).toBe(6); // 3 + 3 dots
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });

  it("handles maxLength of 0", () => {
    expect(truncate("hello", 0)).toBe("...");
  });

  it("handles maxLength of 1", () => {
    expect(truncate("hello", 1)).toBe("h...");
  });

  it("handles single character string within limit", () => {
    expect(truncate("a", 1)).toBe("a");
  });

  it("handles a very long string", () => {
    const long = "a".repeat(1000);
    const result = truncate(long, 50);
    expect(result).toBe("a".repeat(50) + "...");
    expect(result.length).toBe(53);
  });

  it("handles string with unicode characters", () => {
    expect(truncate("ola mundo", 3)).toBe("ola...");
  });
});
