import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PropertyCard } from "./property-card";
import { api } from "@/lib/api";
vi.mock("@/lib/api", () => ({
  api: { post: vi.fn(), delete: vi.fn() },
  imageUrl: () => "/stay.jpg",
  money: () => "$100.00",
}));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));
const property: any = {
  id: 1,
  name: "Ocean Villa",
  city: "Galle",
  country: "LK",
  rating: "4.9",
  base_price: 10000,
  bedrooms: 2,
  max_guests: 4,
  images: [],
};
describe("PropertyCard", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });
  it("persists a favourite for an authenticated customer", async () => {
    localStorage.setItem("staynest_token", "token");
    vi.mocked(api.post).mockResolvedValue({} as any);
    render(<PropertyCard property={property} />);
    await userEvent.click(
      screen.getByRole("button", { name: /save property/i }),
    );
    expect(api.post).toHaveBeenCalledWith("/favourites/1");
  });
  it("links to the real property detail", () => {
    render(<PropertyCard property={property} />);
    expect(screen.getByRole("link", { name: /view stay/i })).toHaveAttribute(
      "href",
      "/properties/1",
    );
  });
});
