import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Loader2,
  Sparkles
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const CYAN = "#21d8ff";
const YELLOW = "#D4FF1F";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm the Revive Research assistant. How can I help you today? I can answer questions about our products, shipping, orders, or COA verification."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Only auto-focus on desktop - on mobile, triggering the keyboard immediately
    // pushes content up and hides the greeting message
    const isMobile = window.matchMedia("(max-width: 768px)").matches || 
                     ('ontouchstart' in window);
    if (isOpen && inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Listen for global open chatbot event
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openChatbot', handleOpenChat);
    return () => window.removeEventListener('openChatbot', handleOpenChat);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await apiRequest("POST", "/api/chat", { messages: chatMessages });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-44 md:bottom-24 right-3 md:right-6 z-50 w-[90%] sm:w-[380px] md:w-[400px] max-w-[400px]"
          >
            <Card 
              className="border-2 overflow-hidden"
              style={{ 
                borderColor: `${CYAN}80`,
                boxShadow: `0 0 30px ${CYAN}4D`
              }}
            >
              <div 
                className="border-b border-border p-4 flex items-center justify-between"
                style={{ 
                  background: `linear-gradient(to right, ${CYAN}33, ${YELLOW}1A)`
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: `${CYAN}33`,
                      border: `1px solid ${CYAN}80`
                    }}
                  >
                    <Bot className="h-5 w-5" style={{ color: CYAN }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">Revive Assistant</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                  </div>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                  data-testid="button-close-chat"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-[350px] p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ 
                            backgroundColor: `${CYAN}33`,
                            border: `1px solid ${CYAN}80`
                          }}
                        >
                          <Sparkles className="h-4 w-4" style={{ color: CYAN }} />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          message.role === "user"
                            ? "rounded-br-sm"
                            : "bg-muted rounded-bl-sm"
                        }`}
                        style={message.role === "user" ? { 
                          backgroundColor: YELLOW,
                          color: "#000000"
                        } : undefined}
                        data-testid={`message-${message.role}-${index}`}
                      >
                        {message.content}
                      </div>
                      {message.role === "user" && (
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ 
                            backgroundColor: `${YELLOW}33`,
                            border: `1px solid ${YELLOW}80`
                          }}
                        >
                          <User className="h-4 w-4" style={{ color: YELLOW }} />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 justify-start"
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ 
                          backgroundColor: `${CYAN}33`,
                          border: `1px solid ${CYAN}80`
                        }}
                      >
                        <Sparkles className="h-4 w-4" style={{ color: CYAN }} />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: CYAN, animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: CYAN, animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: CYAN, animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border bg-card">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                    data-testid="input-chat-message"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    style={{ backgroundColor: YELLOW, color: "#000000" }}
                    data-testid="button-send-message"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  Powered by AI • For research inquiries only
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        className="fixed bottom-44 md:bottom-4 right-3 md:right-6 z-50"
        data-testid="chatbot-toggle-wrapper"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-lg transition-all duration-300"
          style={isOpen ? undefined : { 
            backgroundColor: CYAN,
            boxShadow: `0 0 20px ${CYAN}80`
          }}
          data-testid="button-toggle-chat"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-6 w-6" style={{ color: "#000000" }} />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2 }}
            className="absolute -top-2 -right-1"
          >
            <span className="flex h-4 w-4">
              <span 
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" 
                style={{ backgroundColor: YELLOW }}
              />
              <span 
                className="relative inline-flex rounded-full h-4 w-4" 
                style={{ backgroundColor: YELLOW }}
              />
            </span>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
