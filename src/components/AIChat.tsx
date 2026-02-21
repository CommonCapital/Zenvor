'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Loader2, MessageCircle, Send, X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Navy Minimalism Tokens ─────────────────────────────────────────────────────
// #0B1F3B — Primary Navy
// #FFFFFF — Pure White
// rgba(11,31,59,0.XX) — All opacity variants

interface Props {
  isExpanded: boolean;
  onClose: () => void;
}

const AIChat = ({ isExpanded, onClose }: Props) => {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isTyping = status === 'submitted';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300"
          style={{ background: "rgba(11,31,59,0.08)" }}
          onClick={onClose}
        />
      )}

      {/* Chat window */}
      <div
        className={cn(
          "fixed bottom-8 right-8 z-50 flex flex-col overflow-hidden transition-all duration-300",
          isExpanded
            ? "w-[90vw] sm:w-[480px] h-[90vh] sm:h-[620px] opacity-100 scale-100"
            : "w-0 h-0 opacity-0 scale-95 pointer-events-none"
        )}
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(11,31,59,0.12)",
          boxShadow: "0 16px 48px rgba(11,31,59,0.16)",
          borderRadius: 0,
        }}
      >
        {/* Header */}
        <div style={{
          background: "#0B1F3B",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Icon */}
            <div style={{
              width: 36, height: 36,
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <MessageCircle size={16} strokeWidth={1.5} color="rgba(255,255,255,0.7)" />
            </div>
            <div>
              <p style={{
                fontFamily: "Helvetica Neue, sans-serif",
                fontSize: 11, fontWeight: 600,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: "#FFFFFF", marginBottom: 4,
              }}>
                CV Analysis Assistant
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: isTyping ? "rgba(255,255,255,0.4)" : "#0F766E",
                  transition: "background 0.3s",
                }} />
                <span style={{
                  fontSize: 10, fontWeight: 400,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                }}>
                  {isTyping ? "Thinking" : "Online"}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { icon: <Minus size={14} strokeWidth={1.5} />, onClick: onClose },
              { icon: <X size={14} strokeWidth={1.5} />, onClick: onClose },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                style={{
                  width: 32, height: 32,
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.45)",
                  transition: "all 0.18s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "none";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                }}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "28px 24px",
          background: "#FFFFFF",
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{
                width: 56, height: 56,
                border: "1px solid rgba(11,31,59,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <MessageCircle size={22} strokeWidth={1} color="rgba(11,31,59,0.25)" />
              </div>
              <p style={{
                fontFamily: "Garamond, serif",
                fontSize: 18, fontWeight: 400,
                color: "#0B1F3B", letterSpacing: "-0.02em",
                marginBottom: 10,
              }}>
                Ask About This Candidate
              </p>
              <p style={{
                fontSize: 10, fontWeight: 600,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: "rgba(11,31,59,0.35)",
              }}>
                Experience · Skills · Role Fit
              </p>
            </div>
          )}

          {messages.map((message: any) => {
            const isUser = message.role === 'user';
            return (
              <div key={message.id} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "84%",
                  padding: "14px 18px",
                  fontFamily: "Helvetica Neue, sans-serif",
                  fontSize: 13, fontWeight: 300, lineHeight: 1.6,
                  background: isUser ? "#0B1F3B" : "#FFFFFF",
                  color: isUser ? "#FFFFFF" : "#0B1F3B",
                  border: isUser ? "1px solid #0B1F3B" : "1px solid rgba(11,31,59,0.12)",
                  boxShadow: isUser ? "none" : "0 2px 12px rgba(11,31,59,0.06)",
                }}>
                  {message.parts.map((part: any, index: number) => {
                    if (part.type === 'tool-web_search') {
                      if (part.state === 'input-streaming' || part.state === 'input-available') {
                        return (
                          <div key={index} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Loader2 size={12} strokeWidth={1.5} className="animate-spin" />
                            <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>Searching</span>
                          </div>
                        );
                      }
                      if (part.state === 'output-available') {
                        return (
                          <span key={index} style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0F766E" }}>
                            ✓ Search Complete
                          </span>
                        );
                      }
                      return null;
                    }

                    if (part.type === 'text') {
                      return (
                        <ReactMarkdown
                          key={index}
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }: any) => (
                              <p style={{ marginBottom: 12, fontWeight: 300 }}>{children}</p>
                            ),
                            ul: ({ children }: any) => (
                              <ul style={{ marginBottom: 12, paddingLeft: 20, listStyleType: "disc" }}>{children}</ul>
                            ),
                            ol: ({ children }: any) => (
                              <ol style={{ marginBottom: 12, paddingLeft: 20, listStyleType: "decimal" }}>{children}</ol>
                            ),
                            li: ({ children }: any) => (
                              <li style={{ fontSize: 13, fontWeight: 300, marginBottom: 4 }}>{children}</li>
                            ),
                            a: ({ children, href }: any) => (
                              <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", textDecorationThickness: "1px", textUnderlineOffset: "2px" }}>
                                {children}
                              </a>
                            ),
                            h1: ({ children }: any) => (
                              <h1 style={{ fontFamily: "Garamond, serif", fontSize: 17, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 10, marginTop: 16 }}>{children}</h1>
                            ),
                            h2: ({ children }: any) => (
                              <h2 style={{ fontFamily: "Garamond, serif", fontSize: 15, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 8, marginTop: 12 }}>{children}</h2>
                            ),
                            h3: ({ children }: any) => (
                              <h3 style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, marginTop: 10 }}>{children}</h3>
                            ),
                            strong: ({ children }: any) => (
                              <strong style={{ fontWeight: 500 }}>{children}</strong>
                            ),
                            code: ({ children }: any) => (
                              <code style={{ fontFamily: "monospace", fontSize: 12, background: "rgba(11,31,59,0.06)", padding: "1px 6px" }}>{children}</code>
                            ),
                            pre: ({ children }: any) => (
                              <pre style={{ fontFamily: "monospace", fontSize: 12, background: "rgba(11,31,59,0.04)", border: "1px solid rgba(11,31,59,0.1)", padding: "12px", overflowX: "auto", marginBottom: 12 }}>{children}</pre>
                            ),
                          }}
                        >
                          {part.text}
                        </ReactMarkdown>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                padding: "14px 18px",
                border: "1px solid rgba(11,31,59,0.12)",
                boxShadow: "0 2px 12px rgba(11,31,59,0.06)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <Loader2 size={13} strokeWidth={1.5} className="animate-spin" color="rgba(11,31,59,0.4)" />
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(11,31,59,0.35)" }}>
                  Thinking
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "20px 24px",
          borderTop: "1px solid rgba(11,31,59,0.1)",
          background: "#FFFFFF",
          flexShrink: 0,
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask about this candidate..."
              disabled={isTyping}
              style={{
                flex: 1, height: 48,
                fontFamily: "Helvetica Neue, sans-serif",
                fontSize: 13, fontWeight: 300,
                color: "#0B1F3B",
                background: "#FFFFFF",
                border: "1px solid rgba(11,31,59,0.25)",
                padding: "0 14px",
                outline: "none",
                transition: "border-color 0.18s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0B1F3B")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(11,31,59,0.25)")}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              style={{
                width: 48, height: 48,
                background: input.trim() && !isTyping ? "#0B1F3B" : "rgba(11,31,59,0.08)",
                border: "1px solid rgba(11,31,59,0.15)",
                cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.18s", flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (input.trim() && !isTyping) {
                  (e.currentTarget as HTMLElement).style.background = "#FFFFFF";
                }
              }}
              onMouseLeave={(e) => {
                if (input.trim() && !isTyping) {
                  (e.currentTarget as HTMLElement).style.background = "#0B1F3B";
                }
              }}
            >
              <Send size={14} strokeWidth={1.5} color={input.trim() && !isTyping ? "#FFFFFF" : "rgba(11,31,59,0.3)"} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AIChat;


