import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthForm } from "./auth-form";
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/api", () => ({
  api: { post: vi.fn() },
  cn: (...values: string[]) => values.filter(Boolean).join(" "),
}));
describe("AuthForm", () => {
  it("shows meaningful login validation errors", async () => {
    render(<AuthForm mode="login" />);
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(screen.getByText(/>=8 characters/i)).toBeInTheDocument();
  });
  it("requires matching passwords on registration", async () => {
    render(<AuthForm mode="register" />);
    const inputs = screen.getAllByLabelText(/password/i, { selector: "input" });
    await userEvent.type(inputs[0], "SecurePass1");
    await userEvent.type(inputs[1], "Different1");
    await userEvent.click(
      screen.getByRole("button", { name: /create account/i }),
    );
    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument();
  });
});
