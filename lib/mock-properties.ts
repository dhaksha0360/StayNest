import type { Paginated, Property } from "@/types";

const amenities = [
  { id: 1, name: "Wi-Fi" },
  { id: 2, name: "Air conditioning" },
  { id: 3, name: "Parking" },
  { id: 4, name: "Kitchen" },
  { id: 5, name: "Swimming pool" },
  { id: 6, name: "Workspace" },
];

const manager = {
  id: -1,
  name: "StayNest Demo Host",
  email: "demo@staynest.test",
  role: "manager" as const,
};

const makeProperty = (
  id: number,
  values: Partial<Property> & Pick<Property, "name" | "city" | "type" | "base_price">,
  image: string,
): Property => ({
  id,
  slug: values.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  description:
    "A thoughtfully designed StayNest retreat with comfortable living spaces, considered amenities, and attentive hosting. This demonstration listing lets you explore the complete browsing experience while the live property catalogue is unavailable.",
  address: "Central neighbourhood",
  country: "Sri Lanka",
  max_guests: 4,
  bedrooms: 2,
  beds: 2,
  bathrooms: "2",
  cleaning_fee: 3500,
  service_fee: 2200,
  tax_percentage: "8",
  minimum_nights: 2,
  maximum_nights: 21,
  check_in_time: "15:00",
  check_out_time: "11:00",
  cancellation_policy: "moderate",
  booking_type: "instant",
  rating: "4.8",
  review_count: 32,
  images: [
    { id: id * -10, path: image, alt_text: values.name, is_cover: true },
  ],
  amenities,
  manager,
  rules: [
    { id: id * -10 - 1, rule: "No smoking" },
    { id: id * -10 - 2, rule: "Quiet hours after 10 PM" },
  ],
  ...values,
});

export const mockProperties: Property[] = [
  makeProperty(-1001, { name: "Azure Coast Villa", city: "Galle", type: "villa", base_price: 28500, max_guests: 6, bedrooms: 3, beds: 4, rating: "4.9", review_count: 87 }, "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85"),
  makeProperty(-1002, { name: "The Cinnamon House", city: "Colombo", type: "house", base_price: 16500, max_guests: 4, rating: "4.7", review_count: 54 }, "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85"),
  makeProperty(-1003, { name: "Misty Hills Cottage", city: "Nuwara Eliya", type: "cottage", base_price: 14200, max_guests: 3, bedrooms: 1, beds: 2, bathrooms: "1", rating: "4.9", review_count: 41 }, "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1400&q=85"),
  makeProperty(-1004, { name: "Palm Garden Retreat", city: "Mirissa", type: "villa", base_price: 23800, max_guests: 5, bedrooms: 3, beds: 3, rating: "4.8", review_count: 69 }, "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1400&q=85"),
  makeProperty(-1005, { name: "Lakeview Design Loft", city: "Kandy", type: "apartment", base_price: 11800, max_guests: 2, bedrooms: 1, beds: 1, bathrooms: "1", rating: "4.6", review_count: 28 }, "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85"),
  makeProperty(-1006, { name: "Wild Coast Eco Lodge", city: "Yala", type: "lodge", base_price: 32500, max_guests: 4, bedrooms: 2, rating: "5.0", review_count: 36 }, "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=85"),
];

export const isMockProperty = (propertyOrId: Property | number | string) =>
  Number(typeof propertyOrId === "object" ? propertyOrId.id : propertyOrId) < 0;

export function findMockProperty(id: number | string) {
  return mockProperties.find((property) => property.id === Number(id));
}

export function getMockProperties(params = new URLSearchParams()): Paginated<Property> {
  const search = (params.get("search") ?? "").toLowerCase();
  const type = params.get("type");
  const guests = Number(params.get("guests") ?? 0);
  const bedrooms = Number(params.get("bedrooms") ?? 0);
  const minPrice = Number(params.get("min_price") ?? 0) * 100;
  const maxPrice = Number(params.get("max_price") ?? 0) * 100;
  const sort = params.get("sort");
  let data = mockProperties.filter((property) =>
    (!search || `${property.name} ${property.city} ${property.country}`.toLowerCase().includes(search)) &&
    (!type || property.type === type) &&
    (!guests || property.max_guests >= guests) &&
    (!bedrooms || property.bedrooms >= bedrooms) &&
    (!minPrice || property.base_price >= minPrice) &&
    (!maxPrice || property.base_price <= maxPrice),
  );
  if (sort === "price_asc") data = [...data].sort((a, b) => a.base_price - b.base_price);
  if (sort === "price_desc") data = [...data].sort((a, b) => b.base_price - a.base_price);
  if (sort === "rating") data = [...data].sort((a, b) => Number(b.rating) - Number(a.rating));
  return { data, current_page: 1, last_page: 1, total: data.length };
}