// ── Chat Bubble + Badge (paste into your parent component) ────────────────────
//
// const [isChatOpen, setIsChatOpen] = useState(false);
//
// <button
//   onClick={() => setIsChatOpen(!isChatOpen)}
//   style={{
//     position: "fixed", bottom: 24, right: 24, zIndex: 40,
//     width: 52, height: 52,
//     background: isChatOpen ? "#FFFFFF" : "#0B1F3B",
//     border: "1px solid rgba(11,31,59,0.2)",
//     boxShadow: "0 8px 32px rgba(11,31,59,0.2)",
//     display: "flex", alignItems: "center", justifyContent: "center",
//     cursor: "pointer",
//     transition: "all 0.22s",
//     transform: isChatOpen ? "rotate(90deg)" : "none",
//   }}
// >
//   {isChatOpen
//     ? <X size={18} strokeWidth={1.5} color="#0B1F3B" />
//     : <MessageCircle size={18} strokeWidth={1.5} color="#FFFFFF" />
//   }
// </button>
//
// {!isChatOpen && (
//   <div style={{ position: "fixed", bottom: 84, right: 24, zIndex: 40 }}>
//     <div style={{
//       background: "#0F766E", color: "#FFFFFF",
//       fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
//       width: 20, height: 20, borderRadius: "50%",
//       display: "flex", alignItems: "center", justifyContent: "center",
//     }}>
//       AI
//     </div>
//   </div>
// )}