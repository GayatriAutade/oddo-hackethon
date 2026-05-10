import { useState, useRef, useEffect } from "react";
import {
  useListGeminiConversations, useCreateGeminiConversation, useDeleteGeminiConversation,
  useListGeminiMessages,
  getListGeminiConversationsQueryKey, getListGeminiMessagesQueryKey,
  GeminiConversation,
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Plus, Send, Trash2, MessageSquare, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export default function AI() {
  const { data: conversations, isLoading: loadingConvs } = useListGeminiConversations();
  const createConv = useCreateGeminiConversation();
  const deleteConv = useDeleteGeminiConversation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const { data: serverMessages, isLoading: loadingMessages } = useListGeminiMessages(
    activeConvId ?? 0,
    { query: { queryKey: getListGeminiMessagesQueryKey(activeConvId ?? 0), enabled: !!activeConvId } }
  );

  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages: Message[] = activeConvId
    ? (serverMessages?.map((m) => ({ role: m.role as "user" | "assistant", content: m.content ?? "" })) ?? [])
    : localMessages;

  const displayMessages = streaming
    ? [...(serverMessages?.map((m) => ({ role: m.role as "user" | "assistant", content: m.content ?? "" })) ?? []), ...localMessages]
    : messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  useEffect(() => {
    setLocalMessages([]);
  }, [activeConvId]);

  const handleNewConversation = async () => {
    const conv = await createConv.mutateAsync({ data: { title: "New Chat" } });
    queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
    setActiveConvId(conv.id);
  };

  const handleDeleteConv = async (conv: GeminiConversation) => {
    await deleteConv.mutateAsync({ id: conv.id });
    queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
    if (activeConvId === conv.id) setActiveConvId(null);
  };

  const handleSend = async () => {
    if (!input.trim() || streaming || !activeConvId) return;
    const userMsg = input.trim();
    setInput("");
    setLocalMessages([{ role: "user", content: userMsg, streaming: false }]);
    setStreaming(true);

    try {
      const token = localStorage.getItem("traveloop_token");
      const response = await fetch(`/api/gemini/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: userMsg }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      setLocalMessages([
        { role: "user", content: userMsg },
        { role: "assistant", content: "", streaming: true },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                assistantContent += data.content;
                setLocalMessages([
                  { role: "user", content: userMsg },
                  { role: "assistant", content: assistantContent, streaming: true },
                ]);
              }
              if (data.done) break;
              if (data.error) throw new Error(data.error);
            } catch {}
          }
        }
      }

      setLocalMessages([]);
      queryClient.invalidateQueries({ queryKey: getListGeminiMessagesQueryKey(activeConvId) });
    } catch {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
      setLocalMessages([]);
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-3">
          <Button className="gap-2 w-full" onClick={handleNewConversation} disabled={createConv.isPending}>
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          <div className="flex-1 overflow-y-auto space-y-1">
            {loadingConvs ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : conversations?.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground px-2">
                Start a new chat to plan your trip with AI
              </div>
            ) : (
              conversations?.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors ${
                    activeConvId === conv.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setActiveConvId(conv.id)}
                >
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{conv.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${
                      activeConvId === conv.id ? "hover:bg-primary-foreground/20 text-primary-foreground" : "hover:bg-destructive/10 text-destructive"
                    }`}
                    onClick={(e) => { e.stopPropagation(); handleDeleteConv(conv); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {!activeConvId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold font-sans mb-2">AI Travel Assistant</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Your personal travel planning expert. Ask me about destinations, itineraries, budgets, visa requirements, local tips, and more.
              </p>
              <Button onClick={handleNewConversation} disabled={createConv.isPending} className="gap-2">
                <Plus className="h-4 w-4" />
                Start a new chat
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
                      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                      <Skeleton className={`h-16 ${i % 2 === 0 ? "w-64" : "w-48"} rounded-xl`} />
                    </div>
                  ))
                ) : displayMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Bot className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground">Ask me anything about your travels!</p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {[
                        "Best time to visit Japan?",
                        "Budget Europe trip for 2 weeks",
                        "Hidden gems in Southeast Asia",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          className="text-sm border rounded-full px-4 py-1.5 hover:bg-muted transition-colors"
                          onClick={() => setInput(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  displayMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {"streaming" in msg && (msg as Message).streaming && (
                          <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1 rounded-sm" />
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about destinations, itineraries, budgets..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={streaming}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={!input.trim() || streaming} className="gap-2 px-4">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Powered by Gemini AI — Press Enter to send
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
