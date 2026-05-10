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
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Plus, Send, Trash2, MessageSquare, Bot, User, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

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
    try {
      const conv = await createConv.mutateAsync({ data: { title: "NEW DIRECTIVE" } });
      queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
      setActiveConvId(conv.id);
    } catch {
      toast({ title: "[ERR]", description: "Failed to initialize connection", variant: "destructive" });
    }
  };

  const handleDeleteConv = async (conv: GeminiConversation) => {
    if (!confirm("[WARNING] Purge conversation history?")) return;
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

      if (!response.ok) throw new Error("Transmission failed");

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
      toast({ title: "[ERR]", description: "Transmission interrupted", variant: "destructive" });
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
      <div className="flex h-[calc(100vh)] lg:h-[calc(100vh-2rem)] pt-6 lg:p-6 max-w-7xl mx-auto gap-6 overflow-hidden pb-safe lg:pb-0">
        
        {/* Sidebar - Channels */}
        <div className="w-80 hidden md:flex flex-shrink-0 flex-col gap-4">
          <div className="border-b border-white/10 pb-4">
            <h1 className="text-3xl font-serif font-bold text-foreground uppercase tracking-tight">Mainframe <span className="text-primary">Uplink</span></h1>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Secure communication channel</p>
          </div>
          
          <Button 
            className="w-full rounded-none font-mono uppercase tracking-widest bg-primary/10 hover:bg-primary border border-primary/50 text-primary hover:text-primary-foreground transition-all h-12 gap-3" 
            onClick={handleNewConversation} 
            disabled={createConv.isPending}
          >
            {createConv.isPending ? "CONNECTING..." : <><Plus className="h-4 w-4" /> Open Channel</>}
          </Button>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4 mt-2">Active Channels</p>
            {loadingConvs ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full bg-white/5 rounded-none" />)
            ) : conversations?.length === 0 ? (
              <div className="text-center py-8 border border-white/5 bg-white/5 font-mono text-xs text-muted-foreground uppercase">
                No active links
              </div>
            ) : (
              conversations?.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer group transition-all border ${
                    activeConvId === conv.id
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-background/50 border-white/5 hover:border-white/20 text-foreground"
                  }`}
                  onClick={() => setActiveConvId(conv.id)}
                >
                  <Terminal className={`h-4 w-4 flex-shrink-0 ${activeConvId === conv.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-mono text-xs uppercase tracking-wide truncate flex-1">{conv.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-destructive hover:bg-destructive/20 hover:text-destructive rounded-none"
                    onClick={(e) => { e.stopPropagation(); handleDeleteConv(conv); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Terminal Area */}
        <Card className="flex-1 flex flex-col overflow-hidden glass-panel border-white/10 rounded-none relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none" />
          
          {!activeConvId ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10">
              <div className="absolute inset-0 pattern-grid-lg opacity-[0.03] pointer-events-none" />
              <div className="w-24 h-24 border border-primary/30 bg-primary/5 flex items-center justify-center mb-8 relative">
                <Sparkles className="h-10 w-10 text-primary" />
                <div className="absolute inset-0 border border-primary animate-ping opacity-20" />
              </div>
              <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-foreground mb-4">Awaiting Connection</h2>
              <p className="font-mono text-sm text-muted-foreground max-w-md mb-8 leading-relaxed uppercase tracking-wider">
                Establish a secure uplink to query the global intelligence database for destination analytics, operational routes, and field logistics.
              </p>
              <Button 
                onClick={handleNewConversation} 
                disabled={createConv.isPending} 
                className="rounded-none font-mono uppercase tracking-widest bg-primary text-primary-foreground border border-primary shadow-[0_0_15px_rgba(0,212,232,0.3)] hover:shadow-[0_0_25px_rgba(0,212,232,0.5)] transition-all h-14 px-8 gap-3"
              >
                {createConv.isPending ? "INITIALIZING..." : "Initialize Uplink"}
              </Button>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col h-full relative z-10">
              {/* Header Mobile */}
              <div className="md:hidden border-b border-white/10 p-4 bg-background/80 backdrop-blur-md flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-primary tracking-widest">Channel Active</span>
                <Button variant="outline" size="sm" className="rounded-none h-8 text-[10px] font-mono border-white/20" onClick={() => setActiveConvId(null)}>Close</Button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
                {loadingMessages ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`flex gap-4 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                      <Skeleton className="h-10 w-10 rounded-none bg-white/10 flex-shrink-0" />
                      <Skeleton className={`h-24 ${i % 2 === 0 ? "w-64" : "w-48"} rounded-none bg-white/5`} />
                    </div>
                  ))
                ) : displayMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Bot className="h-16 w-16 text-primary/20 mb-6" />
                    <p className="font-mono text-sm text-primary uppercase tracking-widest mb-8">Connection established. Ready for input.</p>
                    <div className="flex flex-col gap-3 w-full max-w-md">
                      {[
                        "Detail infiltration points for Tokyo, Japan.",
                        "Calculate budget parameters for 14 days in Europe.",
                        "Identify optimal extraction routes in Southeast Asia."
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          className="text-xs font-mono border border-white/10 bg-white/5 p-4 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all text-left uppercase tracking-wider"
                          onClick={() => setInput(suggestion)}
                        >
                          &gt; {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {displayMessages.map((msg, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i} 
                        className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center text-xs font-bold border ${
                          msg.role === "user" 
                            ? "bg-secondary/10 border-secondary/50 text-secondary" 
                            : "bg-primary/10 border-primary/50 text-primary"
                        }`}>
                          {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                        </div>
                        <div className={`max-w-[85%] md:max-w-[75%] p-5 border ${
                          msg.role === "user"
                            ? "bg-secondary/5 border-secondary/20 ml-12"
                            : "bg-background/80 border-white/10 mr-12 backdrop-blur-md"
                        }`}>
                          <div className="font-mono text-[10px] uppercase tracking-widest mb-3 pb-2 border-b border-white/5 flex items-center justify-between">
                            <span className={msg.role === "user" ? "text-secondary" : "text-primary"}>
                              {msg.role === "user" ? "OPERATIVE" : "MAINFRAME"}
                            </span>
                            <span className="text-muted-foreground opacity-50">SYS.TIME</span>
                          </div>
                          <div className="prose prose-invert max-w-none">
                            <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                              {msg.content}
                            </p>
                          </div>
                          {"streaming" in msg && (msg as Message).streaming && (
                            <span className="inline-block w-3 h-5 bg-primary animate-pulse ml-2 align-middle mt-2" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>

              {/* Input Area */}
              <div className="p-4 md:p-6 bg-background/80 backdrop-blur-xl border-t border-white/10">
                <div className="flex items-end gap-3 max-w-4xl mx-auto relative">
                  <div className="flex-1 bg-background/50 border border-primary/30 focus-within:border-primary focus-within:shadow-[0_0_15px_rgba(0,212,232,0.2)] transition-all flex items-center">
                    <span className="pl-4 font-mono text-primary font-bold select-none">&gt;</span>
                    <Input
                      placeholder="ENTER QUERY..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={streaming}
                      className="flex-1 h-14 bg-transparent border-0 font-mono text-sm uppercase focus-visible:ring-0 rounded-none rounded-l-none"
                      autoFocus
                    />
                  </div>
                  <Button 
                    onClick={handleSend} 
                    disabled={!input.trim() || streaming} 
                    className="h-14 px-6 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground border border-primary font-mono uppercase tracking-widest"
                  >
                    {streaming ? "TX..." : <><Send className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Transmit</span></>}
                  </Button>
                </div>
                <div className="max-w-4xl mx-auto mt-3 flex justify-between items-center px-1">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    Encryption Active. Press ENTER to transmit.
                  </p>
                  <p className="font-mono text-[10px] text-primary/50 uppercase tracking-widest hidden md:block">
                    POWERED BY GEMINI CORE
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
