/**
 * Integration tests for the favorites API route.
 *
 * We mock Prisma and auth to test the route handlers in isolation.
 */

// ─── Mocks (must be declared before imports that use them) ───────────────────

jest.mock("@/lib/prisma", () => ({
  prisma: {
    favorite: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    announcement: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

// ─── Imports ─────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { GET, POST } from "@/app/api/favorites/route";

// Helper: create a minimal mock NextRequest
function mockRequest(url: string, init?: RequestInit) {
  return new Request(url, init) as unknown as import("next/server").NextRequest;
}

// ─── GET /api/favorites ──────────────────────────────────────────────────────

describe("GET /api/favorites", () => {
  const mockFavorites = [
    {
      id: "fav1",
      userId: "user123",
      announcementId: "ann1",
      createdAt: "2025-01-01T00:00:00.000Z",
      announcement: {
        id: "ann1",
        title: "Sofá",
        photos: [{ url: "photo.jpg" }],
        donor: { id: "donor1", name: "João", photo: null, reputation: 4.5 },
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({
      user: { id: "user123" },
    });
    (prisma.favorite.findMany as jest.Mock).mockResolvedValue(mockFavorites);
  });

  it("returns favorites for the authenticated user", async () => {
    const res = await GET();
    const data = await res.json();

    expect(data).toEqual(mockFavorites);
  });

  it("queries with the correct userId", async () => {
    await GET();

    expect(prisma.favorite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user123" },
      })
    );
  });

  it("includes announcement with photos and donor", async () => {
    await GET();

    expect(prisma.favorite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          announcement: expect.objectContaining({
            include: expect.objectContaining({
              photos: expect.any(Object),
              donor: expect.any(Object),
            }),
          }),
        }),
      })
    );
  });

  it("orders by createdAt desc", async () => {
    await GET();

    expect(prisma.favorite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      })
    );
  });

  it("returns 401 when not authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 401 when session has no user id", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: {} });

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns empty array when no favorites exist", async () => {
    (prisma.favorite.findMany as jest.Mock).mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();

    expect(data).toEqual([]);
  });

  it("returns 500 on database error", async () => {
    (prisma.favorite.findMany as jest.Mock).mockRejectedValue(
      new Error("DB error")
    );

    const res = await GET();
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toBe("Erro interno do servidor.");
  });
});

// ─── POST /api/favorites (toggle) ────────────────────────────────────────────

