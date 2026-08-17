import Echo from "laravel-echo";
import Pusher from "pusher-js";
let echo: Echo<"reverb"> | null = null;
export function getEcho() {
  if (typeof window === "undefined") return null;
  if (echo) return echo;
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
  echo = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? "staynest",
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? location.hostname,
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 443),
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http") === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("staynest_token")}`,
      },
    },
  });
  return echo;
}
