"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface AuditorMessage {
  id: string;
  facultyId: string;
  auditorId?: string;
  entityType: "course-file" | "event-report" | string;
  entityId: string;
  threadId?: string;
  senderRole?: "auditor" | "faculty" | string;
  senderName?: string;
  message: string;
  status?: string;
  createdAt?: string;
}

interface EntityMessagesPanelProps {
  facultyId?: string;
  entityType: "course-file" | "event-report";
  entityId: string;
  itemType: "file" | "report";
}

interface MessageReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (message: string) => Promise<boolean>;
  itemType: "file" | "report";
}

const resolveThreadId = (message: AuditorMessage) =>
  message.threadId ?? `${message.entityType}:${message.entityId}`;

function MessageReplyDialog({
  open,
  onOpenChange,
  onSubmit,
  itemType,
}: MessageReplyDialogProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setMessage("");
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    setIsSubmitting(true);
    const sent = await onSubmit(trimmedMessage);
    if (sent) {
      setMessage("");
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reply to Auditor</DialogTitle>
          <DialogDescription>
            Send your clarification or follow-up for this {itemType}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="auditor-reply">Your Reply</Label>
            <Textarea
              id="auditor-reply"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Enter your reply to the auditor..."
              rows={6}
              required
              className="mt-2"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Sending..." : "Send Reply"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EntityMessagesPanel({
  facultyId,
  entityType,
  entityId,
  itemType,
}: EntityMessagesPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AuditorMessage[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const loadMessages = async () => {
    if (!facultyId) {
      setMessages([]);
      setHasLoaded(true);
      return;
    }

    try {
      const searchParams = new URLSearchParams({
        facultyId,
        entityType,
        entityId,
      });
      const response = await fetch(`/api/messages?${searchParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setMessages([]);
        return;
      }

      setMessages(data.messages ?? []);
    } catch (error) {
      console.error("Load entity messages error:", error);
      setMessages([]);
    } finally {
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    void loadMessages();

    if (typeof window !== "undefined") {
      const handler = () => {
        void loadMessages();
      };
      window.addEventListener("dashboard:data-updated", handler);
      return () => {
        window.removeEventListener("dashboard:data-updated", handler);
      };
    }
  }, [facultyId, entityType, entityId]);

  const threads = useMemo(() => {
    const groupedThreads = messages.reduce<Record<string, AuditorMessage[]>>(
      (accumulator, message) => {
        const threadId = resolveThreadId(message);
        if (!accumulator[threadId]) {
          accumulator[threadId] = [];
        }
        accumulator[threadId].push({ ...message, threadId });
        return accumulator;
      },
      {},
    );

    return Object.entries(groupedThreads)
      .map(([threadId, threadMessages]) => {
        const sortedMessages = [...threadMessages].sort((a, b) => {
          const aTime = new Date(a.createdAt ?? 0).getTime();
          const bTime = new Date(b.createdAt ?? 0).getTime();
          return aTime - bTime;
        });
        const lastMessage = sortedMessages[sortedMessages.length - 1];

        return {
          threadId,
          messages: sortedMessages,
          lastMessage,
        };
      })
      .sort((a, b) => {
        const aTime = new Date(a.lastMessage?.createdAt ?? 0).getTime();
        const bTime = new Date(b.lastMessage?.createdAt ?? 0).getTime();
        return bTime - aTime;
      });
  }, [messages]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.threadId === activeThreadId) ?? null,
    [activeThreadId, threads],
  );

  const handleReplySubmit = async (message: string) => {
    if (!user?.id || !activeThread) {
      return false;
    }

    const threadContext =
      activeThread.lastMessage ??
      activeThread.messages[activeThread.messages.length - 1];

    if (!threadContext) {
      return false;
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facultyId: user.id,
          auditorId: threadContext.auditorId,
          entityType: threadContext.entityType,
          entityId: threadContext.entityId,
          threadId: activeThread.threadId,
          senderRole: "faculty",
          senderName: user.name ?? user.username ?? "Faculty",
          message,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to send reply");
        return false;
      }

      toast.success("Reply sent");
      setActiveThreadId(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("dashboard:data-updated"));
      }
      return true;
    } catch (error) {
      console.error("Faculty message reply error:", error);
      toast.error("Failed to send reply");
      return false;
    }
  };

  if (!facultyId || !hasLoaded || threads.length === 0) {
    return null;
  }

  return (
    <section className="border-t pt-5 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
          Auditor Messages
        </h4>
        <Badge variant="outline" className="text-xs">
          {threads.length} thread{threads.length !== 1 ? "s" : ""}
        </Badge>
      </div>
      <div className="space-y-4">
        {threads.map((thread, index) => (
          <div
            key={thread.threadId}
            className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden"
          >
            {/* Thread header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Conversation {index + 1}
                </span>
                {thread.lastMessage?.senderRole === "auditor" && (
                  <Badge className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5">
                    NEW
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {thread.lastMessage?.status && (
                  <Badge variant="secondary" className="text-xs">
                    {thread.lastMessage.status}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-3"
                  onClick={() => {
                    setActiveThreadId(thread.threadId);
                    setIsReplyOpen(true);
                  }}
                >
                  Reply
                </Button>
              </div>
            </div>
            {/* Chat bubbles */}
            <div className="px-4 py-3 space-y-3 max-h-72 overflow-y-auto pr-1">
              {thread.messages.map((message) => {
                const isAuditor = message.senderRole === "auditor";
                return (
                  <div
                    key={message.id}
                    className={`flex flex-col ${isAuditor ? "items-start" : "items-end"}`}
                  >
                    <span className="text-[10px] text-gray-400 mb-1 px-1">
                      {message.senderName || (isAuditor ? "Auditor" : "You")}
                    </span>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        isAuditor
                          ? "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                          : "bg-blue-600 text-white rounded-tr-sm"
                      }`}
                    >
                      {message.message}
                    </div>
                    {message.createdAt && (
                      <span className="text-[10px] text-gray-400 mt-1 px-1">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <MessageReplyDialog
        open={isReplyOpen}
        onOpenChange={(open) => {
          setIsReplyOpen(open);
          if (!open) {
            setActiveThreadId(null);
          }
        }}
        onSubmit={handleReplySubmit}
        itemType={itemType}
      />
    </section>
  );
}
