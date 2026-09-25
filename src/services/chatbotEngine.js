/* ==========================================================================
   ASK OPUS — CHATBOT CORE ENGINE & PERSISTENT STATE MACHINE
   A scripted lead-capture flow (state 0 → 7) that remembers the visitor
   between sessions via localStorage.

   English only. The original engine mirrored the visitor's language and
   answered in Roman Urdu when it detected it; that branch is removed on
   purpose, so every reply here is English regardless of what is typed.
   ========================================================================== */

const STORAGE_KEY_VISITOR_ID = "opus_chat_visitor_id";
const STORAGE_PREFIX_CHAT = "opus_chat_session_";

export const VERIFIED_SERVICES = [
  { id: "web", label: "Web Development", desc: "Custom websites, SaaS, e-commerce, web apps" },
  { id: "mobile", label: "Mobile App Development", desc: "iOS, Android, cross-platform apps" },
  { id: "game", label: "Game Development", desc: "2D/3D real-time interactive experiences" },
  { id: "ai", label: "AI Automation", desc: "Workflows, assistants, business automation" },
  { id: "uiux", label: "UI/UX Design", desc: "Research, wireframes, prototypes, design systems" },
];

export const VERIFIED_CONTACT = {
  email: "contact@opusgeeks.com",
  phone: "+1 (346) 690-4693",
  locations: "Karachi HQ & Florida Studio",
};

const SKIP_WORDS = ["skip", "no", "none", "later", "not now"];

/* Generate or retrieve a persistent visitor id */
export function getOrCreateVisitorId() {
  if (typeof window === "undefined") return "guest";
  try {
    let vid = localStorage.getItem(STORAGE_KEY_VISITOR_ID);
    if (!vid) {
      vid = "v_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEY_VISITOR_ID, vid);
    }
    return vid;
  } catch {
    /* private window or blocked storage — the chat still works, it just
       will not be remembered next visit */
    return "guest";
  }
}

export function loadChatSession(visitorId) {
  if (typeof window === "undefined") return createInitialSession(visitorId);
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX_CHAT + visitorId);
    if (raw) return JSON.parse(raw);
  } catch {
    /* unreadable or corrupt session — start a fresh one */
  }
  return createInitialSession(visitorId);
}

export function saveChatSession(visitorId, session) {
  if (typeof window === "undefined") return;
  try {
    session.updated_at = Date.now();
    localStorage.setItem(STORAGE_PREFIX_CHAT + visitorId, JSON.stringify(session));
  } catch {
    /* storage full or blocked — keep the in-memory session going */
  }
}

export function createInitialSession(visitorId) {
  return {
    visitor_id: visitorId,
    state: 0, // 0 greeting → 1 name → 2 location → 3 email → 4 service → 5 scope → 6/7 wrap-up
    hasRecaptured: false,
    lead: {
      name: null,
      location: null,
      email: null,
      service_interest: null,
      qualifying_answers: {},
      lead_status: "in_progress", // "in_progress" | "captured"
    },
    messages: [
      {
        id: "msg_init",
        role: "assistant",
        text: "Hi! I'm ASK OPUS — the Opus Geeks AI assistant. What's your name?",
        chips: [],
        timestamp: Date.now(),
      },
    ],
    updated_at: Date.now(),
  };
}

