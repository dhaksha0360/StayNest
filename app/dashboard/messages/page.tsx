"use client";
import { api, imageUrl } from "@/lib/api";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, Search, Send, X } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { getEcho } from "@/lib/echo";
import { Paperclip } from "lucide-react";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
export default function Messages() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<number | null>(null);
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [typing, setTyping] = useState(false);
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("staynest_user") || "{}")
      : {};
  const channelRef = useRef<any>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    data,
    isLoading: conversationsLoading,
    isError: conversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ["conversations", search],
    queryFn: async () =>
      (await api.get("/conversations", { params: { search } })).data.data,
  });
  const {
    data: messagePages,
    isLoading: messagesLoading,
    isError: messagesError,
    refetch: refetchMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["messages", selected],
    queryFn: async ({ pageParam }) =>
      (
        await api.get(`/conversations/${selected}/messages`, {
          params: { page: pageParam },
        })
      ).data.data,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined,
    enabled: !!selected,
  });
  const messages = messagePages?.pages.flatMap((page) => page.data) ?? [];
  const send = useMutation({
    mutationFn: () =>
      api.post(`/conversations/${selected}/messages`, {
        body: body.trim() || "Attachment",
      }),
    onSuccess: async (response) => {
      setBody("");
      if (file) {
        const data = new FormData();
        data.append("file", file);
        try {
          await api.post(
            `/messages/${response.data.data.id}/attachments`,
            data,
          );
        } catch {
          toast.error("Message sent, but the attachment could not be uploaded");
        }
        setFile(null);
      }
      qc.invalidateQueries({ queryKey: ["messages", selected] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message ?? "Message could not be sent"),
  });
  useEffect(() => {
    if (!selected) return;
    const echo = getEcho();
    const channel = echo?.private(`conversation.${selected}`);
    channelRef.current = channel;
    channel?.listen(".message.sent", () =>
      qc.invalidateQueries({ queryKey: ["messages", selected] }),
    );
    channel?.listenForWhisper("typing", () => {
      setTyping(true);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(false), 1500);
    });
    return () => {
      echo?.leave(`conversation.${selected}`);
    };
  }, [selected, qc]);
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="grid h-[calc(100vh-9rem)] min-h-[580px] md:grid-cols-[320px_1fr] xl:grid-cols-[350px_1fr]">
        <aside className={cn("border-r", selected && "hidden md:block")}>
          <div className="border-b p-5">
            <h1 className="text-xl font-semibold tracking-tight">Messages</h1>
            <div className="relative mt-4">
              <Search
                size={15}
                className="absolute left-3 top-3 text-muted-foreground"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations"
                className="h-10 w-full rounded-lg border bg-muted/40 pl-9 pr-3 text-sm"
              />
            </div>
          </div>
          {conversationsLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : conversationsError ? (
            <div className="p-5 text-center text-sm text-muted-foreground">
              <p>Conversations could not be loaded.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => refetchConversations()}
              >
                Retry
              </Button>
            </div>
          ) : data?.data?.length ? (
            data.data.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={cn(
                  "flex w-full gap-3 border-b p-4 text-left hover:bg-muted/50",
                  selected === c.id && "bg-secondary/50",
                )}
              >
                <Avatar name={c.subject} className="size-10" />
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between gap-2">
                    <b className="truncate text-sm font-semibold">
                      {c.subject}
                    </b>
                    <small className="shrink-0 text-[10px] text-muted-foreground">
                      {c.last_message_at?.slice(5, 10)}
                    </small>
                  </span>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {c.messages?.[0]?.body}
                  </p>
                </span>
                {c.unread_count > 0 && (
                  <Badge variant="info" className="self-center">
                    {c.unread_count}
                  </Badge>
                )}
              </button>
            ))
          ) : (
            <div className="p-5 text-center text-sm text-muted-foreground">
              {search
                ? "No conversations match your search."
                : "No conversations yet."}
            </div>
          )}
        </aside>
        <section
          className={cn("flex min-w-0 flex-col", !selected && "hidden md:flex")}
        >
          {selected ? (
            <>
              <header className="flex items-center gap-3 border-b px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelected(null)}
                >
                  <ArrowLeft size={18} />
                </Button>
                <Avatar
                  name={
                    data?.data?.find((x: any) => x.id === selected)?.subject ??
                    "Conversation"
                  }
                />{" "}
                <span>
                  <b className="block text-sm font-semibold">
                    {data?.data?.find((x: any) => x.id === selected)?.subject}
                  </b>
                  <p className="text-xs text-muted-foreground">
                    Private StayNest conversation
                  </p>
                </span>
              </header>
              <div className="flex-1 space-y-4 overflow-y-auto bg-muted/30 p-4 sm:p-6">
                {hasNextPage && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isFetchingNextPage}
                      onClick={() => fetchNextPage()}
                    >
                      {isFetchingNextPage ? "Loading…" : "Load older messages"}
                    </Button>
                  </div>
                )}
                {messagesLoading && (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-2/3" />
                    <Skeleton className="ml-auto h-16 w-2/3" />
                    <Skeleton className="h-16 w-1/2" />
                  </div>
                )}
                {messagesError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center text-sm">
                    <p>Messages could not be loaded.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => refetchMessages()}
                    >
                      Retry
                    </Button>
                  </div>
                )}
                {messages
                  .slice()
                  .reverse()
                  .map((m: any) => (
                    <div
                      key={m.id}
                      className={cn(
                        "max-w-[82%] rounded-xl px-4 py-3 text-sm shadow-xs sm:max-w-[70%]",
                        m.sender.id === user.id
                          ? "ml-auto rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm border bg-card",
                      )}
                    >
                      {m.sender.id !== user.id && (
                        <b className="text-xs text-secondary-foreground">
                          {m.sender.name}
                        </b>
                      )}
                      <p className="mt-0.5">{m.body}</p>
                      {m.attachments?.map((a: any) =>
                        a.mime_type.startsWith("image/") ? (
                          <a key={a.id} href={imageUrl(a.path)} target="_blank">
                            <Image
                              src={imageUrl(a.path)}
                              width={300}
                              height={192}
                              alt={a.original_name}
                              className="mt-3 max-h-48 rounded-xl object-cover"
                            />
                          </a>
                        ) : (
                          <a
                            key={a.id}
                            href={imageUrl(a.path)}
                            target="_blank"
                            className="mt-3 block font-bold text-teal-700"
                          >
                            📎 {a.original_name}
                          </a>
                        ),
                      )}
                      <small
                        className={cn(
                          "mt-1 block text-[10px]",
                          m.sender.id === user.id
                            ? "text-slate-300"
                            : "text-muted-foreground",
                        )}
                      >
                        {m.created_at?.slice(0, 16).replace("T", " ")}
                      </small>
                    </div>
                  ))}
              </div>
              {typing && (
                <p className="bg-muted/30 px-5 pb-2 text-xs font-medium text-secondary-foreground">
                  Someone is typing…
                </p>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (body.trim() || file) send.mutate();
                }}
                className="flex items-end gap-2 border-t bg-card p-3 sm:p-4"
              >
                <label className="grid size-10 shrink-0 place-items-center rounded-lg border text-muted-foreground hover:bg-muted">
                  <Paperclip size={18} />
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
                <input
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    channelRef.current?.whisper("typing", { typing: true });
                  }}
                  placeholder={
                    file ? `Attached: ${file.name}` : "Write a message…"
                  }
                  className="min-h-10 flex-1 rounded-lg border bg-muted/30 px-4 text-sm"
                />
                {file && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="grid size-9 shrink-0 place-items-center rounded-lg border text-muted-foreground hover:bg-muted"
                    aria-label="Remove attachment"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  disabled={send.isPending || (!body.trim() && !file)}
                  className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a guest or property conversation to see its messages."
            />
          )}
        </section>
      </div>
    </div>
  );
}
