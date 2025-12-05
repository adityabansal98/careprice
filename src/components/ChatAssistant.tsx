"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! 👋 I'm CarePrice Assistant. I can help you understand healthcare pricing, navigate our tool, or answer questions about medical costs. What would you like to know?",
  timestamp: new Date(),
};

const SUGGESTED_QUESTIONS = [
  "How do I find the best price?",
  "What is a CPT code?",
  "How does insurance affect pricing?",
  "What is financial assistance?",
];

// Simple response matching for demo purposes
function getAssistantResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();

  if (message.includes("best price") || message.includes("cheapest") || message.includes("lowest")) {
    return "To find the best price:\n\n1. **Search** for your procedure (e.g., 'MRI')\n2. **Enter your ZIP code** to see nearby hospitals\n3. **Select your insurance** for personalized rates\n4. **Sort by 'Lowest Price'** to see the most affordable options first\n\n💡 Tip: Community hospitals often have lower prices AND more generous financial assistance programs!";
  }

  if (message.includes("cpt") || message.includes("code")) {
    return "A **CPT code** (Current Procedural Terminology) is a 5-digit number that identifies a specific medical procedure.\n\nExamples:\n• **72148** - MRI Lumbar Spine\n• **71046** - Chest X-Ray\n• **85025** - Complete Blood Count\n\nYou can search by either the procedure name OR the CPT code in our search bar!";
  }

  if (message.includes("insurance") || message.includes("plan") || message.includes("ppo") || message.includes("hmo")) {
    return "Insurance significantly affects your healthcare costs:\n\n• **Cash Price**: What you pay without insurance (often negotiable!)\n• **Insurance Rate**: Pre-negotiated rates between your insurer and hospital\n• **PPO Plans**: Usually higher premiums but more flexibility\n• **HMO Plans**: Lower costs but limited to network providers\n\n💡 Select your insurance provider and plan type in our search to see YOUR estimated costs!";
  }

  if (message.includes("financial") || message.includes("assistance") || message.includes("aid") || message.includes("help pay") || message.includes("afford")) {
    return "Many hospitals offer **financial assistance programs** for patients who qualify:\n\n✅ **Who qualifies?**\n• Uninsured or underinsured patients\n• Income below certain thresholds (often 200-400% of Federal Poverty Level)\n• Demonstrated financial hardship\n\n✅ **Discounts can be significant:**\n• Community hospitals: Up to 100% free care\n• Public hospitals: 50-75% discounts\n• Private hospitals: 20-40% discounts\n\nLook for the green 'You Qualify for Aid!' badge on hospital cards!";
  }

  if (message.includes("how") && (message.includes("work") || message.includes("use"))) {
    return "Here's how CarePrice works:\n\n1️⃣ **Search** - Enter a procedure name or CPT code\n2️⃣ **Location** - Add your ZIP code\n3️⃣ **Insurance** - Select your provider & plan (optional)\n4️⃣ **Compare** - View prices across multiple hospitals\n5️⃣ **Choose** - Pick based on price, distance, or ratings\n\nWe show you real pricing data so you can make informed decisions about your healthcare!";
  }

  if (message.includes("map") || message.includes("location") || message.includes("near")) {
    return "You can view hospitals on an interactive map! 🗺️\n\nAfter searching:\n1. Click the **'Map'** button in the results\n2. See all hospitals as markers\n3. Click a marker for quick details\n4. The 🏆 marker shows the best price!\n\nDistance is calculated based on your ZIP code - closer hospitals are marked with a green badge.";
  }

  if (message.includes("accurate") || message.includes("trust") || message.includes("reliable") || message.includes("real")) {
    return "Our pricing data comes from **publicly available hospital price transparency files** that hospitals are required to publish.\n\n⚠️ **Important notes:**\n• Prices are estimates and may vary\n• Your actual cost depends on your specific plan & deductible\n• Always verify with the hospital before scheduling\n• Data is updated regularly but may not reflect recent changes\n\nWe recommend using our estimates as a starting point for conversations with providers!";
  }

  if (message.includes("thank") || message.includes("thanks")) {
    return "You're welcome! 😊 Is there anything else I can help you with? Feel free to ask about:\n\n• Finding the best prices\n• Understanding your insurance options\n• Financial assistance programs\n• How to use CarePrice";
  }

  if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
    return "Hello! 👋 Great to meet you! I'm here to help you navigate healthcare pricing. What questions do you have? You can ask me about:\n\n• Finding the lowest prices\n• How insurance affects costs\n• Financial assistance programs\n• How to use this tool";
  }

  // Default response
  return "That's a great question! While I'm a demo assistant with limited knowledge, here are some things I can help with:\n\n• **Finding best prices** - Tips for comparing costs\n• **CPT codes** - What they are and how to use them\n• **Insurance** - How plans affect your costs\n• **Financial aid** - Programs that can reduce your bill\n\nTry asking about one of these topics, or contact a hospital's billing department for specific questions!";
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = (content: string = inputValue) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getAssistantResponse(content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-primary-500/40",
          isOpen && "scale-0 opacity-0"
        )}
        aria-label="Open chat assistant"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/20 border-2 border-slate-200 dark:border-slate-700 transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
        style={{ height: "min(600px, calc(100vh - 6rem))" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-teal-500 p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">CarePrice Assistant</h3>
              <p className="text-white/80 text-xs">Here to help you save</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close chat"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: "calc(100% - 140px)" }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-teal-100 dark:from-primary-900 dark:to-teal-900 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                  message.role === "user"
                    ? "bg-gradient-to-br from-primary-500 to-teal-500 text-white rounded-br-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-md"
                )}
              >
                <p className="whitespace-pre-line">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-teal-100 dark:from-primary-900 dark:to-teal-900 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions - Show only at start */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-slate-500 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSend(question)}
                  className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-full hover:bg-primary-100 hover:text-primary-700 dark:hover:bg-primary-900 dark:hover:text-primary-300 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              size="icon"
              className="rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

