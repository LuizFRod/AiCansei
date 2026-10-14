import { vi } from "vitest";
/**
 * Integration tests for the announcements API routes.
 *
 * We mock Prisma and auth to test the route handlers in isolation.
 */

// ─── Mocks (must be declared before imports that use them) ───────────────────

vi.mock("@/lib/prisma", () => ({
  prisma: {
    announcement: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// ─── Imports ─────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { GET, POST } from "@/app/api/announcements/route";

// Helper: create a proper NextRequest with nextUrl.searchParams
function mockRequest(url: string, init?: RequestInit) {
  const { NextRequest } = require("next/server");
  return new NextRequest(url, init);
}

// ─── GET /api/announcements ──────────────────────────────────────────────────

describe("GET /api/announcements", () => {
  const mockAnnouncements = [
    {
      id: "ann1",
      title: "Sofá used",
      description: "Great sofa",
      category: "MOVEIS",
      status: "ATIVO",
      photos: [],
      donor: { name: "John", photo: null, reputation: 4.5 },
      _count: { manifestations: 2, favorites: 5 },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.announcement.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockAnnouncements);
    (prisma.announcement.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);
  });

  it("returns announcements with default status ATIVO", async () => {
    const req = mockRequest("http://localhost/api/announcements");
    const res = await GET(req);
    const data = await res.json();

    expect(data.announcements).toEqual(
      mockAnnouncements.map((a) => ({ ...a, isFavorited: false }))
    );
    expect(data.total).toBe(1);
    expect(data.page).toBe(1);
    expect(data.totalPages).toBe(1);
  });

  it("defaults to page 1 and limit 12", async () => {
    const req = mockRequest("http://localhost/api/announcements");
    await GET(req);

    expect(prisma.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 12 })
    );
  });

  it("calculates correct skip for page 2", async () => {
    const req = mockRequest("http://localhost/api/announcements?page=2&limit=10");
    await GET(req);

    expect(prisma.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it("filters by category", async () => {
    const req = mockRequest("http://localhost/api/announcements?category=ELETRONICOS");
    await GET(req);

    expect(prisma.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: "ELETRONICOS" }),
      })
    );
  });

  it("filters by condition", async () => {
    const req = mockRequest("http://localhost/api/announcements?condition=NOVO");
    await GET(req);

    expect(prisma.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ condition: "NOVO" }),
      })
    );
  });

  it("filters by city", async () => {
    const req = mockRequest("http://localhost/api/announcements?city=São Paulo");
    await GET(req);

    expect(prisma.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ city: "São Paulo" }),
      })
    );
  });

  it("filters by availability", async () => {
    const req = mockRequest("http://localhost/api/announcements?availability=ENTREGA");
    await GET(req);

    expect(prisma.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ availability: "ENTREGA" }),
      })
    );
  });

  it("filters by donorId", async () => {
    const req = mockRequest("http://localhost/api/announcements?donorId=user123");
    await GET(req);

    expect(prisma.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ donorId: "user123" }),
      })
    );
  });

  it("uses custom status when provided", async () => {
    const req = mockRequest("http://localhost/api/announcements?status=PENDENTE");
    await GET(req);

    expect(prisma.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "PENDENTE" }),
      })
    );
  });

  it("adds OR filter for search term", async () => {
    const req = mockRequest("http://localhost/api/announcements?search=sofá");
    await GET(req);

    expect(prisma.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: "sofá", mode: "insensitive" } },
            { description: { contains: "sofá", mode: "insensitive" } },
          ],
        }),
      })
    );
  });

  it("combines multiple filters", async () => {
    const req = mockRequest(
      "http://localhost/api/announcements?category=MOVEIS&city=Rio&condition=BOM"
    );
    await GET(req);

    expect(prisma.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: "MOVEIS",
          city: "Rio",
          condition: "BOM",
        }),
      })
    );
  });

  it("includes photos, donor, and count relations", async () => {
    const req = mockRequest("http://localhost/api/announcements");
    await GET(req);

    expect(prisma.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          photos: expect.any(Object),
          donor: expect.any(Object),
          _count: expect.any(Object),
        }),
      })
    );
  });

  it("orders by createdAt desc", async () => {
    const req = mockRequest("http://localhost/api/announcements");
    await GET(req);

    expect(prisma.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      })
    );
  });

  it("calculates totalPages correctly", async () => {
    (prisma.announcement.count as ReturnType<typeof vi.fn>).mockResolvedValue(25);
    const req = mockRequest("http://localhost/api/announcements?limit=10");
    const res = await GET(req);
    const data = await res.json();

    expect(data.totalPages).toBe(3); // ceil(25/10)
  });

  it("returns empty array when no announcements found", async () => {
    (prisma.announcement.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.announcement.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    const req = mockRequest("http://localhost/api/announcements");
    const res = await GET(req);
    const data = await res.json();

    expect(data.announcements).toEqual([]);
    expect(data.total).toBe(0);
    expect(data.totalPages).toBe(0);
  });

  it("returns 500 on error", async () => {
    (prisma.announcement.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("DB error")
    );

    const req = mockRequest("http://localhost/api/announcements");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Erro interno do servidor.");
  });
});