describe("POST /api/favorites", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({
      user: { id: "user123" },
    });
  });

  describe("adding a favorite (when none exists)", () => {
    beforeEach(() => {
      (prisma.announcement.findUnique as jest.Mock).mockResolvedValue({
        id: "ann1",
      });
      (prisma.favorite.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.favorite.create as jest.Mock).mockResolvedValue({
        id: "fav1",
        userId: "user123",
        announcementId: "ann1",
      });
      (prisma.favorite.count as jest.Mock).mockResolvedValue(1);
    });

    it("creates a favorite when none exists", async () => {
      const req = mockRequest("http://localhost/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: "ann1" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(data.favorited).toBe(true);
      expect(data.count).toBe(1);
    });

    it("calls prisma.favorite.create with correct data", async () => {
      const req = mockRequest("http://localhost/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: "ann1" }),
      });

      await POST(req);

      expect(prisma.favorite.create).toHaveBeenCalledWith({
        data: {
          userId: "user123",
          announcementId: "ann1",
        },
      });
    });

    it("returns the updated favorite count", async () => {
      (prisma.favorite.count as jest.Mock).mockResolvedValue(3);

      const req = mockRequest("http://localhost/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: "ann1" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(data.count).toBe(3);
    });
  });

  describe("removing a favorite (when one exists)", () => {
    beforeEach(() => {
      (prisma.announcement.findUnique as jest.Mock).mockResolvedValue({
        id: "ann1",
      });
      (prisma.favorite.findUnique as jest.Mock).mockResolvedValue({
        id: "fav-existing",
        userId: "user123",
        announcementId: "ann1",
      });
      (prisma.favorite.delete as jest.Mock).mockResolvedValue({});
      (prisma.favorite.count as jest.Mock).mockResolvedValue(0);
    });

    it("deletes the existing favorite", async () => {
      const req = mockRequest("http://localhost/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: "ann1" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(data.favorited).toBe(false);
    });

    it("calls prisma.favorite.delete with the existing favorite id", async () => {
      const req = mockRequest("http://localhost/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: "ann1" }),
      });

      await POST(req);

      expect(prisma.favorite.delete).toHaveBeenCalledWith({
        where: { id: "fav-existing" },
      });
    });

    it("does not call prisma.favorite.create when toggling off", async () => {
      const req = mockRequest("http://localhost/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: "ann1" }),
      });

      await POST(req);

      expect(prisma.favorite.create).not.toHaveBeenCalled();
    });

    it("returns updated count after removing", async () => {
      (prisma.favorite.count as jest.Mock).mockResolvedValue(4);

      const req = mockRequest("http://localhost/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: "ann1" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(data.count).toBe(4);
      expect(data.favorited).toBe(false);
    });
  });

  describe("error handling", () => {
    it("returns 401 when not authenticated", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const req = mockRequest("http://localhost/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: "ann1" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it("returns 400 when announcementId is missing", async () => {
      const req = mockRequest("http://localhost/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe("announcementId e obrigatorio.");
    });

    it("returns 400 when announcementId is undefined in body", async () => {
      const req = mockRequest("http://localhost/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: undefined }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 404 when announcement does not exist", async () => {
      (prisma.announcement.findUnique as jest.Mock).mockResolvedValue(null);

      const req = mockRequest("http://localhost/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: "nonexistent" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(404);

      const data = await res.json();
      expect(data.error).toBe("Anuncio nao encontrado.");
    });

    it("returns 500 on database error during create", async () => {
      (prisma.announcement.findUnique as jest.Mock).mockResolvedValue({
        id: "ann1",
      });
      (prisma.favorite.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.favorite.create as jest.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const req = mockRequest("http://localhost/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: "ann1" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(500);
    });

    it("returns 500 on database error during delete", async () => {
      (prisma.announcement.findUnique as jest.Mock).mockResolvedValue({
        id: "ann1",
      });
      (prisma.favorite.findUnique as jest.Mock).mockResolvedValue({
        id: "fav1",
      });
      (prisma.favorite.delete as jest.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const req = mockRequest("http://localhost/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: "ann1" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(500);
    });
  });

  describe("toggle behavior", () => {
    it("toggles from favorited to unfavorited", async () => {
      // First: has a favorite
      (prisma.announcement.findUnique as jest.Mock).mockResolvedValue({
        id: "ann1",
      });
      (prisma.favorite.findUnique as jest.Mock).mockResolvedValue({
        id: "fav1",
        userId: "user123",
        announcementId: "ann1",
      });
      (prisma.favorite.delete as jest.Mock).mockResolvedValue({});
      (prisma.favorite.count as jest.Mock).mockResolvedValue(2);

      const req = mockRequest("http://localhost/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: "ann1" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(data.favorited).toBe(false);
      expect(prisma.favorite.delete).toHaveBeenCalled();
      expect(prisma.favorite.create).not.toHaveBeenCalled();
    });

    it("toggles from unfavorited to favorited", async () => {
      (prisma.announcement.findUnique as jest.Mock).mockResolvedValue({
        id: "ann1",
      });
      (prisma.favorite.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.favorite.create as jest.Mock).mockResolvedValue({
        id: "fav-new",
      });
      (prisma.favorite.count as jest.Mock).mockResolvedValue(3);

      const req = mockRequest("http://localhost/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: "ann1" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(data.favorited).toBe(true);
      expect(prisma.favorite.create).toHaveBeenCalled();
      expect(prisma.favorite.delete).not.toHaveBeenCalled();
    });
  });
});
