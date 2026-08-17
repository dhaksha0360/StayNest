import type { User } from "@/types";

export function persistSession(token: string, user: User) {
  localStorage.setItem("staynest_token", token);
  localStorage.setItem("staynest_user", JSON.stringify(user));
  document.cookie = "staynest_session=1; path=/; max-age=604800; samesite=lax";
  document.cookie = `staynest_role=${user.role}; path=/; max-age=604800; samesite=lax`;
}