// ─── POST /api/announcements ─────────────────────────────────────────────────

describe("POST /api/announcements", () => {
  const validBody = {
    title: "Sofá em bom estado",
    description: "Sofá de 3 lugares, cor cinza, usado por 2 anos",
    category: "MOVEIS",
    condition: "BOM",
    availability: "RETIRADA",
    city: "São Paulo",
    state: "SP",
  };

  const mockCreated = {
    id: "ann-new",
    ...validBody,
    status: "PENDENTE",
    donorId: "user123",
    photos: [],
    donor: { id: "user123", name: "João", photo: null, reputation: 0 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user123" },
    });
    (prisma.announcement.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreated);
  });

  it("creates an announcement with valid data", async () => {
    const req = mockRequest("http://localhost/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.title).toBe("Sofá em bom estado");
    expect(data.status).toBe("PENDENTE");
  });

  it("sets donorId from session", async () => {
    const req = mockRequest("http://localhost/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    await POST(req);

    expect(prisma.announcement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ donorId: "user123" }),
      })
    );
  });

  it("returns 401 when not authenticated", async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const req = mockRequest("http://localhost/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when session has no user id", async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ user: {} });

    const req = mockRequest("http://localhost/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 with validation error for invalid data", async () => {
    const req = mockRequest("http://localhost/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Ab" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing required fields", async () => {
    const req = mockRequest("http://localhost/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("includes photos in creation when provided", async () => {
    const bodyWithPhotos = {
      ...validBody,
      photos: [
        { url: "https://example.com/photo1.jpg", sortOrder: 0 },
        { url: "https://example.com/photo2.jpg", sortOrder: 1 },
      ],
    };

    const req = mockRequest("http://localhost/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyWithPhotos),
    });

    await POST(req);

    expect(prisma.announcement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          photos: {
            create: [
              { url: "https://example.com/photo1.jpg", sortOrder: 0 },
              { url: "https://example.com/photo2.jpg", sortOrder: 1 },
            ],
          },
        }),
      })
    );
  });

  it("sets status to PENDENTE on creation", async () => {
    const req = mockRequest("http://localhost/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    await POST(req);

    expect(prisma.announcement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "PENDENTE" }),
      })
    );
  });

  it("handles null optional fields", async () => {
    const req = mockRequest("http://localhost/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    await POST(req);

    expect(prisma.announcement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          address: null,
          latitude: null,
          longitude: null,
        }),
      })
    );
  });

  it("returns 500 on database error", async () => {
    (prisma.announcement.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("DB error")
    );

    const req = mockRequest("http://localhost/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("validates category enum", async () => {
    const req = mockRequest("http://localhost/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validBody, category: "INVALID" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("validates condition enum", async () => {
    const req = mockRequest("http://localhost/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validBody, condition: "INVALID" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("validates availability enum", async () => {
    const req = mockRequest("http://localhost/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validBody, availability: "INVALID" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
