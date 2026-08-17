import { api } from "@/lib/api";
import type { ApiResponse, Paginated, Property } from "@/types";
export const propertyService = {
  search: async (params: Record<string, string | number>) =>
    (await api.get<ApiResponse<Paginated<Property>>>("/properties", { params }))
      .data.data,
  show: async (id: number) =>
    (await api.get<ApiResponse<Property>>(`/properties/${id}`)).data.data,
};
export const bookingService = {
  quote: async (input: {
    property_id: number;
    check_in: string;
    check_out: string;
  }) => (await api.post("/bookings/quote", input)).data.data,
  cancel: async (id: number) =>
    (await api.post(`/bookings/${id}/cancel`)).data.data,
};
