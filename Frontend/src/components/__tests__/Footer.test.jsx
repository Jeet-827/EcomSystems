import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import Footer from "../Footer.jsx";

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Footer Component Unit Tests", () => {
  it("renders Brand info and categories", () => {
    renderWithRouter(<Footer />);

    expect(screen.getByText("Top Categories")).toBeInTheDocument();
    expect(screen.getByText("Quick Links")).toBeInTheDocument();
    expect(screen.getByText("Customer Care")).toBeInTheDocument();
    expect(screen.getByText("Smartphones & Tablets")).toBeInTheDocument();
    expect(screen.getAllByText(/TREO/i).length).toBeGreaterThan(0);
  });

  it("handles newsletter subscription correctly", async () => {
    renderWithRouter(<Footer />);

    const emailInput = screen.getByPlaceholderText(/your email address/i);
    const subscribeButton = screen.getByRole("button", { name: /subscribe/i });

    expect(emailInput).toBeInTheDocument();
    expect(subscribeButton).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: "testuser@example.com" } });
    fireEvent.click(subscribeButton);

    await waitFor(() => {
      expect(screen.getByText(/you are subscribed/i)).toBeInTheDocument();
    });
  });
});
