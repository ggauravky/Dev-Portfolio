/**
 * Smart Pre-Retrieval Conversation Router & Intent Classifier.
 * Intercepts casual conversation before RAG execution, enforcing zero API calls for non-knowledge queries.
 */
class ConversationRouter {
  /**
   * Evaluate user message and return conversational response or RAG trigger signal.
   */
  route(message) {
    const text = String(message || "").trim();
    const lower = text.toLowerCase().replace(/[^\w\s]/g, "").trim();

    if (!lower) {
      return { isRAGRequired: false, reply: "Hello! How can I help you explore Gaurav's portfolio today?" };
    }

    // 1. Time & Date
    if (/^(what time is it|current time|what is the time|today date|todays date|current date|what date is it|what day is it)$/i.test(lower)) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const dateStr = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      return {
        isRAGRequired: false,
        intent: "time_date",
        reply: `It's currently ${timeStr} on ${dateStr}.`,
        suggestions: ["What projects has Gaurav built?", "What are Gaurav's top technical skills?"],
      };
    }

    // 2. Greetings
    if (/^(hi|hello|hey|yo|greetings|good morning|good afternoon|good evening|good night|hii|heyy|hola|namaste|hey there)$/i.test(lower)) {
      let greetingPrefix = "Hi! 👋 I'm Gaurav AI.";
      if (lower.includes("morning")) greetingPrefix = "Good morning! ☀️ I'm Gaurav AI.";
      else if (lower.includes("night")) greetingPrefix = "Good night! 🌙 Thanks for stopping by Gaurav's portfolio.";
      else if (lower.includes("afternoon")) greetingPrefix = "Good afternoon! 👋 Hope you're having a great day.";
      else if (lower.includes("evening")) greetingPrefix = "Good evening! 🌆 Welcome to Gaurav's portfolio.";

      return {
        isRAGRequired: false,
        intent: "greetings",
        reply: `${greetingPrefix} I can help you explore Gaurav's projects, technical skills, experience, blogs, journey, and AI work. What would you like to know?`,
        suggestions: ["What projects has Gaurav built?", "Tell me about TaskNexus", "What technologies does Gaurav use?"],
      };
    }

    // 3. Thanks & Acknowledgements
    if (/^(thanks|thank you|ty|thx|awesome|great|cool|nice|good job|thanku|thanks a lot)$/i.test(lower)) {
      return {
        isRAGRequired: false,
        intent: "thanks",
        reply: "You're very welcome! 😊 Feel free to ask if you'd like to explore more of Gaurav's work.",
        suggestions: ["Show Gaurav's top projects", "How can I contact Gaurav?"],
      };
    }

    // 4. Farewells
    if (/^(bye|goodbye|see ya|cya|catch you later|take care|bye bye)$/i.test(lower)) {
      return {
        isRAGRequired: false,
        intent: "farewell",
        reply: "Goodbye! 👋 Thanks for visiting Gaurav's portfolio. Have a wonderful day!",
        suggestions: [],
      };
    }

    // 5. Small Talk & Identity
    if (/^(how are you|hows it going|what is up|whats up|how are u)$/i.test(lower)) {
      return {
        isRAGRequired: false,
        intent: "small_talk",
        reply: "I'm doing great, thank you for asking! 😊 Ready to help you discover Gaurav's projects and technical background. What can I show you today?",
        suggestions: ["What projects has Gaurav built?", "What is Gaurav's tech stack?"],
      };
    }

    if (/^(who built you|who created you|who made you|who are you)$/i.test(lower)) {
      return {
        isRAGRequired: false,
        intent: "small_talk",
        reply: "I'm Gaurav AI, an enterprise RAG assistant and portfolio agent engineered by Gaurav Kumar Yadav to showcase his projects, AI work, and technical skills.",
        suggestions: ["Tell me about TaskNexus", "What are Gaurav's core skills?", "How was this chatbot built?"],
      };
    }

    // 6. Help & Capabilities
    if (/^(help|commands|capabilities|what can you do)$/i.test(lower)) {
      return {
        isRAGRequired: false,
        intent: "help",
        reply: "I can help you explore Gaurav's portfolio:\n\n• **Projects**: TaskNexus, SmartMess, InstaX\n• **Skills**: React, Node.js, Python, RAG, MongoDB\n• **Experience & Education**: Internships & IIT Mandi Minor\n• **Actions**: Download resume, copy email, navigate pages",
        suggestions: ["Show Gaurav's strongest projects", "Download resume", "How can I contact Gaurav?"],
      };
    }

    // If query is portfolio-specific, trigger RAG pipeline
    return {
      isRAGRequired: true,
    };
  }
}

const conversationRouter = new ConversationRouter();

module.exports = {
  conversationRouter,
  ConversationRouter,
};
