import React from "react";
import { render, screen } from "@testing-library/react";
import { Button, ButtonLink } from "@/components/ui/Button";

// Mock next/link since jsdom doesn't support it
jest.mock("next/link", () => {
  const React = require("react");
  return React.forwardRef(function MockLink(
    { href, children, className, ...props }: { href: string; children: React.ReactNode; className?: string },
    ref: React.Ref<HTMLAnchorElement>
  ) {
    return (
      <a ref={ref} href={href} className={className} {...props}>
        {children}
      </a>
    );
  });
});

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders with primary variant by default", () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-emerald-600");
  });

  it("renders with secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-gray-100");
  });

  it("renders with danger variant", () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-red-600");
  });

  it("renders with ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-transparent");
  });

  it("renders with md size by default", () => {
    render(<Button>Medium</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("px-4");
    expect(button.className).toContain("py-2");
  });

  it("renders with sm size", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("px-3");
    expect(button.className).toContain("py-1.5");
  });

  it("renders with lg size", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("px-6");
    expect(button.className).toContain("py-3");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("is disabled when loading is true", () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("shows spinner when loading", () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole("button");
    // The spinner is an SVG with animate-spin class
    const spinner = button.querySelector("svg.animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("does not show spinner when not loading", () => {
    render(<Button>Not loading</Button>);
    const button = screen.getByRole("button");
    const spinner = button.querySelector("svg.animate-spin");
    expect(spinner).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("custom-class");
  });

  it("passes through additional HTML attributes", () => {
    render(<Button data-testid="test-btn" type="submit">Submit</Button>);
    const button = screen.getByTestId("test-btn");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("applies base styling classes", () => {
    render(<Button>Base</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("rounded-lg");
    expect(button.className).toContain("font-medium");
    expect(button.className).toContain("transition-colors");
  });

  it("applies focus-visible styling", () => {
    render(<Button>Focus</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("focus-visible:ring-2");
  });

  it("applies disabled styling when disabled", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("disabled:pointer-events-none");
    expect(button.className).toContain("disabled:opacity-50");
  });

  it("can be clicked when enabled", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    const button = screen.getByRole("button");
    button.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("cannot be clicked when disabled", () => {
    const onClick = jest.fn();
    render(<Button disabled onClick={onClick}>No click</Button>);
    const button = screen.getByRole("button");
    button.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("cannot be clicked when loading", () => {
    const onClick = jest.fn();
    render(<Button loading onClick={onClick}>No click</Button>);
    const button = screen.getByRole("button");
    button.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("has displayName set to 'Button'", () => {
    expect(Button.displayName).toBe("Button");
  });
});

// ─── ButtonLink ──────────────────────────────────────────────────────────────

describe("ButtonLink", () => {
  it("renders as a link element", () => {
    render(<ButtonLink href="/about">About</ButtonLink>);
    const link = screen.getByRole("link", { name: "About" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/about");
  });

  it("applies primary variant styles by default", () => {
    render(<ButtonLink href="/home">Home</ButtonLink>);
    const link = screen.getByRole("link");
    expect(link.className).toContain("bg-emerald-600");
  });

  it("applies secondary variant styles", () => {
    render(<ButtonLink href="/home" variant="secondary">Home</ButtonLink>);
    const link = screen.getByRole("link");
    expect(link.className).toContain("bg-gray-100");
  });

  it("applies danger variant styles", () => {
    render(<ButtonLink href="/home" variant="danger">Home</ButtonLink>);
    const link = screen.getByRole("link");
    expect(link.className).toContain("bg-red-600");
  });

  it("applies ghost variant styles", () => {
    render(<ButtonLink href="/home" variant="ghost">Home</ButtonLink>);
    const link = screen.getByRole("link");
    expect(link.className).toContain("bg-transparent");
  });

  it("applies sm size", () => {
    render(<ButtonLink href="/home" size="sm">Home</ButtonLink>);
    const link = screen.getByRole("link");
    expect(link.className).toContain("px-3");
  });

  it("applies lg size", () => {
    render(<ButtonLink href="/home" size="lg">Home</ButtonLink>);
    const link = screen.getByRole("link");
    expect(link.className).toContain("px-6");
  });

  it("shows spinner when loading", () => {
    render(<ButtonLink href="/home" loading>Loading Link</ButtonLink>);
    const link = screen.getByRole("link");
    const spinner = link.querySelector("svg.animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<ButtonLink href="/home" className="my-class">Link</ButtonLink>);
    const link = screen.getByRole("link");
    expect(link.className).toContain("my-class");
  });
});
