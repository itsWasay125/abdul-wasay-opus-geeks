import { useEffect, useRef, useState } from "react";
import {
  addUserMessage,
  createInitialSession,
  getOrCreateVisitorId,
  loadChatSession,
  processChatResponse,
  saveChatSession,
} from "../services/chatbotEngine";
import Icon from "./Icon";
import "../styles/chatbot.css";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const [session, setSession] = useState(null);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const idleTimerRef = useRef(null);

  // Initialize session from persistent storage
  useEffect(() => {
    const vid = getOrCreateVisitorId();
    const loaded = loadChatSession(vid);

    // If returning visitor with known name, append a subtle welcome back if long time elapsed
    if (loaded && loaded.lead && loaded.lead.name && loaded.messages.length > 1) {
      const lastMsg = loaded.messages[loaded.messages.length - 1];
      const hoursSinceLast = (Date.now() - (lastMsg.timestamp || 0)) / (1000 * 60 * 60);
      if (hoursSinceLast > 1) {
        loaded.messages.push({
          id: "msg_wb_" + Date.now(),
          role: "assistant",
          text: `Welcome back, ${loaded.lead.name}! We can pick up where we left off, or tell me what you need help with today.`,
          chips: ["Start a new project", "Ask about pricing", "Contact details"],
          timestamp: Date.now(),
        });
        saveChatSession(vid, loaded);
      }
    }

    setSession(loaded);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [session?.messages, isOpen, isTyping]);

  // Idle timeout handler (60s idle wind-down detection)
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (session && isOpen && !session.hasRecaptured) {
        const lastMsg = session.messages[session.messages.length - 1];
        if (lastMsg && lastMsg.role === "user") {
          // Trigger gentle recapture
          const botMsg = processChatResponse("ok bye", session);
          setSession({ ...session });
        }
      }
    }, 60000);
  };

  const handleSend = (textToSend) => {
    const message = typeof textToSend === "string" ? textToSend : inputVal;
    if (!message || !message.trim() || !session) return;

    // 1. Add user message
    addUserMessage(message.trim(), session);
    setInputVal("");
    setSession({ ...session });
    setIsTyping(true);
    resetIdleTimer();

    // 2. Simulate smart typing response delay (400ms)
    setTimeout(() => {
      processChatResponse(message.trim(), session);
      setIsTyping(false);
      setSession({ ...session });
    }, 450);
  };

  const handleChipClick = (chipText) => {
    handleSend(chipText);
  };

  const handleReset = () => {
    if (!session) return;
    const vid = session.visitor_id;
    const newSession = createInitialSession(vid);
    saveChatSession(vid, newSession);
    setSession(newSession);
  };

  const handleClose = () => {
    setIsOpen(false);
    // On close check if name/email is missing
    if (session && !session.hasRecaptured && session.state >= 2 && (!session.lead.name || !session.lead.email)) {
      processChatResponse("bye", session);
      setSession({ ...session });
    }
  };


  /* Four seconds is long enough that it does not compete with the page
     loading, and short enough that it still lands while someone is reading
     the first screen. Once the chat has been opened it never returns. */
  useEffect(() => {
    if (sessionStorage.getItem("og-greeted") === "1") return undefined;
    const timer = window.setTimeout(() => setGreeting(true), 4000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setGreeting(false);
    try {
      sessionStorage.setItem("og-greeted", "1");
    } catch {
      /* private mode - the greeter simply shows again next load */
    }
  }, [isOpen]);
  if (!session) return null;

  return (
    <>
      {/* The greeter. A small droid leans in beside the trigger a few
          seconds after the page settles and asks once. It is drawn, not
          rendered - an inline SVG and two CSS animations, so it costs
          nothing next to the WebGL droid in the banner. It asks once per
          session and never again after the chat has been opened. */}
      {greeting && !isOpen ? (
        <div className="chat-greeter">
          <button
            type="button"
            className="chat-greeter__bubble"
            onClick={() => setIsOpen(true)}
          >
            Ask any question
          </button>

          <button
            type="button"
            className="chat-greeter__droid"
            onClick={() => setIsOpen(true)}
            aria-label="Ask any question"
          >
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <defs>
                <linearGradient id="greeterBody" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#3b2a63" />
                  <stop offset="1" stopColor="#0b1230" />
                </linearGradient>
              </defs>
              {/* antenna */}
              <line x1="32" y1="6" x2="32" y2="13" stroke="#00aeef" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="32" cy="5" r="3" fill="#00aeef" className="chat-greeter__blip" />
              {/* head */}
              <rect x="13" y="13" width="38" height="29" rx="12" fill="url(#greeterBody)" />
              {/* visor */}
              <rect x="18" y="20" width="28" height="15" rx="7.5" fill="#0a1836" />
              <circle cx="26" cy="27.5" r="3" fill="#00aeef" className="chat-greeter__eye" />
              <circle cx="38" cy="27.5" r="3" fill="#00aeef" className="chat-greeter__eye" />
              {/* ears */}
              <rect x="8" y="23" width="4" height="9" rx="2" fill="#633494" />
              <rect x="52" y="23" width="4" height="9" rx="2" fill="#633494" />
              {/* shoulders */}
              <path d="M17 46h30a9 9 0 0 1 9 9v3H8v-3a9 9 0 0 1 9-9z" fill="url(#greeterBody)" />
              <rect x="27" y="49" width="10" height="3" rx="1.5" fill="#147bc2" />
            </svg>
          </button>

          <button
            type="button"
            className="chat-greeter__dismiss"
            onClick={() => setGreeting(false)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ) : null}

      {/* Floating Trigger Island */}
      <button
        type="button"
        className="chatbot-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Open Ask Opus AI Assistant"
      >
        <span className="chatbot-trigger-dot" aria-hidden="true" />
        <Icon name="bot" size={16} />
        <span>Ask Opus</span>
      </button>

      {/* Background Overlay */}
      <div
        className={`chatbot-overlay ${isOpen ? "is-open" : ""}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Main Chat Panel */}
      <div
        className={`chatbot-panel ${isOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Ask Opus AI Chatbot"
      >
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">
              <Icon name="bot" size={18} />
            </div>
            <div className="chatbot-header-text">
              <h3>
                ASK OPUS
                <span className="status-dot" aria-hidden="true" />
              </h3>
              <span>Verified AI Assistant · Opus Geeks</span>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button
              type="button"
              className="chatbot-action-btn"
              onClick={handleReset}
              title="Reset Conversation"
              aria-label="Reset Conversation"
            >
              <Icon name="sparkles" size={15} />
            </button>
            <button
              type="button"
              className="chatbot-action-btn"
              onClick={handleClose}
              title="Close chat"
              aria-label="Close chat"
            >
              <Icon name="chevron-down" size={18} />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="chatbot-messages">
          {session.messages.map((msg, index) => {
            const isBot = msg.role === "assistant";
            const isLast = index === session.messages.length - 1;
            const timeStr = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg.id || index}
                className={`chatbot-message ${isBot ? "chatbot-message--bot" : "chatbot-message--user"}`}
              >
                <div className="chatbot-bubble">{msg.text}</div>
                <span className="chatbot-time">{timeStr}</span>

                {/* Chips on last bot message */}
                {isBot && isLast && msg.chips && msg.chips.length > 0 && !isTyping && (
                  <div className="chatbot-chips">
                    {msg.chips.map((chip) => (
                      <button
                        type="button"
                        key={chip}
                        className="chatbot-chip"
                        onClick={() => handleChipClick(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="chatbot-typing" aria-label="Ask Opus is typing">
              <span className="chatbot-typing-dot" />
              <span className="chatbot-typing-dot" />
              <span className="chatbot-typing-dot" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form
          className="chatbot-footer"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className="chatbot-input"
            placeholder="Type your message…"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={() => resetIdleTimer()}
            autoFocus={isOpen}
          />
          <button
            type="submit"
            className="chatbot-send-btn"
            disabled={!inputVal.trim() || isTyping}
            aria-label="Send message"
          >
            <Icon name="send" size={16} />
          </button>
        </form>
      </div>
    </>
  );
}
