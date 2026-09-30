import React from "react";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";

describe("Card", () => {
  it("renders children content", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("applies base styles", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content").closest("div");
    expect(card?.className).toContain("rounded-xl");
    expect(card?.className).toContain("border");
    expect(card?.className).toContain("border-gray-200");
    expect(card?.className).toContain("bg-white");
    expect(card?.className).toContain("shadow-sm");
  });

  it("applies custom className", () => {
    render(<Card className="custom-card">Content</Card>);
    const card = screen.getByText("Content").closest("div");
    expect(card?.className).toContain("custom-card");
  });

  it("does not apply hover styles by default", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content").closest("div");
    expect(card?.className).not.toContain("hover:shadow-md");
    expect(card?.className).not.toContain("cursor-pointer");
  });

  it("applies hover styles when hover is true", () => {
    render(<Card hover>Content</Card>);
    const card = screen.getByText("Content").closest("div");
    expect(card?.className).toContain("hover:shadow-md");
    expect(card?.className).toContain("cursor-pointer");
    expect(card?.className).toContain("transition-shadow");
  });

  it("passes through additional HTML attributes", () => {
    render(<Card data-testid="my-card" id="card-1">Content</Card>);
    const card = screen.getByTestId("my-card");
    expect(card).toHaveAttribute("id", "card-1");
  });

  it("renders complex children", () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Paragraph</p>
        <button>Action</button>
      </Card>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Paragraph")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });
});

// ─── CardHeader ──────────────────────────────────────────────────────────────

describe("CardHeader", () => {
  it("renders children", () => {
    render(<Card><CardHeader>Header content</CardHeader></Card>);
    expect(screen.getByText("Header content")).toBeInTheDocument();
  });

  it("applies header styles", () => {
    render(<Card><CardHeader>Header</CardHeader></Card>);
    const header = screen.getByText("Header");
    expect(header.className).toContain("px-5");
    expect(header.className).toContain("pt-5");
  });

  it("applies custom className", () => {
    render(
      <Card>
        <CardHeader className="custom-header">Header</CardHeader>
      </Card>
    );
    const header = screen.getByText("Header");
    expect(header.className).toContain("custom-header");
  });
});

// ─── CardContent ─────────────────────────────────────────────────────────────

describe("CardContent", () => {
  it("renders children", () => {
    render(<Card><CardContent>Body content</CardContent></Card>);
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("applies content styles", () => {
    render(<Card><CardContent>Body</CardContent></Card>);
    const content = screen.getByText("Body");
    expect(content.className).toContain("px-5");
    expect(content.className).toContain("pb-5");
  });

  it("applies custom className", () => {
    render(
      <Card>
        <CardContent className="custom-content">Body</CardContent>
      </Card>
    );
    const content = screen.getByText("Body");
    expect(content.className).toContain("custom-content");
  });

  it("renders complex children", () => {
    render(
      <Card>
        <CardContent>
          <span>Tag 1</span>
          <span>Tag 2</span>
        </CardContent>
      </Card>
    );
    expect(screen.getByText("Tag 1")).toBeInTheDocument();
    expect(screen.getByText("Tag 2")).toBeInTheDocument();
  });
});

// ─── CardFooter ──────────────────────────────────────────────────────────────

describe("CardFooter", () => {
  it("renders children", () => {
    render(<Card><CardFooter>Footer content</CardFooter></Card>);
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("applies footer styles", () => {
    render(<Card><CardFooter>Footer</CardFooter></Card>);
    const footer = screen.getByText("Footer");
    expect(footer.className).toContain("border-t");
    expect(footer.className).toContain("border-gray-100");
    expect(footer.className).toContain("px-5");
    expect(footer.className).toContain("py-3");
  });

  it("applies custom className", () => {
    render(
      <Card>
        <CardFooter className="custom-footer">Footer</CardFooter>
      </Card>
    );
    const footer = screen.getByText("Footer");
    expect(footer.className).toContain("custom-footer");
  });

  it("renders buttons in footer", () => {
    render(
      <Card>
        <CardFooter>
          <button>Cancel</button>
          <button>Save</button>
        </CardFooter>
      </Card>
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});

// ─── Card composition ────────────────────────────────────────────────────────

describe("Card composition", () => {
  it("renders a full card with header, content, and footer", () => {
    render(
      <Card>
        <CardHeader>Title</CardHeader>
        <CardContent>Description</CardContent>
        <CardFooter>Actions</CardFooter>
      </Card>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });
});