export function extractEmail(text) {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

export function processChatResponse(userText, session) {
  const text = userText.trim();
  const lower = text.toLowerCase();

  let botReply = "";
  let nextChips = [];
  let nextState = session.state;

  /* Wind-down: if they are wrapping up before we have a name or an email,
     ask once for the missing piece, then close warmly. */
  const closingKeywords = ["thanks", "thank you", "ok bye", "bye", "all good", "done", "goodbye"];
  const isClosing = closingKeywords.some((w) => lower.includes(w));

  if (isClosing && nextState >= 3) {
    if (!session.hasRecaptured) {
      session.hasRecaptured = true;
      if (!session.lead.name) {
        session.state = 1;
        return generateAssistantMessage(
          "Great speaking with you! Could you share your name so I can prepare an accurate follow-up note for the team?",
          [],
          session
        );
      }
      if (!session.lead.email) {
        session.state = 3;
        return generateAssistantMessage(
          `Great! Please share your email so our team can send over a tailored proposal for your ${
            session.lead.service_interest || "project"
          }.`,
          [],
          session
        );
      }
    }
    session.lead.lead_status = session.lead.email ? "captured" : "in_progress";
    return generateAssistantMessage(
      `Thank you${session.lead.name ? ` ${session.lead.name}` : ""}! Feel free to reach us directly at ${
        VERIFIED_CONTACT.email
      } or ${VERIFIED_CONTACT.phone}. Have a great day!`,
      [],
      session
    );
  }

  switch (session.state) {
    case 0:
    case 1: {
      const isSkip = SKIP_WORDS.includes(lower);
      session.lead.name = isSkip ? "there" : text.replace(/^(my name is|i am|i'm|im)\s+/i, "");
      nextState = 2;
      botReply = `Nice to meet you, ${session.lead.name}! Where are you based? (Optional — feel free to skip.)`;
      nextChips = ["United States", "United Kingdom", "Pakistan", "Skip"];
      break;
    }

    case 2: {
      if (!SKIP_WORDS.includes(lower)) session.lead.location = text;
      nextState = 3;
      botReply = "Great. What's your work email so our senior team can follow up with accurate project specs?";
      break;
    }

    case 3: {
      const foundEmail = extractEmail(text);
      if (foundEmail) session.lead.email = foundEmail;
      else if (!SKIP_WORDS.includes(lower)) session.lead.email = text;
      nextState = 4;
      botReply = "Perfect. Now — what type of digital product or service are you looking to build?";
      nextChips = [
        "Website / Web App",
        "Mobile App Development",
        "UI/UX Design",
        "AI Automation",
        "Game Development",
      ];
      break;
    }

    case 4: {
      let matched = "Web Development";
      if (lower.includes("mobile") || lower.includes("ios") || lower.includes("android") || lower.includes("app")) {
        matched = "Mobile App Development";
      } else if (lower.includes("design") || lower.includes("ui") || lower.includes("ux") || lower.includes("figma")) {
        matched = "UI/UX Design";
      } else if (lower.includes("ai") || lower.includes("automation") || lower.includes("bot") || lower.includes("smart")) {
        matched = "AI Automation";
      } else if (lower.includes("game") || lower.includes("unity") || lower.includes("3d")) {
        matched = "Game Development";
      }

      session.lead.service_interest = matched;
      nextState = 5;

      if (matched === "Web Development") {
        botReply =
          "Understood — for web, Opus Geeks engineers high-performance Next.js and React platforms. Quick question: is this an e-commerce store, a SaaS platform, or a company web platform?";
        nextChips = ["E-Commerce", "SaaS Platform", "Brand Website", "Custom Web App"];
      } else if (matched === "Mobile App Development") {
        botReply =
          "Excellent! We build native iOS, Android, and Flutter / React Native apps. What's your primary target platform?";
        nextChips = ["iOS & Android", "iOS Native", "Android Native"];
      } else if (matched === "UI/UX Design") {
        botReply =
          "Design is in our DNA. Are you looking for a full 0-to-1 product prototype, or a redesign of an existing application?";
        nextChips = ["New Product (0 to 1)", "Redesign", "Design System"];
      } else if (matched === "AI Automation") {
        botReply =
          "Smart automation workflows and custom AI assistants are our specialty. Which workflow or customer journey do you want to automate?";
        nextChips = ["Customer Support Assistant", "Data Pipeline", "Custom AI Tool"];
      } else {
        botReply = "For game development we engineer real-time interactive experiences. Is your concept 2D or 3D?";
        nextChips = ["2D Game", "3D Interactive", "Gamified App"];
      }
      break;
    }

    case 5: {
      session.lead.qualifying_answers.detail = text;
      nextState = 6;
      const service = session.lead.service_interest || "Web Development";
      botReply = `Excellent! Based on your scope, the Opus Geeks ${service} practice is the right match.

Pricing depends on scope, platform complexity, integrations, and timeline. For an accurate quote and delivery roadmap, our senior team is ready to connect:
${VERIFIED_CONTACT.email}
${VERIFIED_CONTACT.phone}

Would you like me to forward your brief to the team for a 24-hour response?`;
      nextChips = ["Yes, forward to team", "Schedule a call", "I have another question"];
      break;
    }

    case 6:
    case 7: {
      session.lead.lead_status = "captured";
      nextState = 7;
      botReply = `Perfect${session.lead.name ? ` ${session.lead.name}` : ""}! Your project request has been logged. A senior technical lead will follow up within 24 hours at ${
        session.lead.email || "your email"
      } with scope clarity and next steps.

Is there anything else I can help you with about Opus Geeks?`;
      nextChips = ["Where are your offices?", "What tech stack do you use?", "All good, thank you"];
      break;
    }

    default: {
      botReply = `I'm here! Ask me anything about Opus Geeks' services, engineering process, or contact details. (${VERIFIED_CONTACT.email})`;
      nextChips = ["Web Development", "Mobile Apps", "UI/UX Design", "Start a Project"];
      break;
    }
  }

  session.state = nextState;
  return generateAssistantMessage(botReply, nextChips, session);
}

function generateAssistantMessage(text, chips, session) {
  const msg = {
    id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    role: "assistant",
    text,
    chips: chips || [],
    timestamp: Date.now(),
  };
  session.messages.push(msg);
  saveChatSession(session.visitor_id, session);
  return msg;
}

export function addUserMessage(userText, session) {
  const msg = {
    id: "msg_u_" + Date.now(),
    role: "user",
    text: userText,
    timestamp: Date.now(),
  };
  session.messages.push(msg);
  saveChatSession(session.visitor_id, session);
  return msg;
}
