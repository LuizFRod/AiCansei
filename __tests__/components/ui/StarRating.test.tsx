import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarRating } from "@/components/ui/StarRating";

describe("StarRating", () => {
  it("renders 5 stars by default", () => {
    render(<StarRating value={0} />);
    // The container should have the stars
    const container = screen.getByRole("img");
    const stars = container.querySelectorAll("svg");
    expect(stars.length).toBe(5);
  });

  it("renders custom maxStars count", () => {
    render(<StarRating value={0} maxStars={10} />);
    const container = screen.getByRole("img");
    const stars = container.querySelectorAll("svg");
    // Each full/half star renders 1 svg, empty star renders 1 svg
    // With value 0, all 10 stars are empty = 10 svgs
    expect(stars.length).toBe(10);
  });

  it("has correct aria-label", () => {
    render(<StarRating value={3} />);
    const container = screen.getByRole("img");
    expect(container).toHaveAttribute("aria-label", "3 de 5 estrelas");
  });

  it("has radiogroup role when interactive", () => {
    render(<StarRating value={3} interactive onChange={jest.fn()} />);
    const container = screen.getByRole("radiogroup");
    expect(container).toBeInTheDocument();
  });

  it("has img role when not interactive", () => {
    render(<StarRating value={3} />);
    const container = screen.getByRole("img");
    expect(container).toBeInTheDocument();
  });

  it("applies sm size classes", () => {
    render(<StarRating value={3} size="sm" />);
    const container = screen.getByRole("img");
    expect(container.className).toContain("inline-flex");
  });

  it("applies lg size classes", () => {
    render(<StarRating value={3} size="lg" />);
    const container = screen.getByRole("img");
    expect(container.className).toContain("inline-flex");
  });

  it("applies custom className", () => {
    render(<StarRating value={3} className="custom-stars" />);
    const container = screen.getByRole("img");
    expect(container.className).toContain("custom-stars");
  });

  it("applies cursor-pointer class when interactive", () => {
    render(<StarRating value={3} interactive onChange={jest.fn()} />);
    const container = screen.getByRole("radiogroup");
    expect(container.className).toContain("cursor-pointer");
  });

  it("does not apply cursor-pointer class when not interactive", () => {
    render(<StarRating value={3} />);
    const container = screen.getByRole("img");
    expect(container.className).not.toContain("cursor-pointer");
  });

  // ─── Click interaction ───────────────────────────────────────────────────

  it("calls onChange when a star is clicked in interactive mode", () => {
    const onChange = jest.fn();
    render(<StarRating value={0} interactive onChange={onChange} />);

    const container = screen.getByRole("radiogroup");
    const starSpans = container.querySelectorAll("span.inline-flex");

    // Click the 3rd star (index 2)
    fireEvent.click(starSpans[2]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("does not call onChange when clicked in non-interactive mode", () => {
    const onChange = jest.fn();
    render(<StarRating value={3} onChange={onChange} />);

    const container = screen.getByRole("img");
    const starSpans = container.querySelectorAll("span.inline-flex");

    fireEvent.click(starSpans[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("calls onChange with correct index for each star", () => {
    const onChange = jest.fn();
    render(<StarRating value={0} interactive onChange={onChange} />);

    const container = screen.getByRole("radiogroup");
    const starSpans = container.querySelectorAll("span.inline-flex");

    fireEvent.click(starSpans[0]);
    expect(onChange).toHaveBeenCalledWith(1);

    fireEvent.click(starSpans[4]);
    expect(onChange).toHaveBeenCalledWith(5);
  });

  // ─── Visual state ────────────────────────────────────────────────────────

  it("renders correct number of filled stars for value 3", () => {
    render(<StarRating value={3} />);
    const container = screen.getByRole("img");
    const allSvgs = container.querySelectorAll("svg");

    // With value 3: 3 filled stars (fill=currentColor) + 2 empty (fill=none)
    const filledStars = Array.from(allSvgs).filter(
      (svg) => svg.getAttribute("fill") === "currentColor"
    );
    const emptyStars = Array.from(allSvgs).filter(
      (svg) => svg.getAttribute("fill") === "none"
    );

    expect(filledStars.length).toBe(3);
    expect(emptyStars.length).toBe(2);
  });

  it("renders all empty stars for value 0", () => {
    render(<StarRating value={0} />);
    const container = screen.getByRole("img");
    const allSvgs = container.querySelectorAll("svg");

    const emptyStars = Array.from(allSvgs).filter(
      (svg) => svg.getAttribute("fill") === "none"
    );
    expect(emptyStars.length).toBe(5);
  });

  it("renders all filled stars for value 5", () => {
    render(<StarRating value={5} />);
    const container = screen.getByRole("img");
    const allSvgs = container.querySelectorAll("svg");

    const filledStars = Array.from(allSvgs).filter(
      (svg) => svg.getAttribute("fill") === "currentColor"
    );
    expect(filledStars.length).toBe(5);
  });

  it("renders correctly for value 4", () => {
    render(<StarRating value={4} />);
    const container = screen.getByRole("img");
    const allSvgs = container.querySelectorAll("svg");

    const filledStars = Array.from(allSvgs).filter(
      (svg) => svg.getAttribute("fill") === "currentColor"
    );
    expect(filledStars.length).toBe(4);
  });

  it("renders correctly for value 1", () => {
    render(<StarRating value={1} />);
    const container = screen.getByRole("img");
    const allSvgs = container.querySelectorAll("svg");

    const filledStars = Array.from(allSvgs).filter(
      (svg) => svg.getAttribute("fill") === "currentColor"
    );
    expect(filledStars.length).toBe(1);
  });
});
