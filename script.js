const navbar = document.getElementById("navbar");
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-link");
const navLinks = document.querySelectorAll(".nav-link");
const revealElements = document.querySelectorAll(".reveal");
const serviceCards = document.querySelectorAll(".service-card");
const serviceIcons = document.querySelectorAll(".service-icon");
const parrotImage = document.getElementById("parrot-image");
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const themeTransition = document.getElementById("theme-transition");
const contactForm = document.getElementById("contact-form");
const leadForm = document.getElementById("lead-form");
const leadFormStatus = document.getElementById("lead-form-status");

const chatLauncher = document.getElementById("chat-launcher");
const chatModal = document.getElementById("chat-modal");
const chatClose = document.getElementById("chat-close");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const CHAT_CLIENT_ID_KEY = "cp-chat-client-id";
const CHAT_STORAGE_KEY = "cp-chat-conversations";

function trackEvent(eventName, params) {
  const safeParams = params || {};
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, safeParams);
      return;
    }
  } catch (e) {}

  try {
    if (window.dataLayer && typeof window.dataLayer.push === "function") {
      window.dataLayer.push({ event: eventName, ...safeParams });
    }
  } catch (e) {}
}

function applyTheme(theme) {
  const root = document.documentElement;
  const resolvedTheme = theme === "light" ? "light" : "dark";
  root.setAttribute("data-theme", resolvedTheme);
  localStorage.setItem("cp-theme", resolvedTheme);

  if (themeIcon && themeToggle) {
    const isLight = resolvedTheme === "light";
    themeIcon.textContent = isLight ? "🌙" : "☀";
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem("cp-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme);
    return;
  }

  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(prefersLight ? "light" : "dark");
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && themeTransition) {
    const rect = themeToggle ? themeToggle.getBoundingClientRect() : { left: window.innerWidth / 2, top: 0, width: 0, height: 0 };
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    themeTransition.style.setProperty("--x", `${x}px`);
    themeTransition.style.setProperty("--y", `${y}px`);

    document.body.classList.remove("theme-switching");
    void document.body.offsetWidth;
    document.body.classList.add("theme-switching");
    setTimeout(() => document.body.classList.remove("theme-switching"), 540);
  }

  applyTheme(current === "light" ? "dark" : "light");
}

function handleNavbarScroll() {
  if (!navbar) return;
  if (window.scrollY > 25) {
    navbar.classList.add("nav-scrolled");
  } else {
    navbar.classList.remove("nav-scrolled");
  }
}

function toggleMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.toggle("open");
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove("open");
}

function revealOnScroll() {
  if (revealElements.length === 0) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 40, 240)}ms`;
    observer.observe(element);
  });
}

function staggerServiceCards() {
  if (serviceCards.length === 0) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const cards = [...serviceCards];
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add("revealed");
          }, 120 * index);
        });
        observer.disconnect();
      });
    },
    { threshold: 0.2 }
  );

  if (serviceCards[0] && serviceCards[0].parentElement) {
    observer.observe(serviceCards[0].parentElement);
  }
}

function setActiveLinkByPage() {
  const page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  navLinks.forEach((link) => {
    const href = (link.getAttribute("href") || "").toLowerCase();
    const isActive = href === page;
    link.classList.toggle("text-gold", isActive);
    link.classList.toggle("after:w-full", isActive);
  });
}

function setupLinkUnderline() {
  navLinks.forEach((link) => {
    link.classList.add(
      "after:absolute",
      "after:left-0",
      "after:-bottom-1.5",
      "after:h-[1px]",
      "after:w-0",
      "after:bg-gradient-to-r",
      "after:from-red-500",
      "after:via-orange-400",
      "after:to-yellow-300",
      "after:transition-all",
      "after:duration-300",
      "hover:after:w-full"
    );
  });
}

function setupParallax() {
  if (!parrotImage) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  window.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 16;
    const y = (event.clientY / window.innerHeight - 0.5) * 16;
    parrotImage.style.transform = `translate3d(${x}px, ${y * -1}px, 0)`;
  });
}

function iconHoverBounce() {
  serviceCards.forEach((card, index) => {
    card.addEventListener("mouseenter", () => {
      const icon = serviceIcons[index];
      if (!icon) return;
      icon.animate(
        [
          { transform: "translateY(0px)" },
          { transform: "translateY(-5px)" },
          { transform: "translateY(0px)" },
        ],
        { duration: 460, easing: "ease-out" }
      );
    });
  });
}
// Initialize EmailJS with your public key

function setupContactForm() {
  if (!contactForm) return;
  if (typeof emailjs === "undefined") return;

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const defaultLabel = submitButton?.dataset.defaultLabel || "Submit";
    if (submitButton) {
      submitButton.dataset.defaultLabel = defaultLabel;
      submitButton.textContent = "Sending...";
      submitButton.disabled = true;
    }

    // These names must match the "name" attribute in your HTML inputs
    const formData = {
      name: contactForm.name.value,
      email: contactForm.email.value,
      message: contactForm.message.value
    };

    // Replace these strings with your ACTUAL IDs from EmailJS dashboard
    emailjs.send("service_acxhgoi", "template_65zalmw", formData)
      .then(() => {
        if (submitButton) submitButton.textContent = "Sent!";
        contactForm.reset();
        alert("Message sent successfully!");

        setTimeout(() => {
          if (submitButton) {
            submitButton.textContent = submitButton.dataset.defaultLabel || "Submit";
            submitButton.disabled = false;
          }
        }, 3000);
      })
      .catch((err) => {
        console.error("Failed to send:", err);
        if (submitButton) {
          submitButton.textContent = "Try Again";
          submitButton.disabled = false;
        }
        alert("Failed to send message. Please try again.");
      });
  });
}

function setupLeadForm() {
  if (!leadForm) return;

  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!leadForm.checkValidity()) {
      leadForm.reportValidity();
      return;
    }

    const submitButton = leadForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = "Sent";
      submitButton.disabled = true;
    }

    if (leadFormStatus) {
      leadFormStatus.textContent = "Thanks—check your inbox for the next steps.";
    }

    trackEvent("lead_submit", { form: "lead" });

    setTimeout(() => {
      leadForm.reset();
      if (submitButton) {
        submitButton.textContent = "Submit";
        submitButton.disabled = false;
      }
    }, 450);
  });
}

function setupChatWidget() {
  if (!chatLauncher || !chatModal || !chatClose || !chatForm || !chatInput) return;

  const createClientId = () => `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let lastKnownStatus = null;

  const getChatStore = () => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  };

  const saveChatStore = (store) => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(store));
  };

  const getClientId = () => localStorage.getItem(CHAT_CLIENT_ID_KEY);

  const setClientId = (id) => {
    localStorage.setItem(CHAT_CLIENT_ID_KEY, id);
  };

  const clearClientId = () => {
    localStorage.removeItem(CHAT_CLIENT_ID_KEY);
  };

  const ensureClientRecord = (clientId) => {
    const store = getChatStore();
    const current = store[clientId];
    if (Array.isArray(current)) {
      store[clientId] = {
        status: "pending",
        messages: current,
        createdAt: current[0]?.timestamp || Date.now(),
        updatedAt: current[current.length - 1]?.timestamp || Date.now()
      };
    } else if (!current || typeof current !== "object") {
      store[clientId] = {
        status: "pending",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    } else {
      store[clientId].messages = Array.isArray(store[clientId].messages) ? store[clientId].messages : [];
      store[clientId].status = store[clientId].status || "pending";
      store[clientId].createdAt = store[clientId].createdAt || Date.now();
      store[clientId].updatedAt = store[clientId].updatedAt || Date.now();
    }
    return { store, record: store[clientId] };
  };

  const updateStatus = (clientId, status) => {
    const { store, record } = ensureClientRecord(clientId);
    record.status = status;
    record.updatedAt = Date.now();
    saveChatStore(store);
  };

  const addMessageToStore = (clientId, text, who, timestamp = Date.now()) => {
    const { store, record } = ensureClientRecord(clientId);
    record.messages.push({
      id: `${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      who,
      timestamp
    });
    record.updatedAt = timestamp;
    saveChatStore(store);
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const statusBadge = document.createElement("span");
  statusBadge.id = "chat-status-badge";
  statusBadge.className = "ml-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]";
  const modalHeaderTitle = chatModal.querySelector("p");
  if (modalHeaderTitle && modalHeaderTitle.parentElement && !document.getElementById("chat-status-badge")) {
    modalHeaderTitle.parentElement.insertBefore(statusBadge, modalHeaderTitle.nextSibling);
  }

  const endChatButton = document.createElement("button");
  endChatButton.type = "button";
  endChatButton.className = "mt-2 w-full rounded-xl border border-red-400/45 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-300 transition hover:shadow-[0_0_24px_rgba(248,113,113,0.35)]";
  endChatButton.textContent = "End Chat";
  if (!chatModal.querySelector("#chat-end-button")) {
    endChatButton.id = "chat-end-button";
    chatForm.insertAdjacentElement("afterend", endChatButton);
  }

  const setStatusBadge = (status) => {
    const label = status || "pending";
    statusBadge.textContent = label;
    statusBadge.className = "ml-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]";
    if (label === "active") {
      statusBadge.classList.add("border-emerald-300/60", "text-emerald-300", "bg-emerald-500/10");
    } else if (label === "closed") {
      statusBadge.classList.add("border-red-300/60", "text-red-300", "bg-red-500/10");
    } else {
      statusBadge.classList.add("border-yellow-300/60", "text-yellow-300", "bg-yellow-500/10");
    }
  };

  const setInputAvailability = (status) => {
    const isClosed = status === "closed";
    const allowTyping = !isClosed;
    chatInput.disabled = !allowTyping;
    const sendBtn = chatForm.querySelector('button[type="submit"]');
    if (sendBtn) sendBtn.disabled = !allowTyping;
    chatInput.placeholder = isClosed ? "Start a new chat to continue" : "Type your message...";
    endChatButton.disabled = false;
    endChatButton.textContent = isClosed ? "Start New Chat" : "End Chat";
    endChatButton.classList.remove("opacity-60", "cursor-not-allowed");
  };

  const safeAddBubble = (text, who, timestamp = Date.now()) => {
    const bubble = document.createElement("div");
    const bubbleRole = who === "client" || who === "user" ? "user" : "bot";
    bubble.className = `chat-bubble ${bubbleRole}`;
    const p = document.createElement("p");
    p.textContent = text;
    const meta = document.createElement("p");
    meta.className = "mt-1 text-[10px] uppercase tracking-[0.12em] text-zinc-400";
    meta.textContent = formatTime(timestamp);
    bubble.appendChild(p);
    bubble.appendChild(meta);
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const renderConversation = (clientId) => {
    if (!clientId) {
      chatMessages.innerHTML = "";
      setStatusBadge("pending");
      setInputAvailability("pending");
      lastKnownStatus = "pending";
      return;
    }
    const store = getChatStore();
    const record = store[clientId];
    const normalized = Array.isArray(record)
      ? { status: "pending", messages: record }
      : (record || { status: "pending", messages: [] });
    const messages = Array.isArray(normalized.messages) ? normalized.messages : [];
    const status = normalized.status || "pending";

    chatMessages.innerHTML = "";
    messages.forEach((msg) => safeAddBubble(msg.text, msg.who, msg.timestamp));
    setStatusBadge(status);
    setInputAvailability(status);

    lastKnownStatus = status;

    if (status === "pending") {
      const waiting = document.createElement("p");
      waiting.className = "mt-2 text-[11px] uppercase tracking-[0.12em] text-yellow-300";
      waiting.textContent = "Waiting for admin to accept your chat...";
      chatMessages.appendChild(waiting);
    }
  };

  const openChat = () => {
    chatModal.classList.add("open");
    let clientId = getClientId();
    if (!clientId) {
      chatMessages.innerHTML = "";
      safeAddBubble("Hi! Tell us what you’re building today.", "admin", Date.now());
      setStatusBadge("pending");
      setInputAvailability("pending");
      lastKnownStatus = "pending";
      return;
    }
    renderConversation(clientId);
  };

  const closeChat = () => {
    chatModal.classList.remove("open");
  };

  chatLauncher.addEventListener("click", openChat);
  chatClose.addEventListener("click", closeChat);

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = (chatInput.value || "").trim();
    if (!value) return;

    let clientId = getClientId();
    if (!clientId) {
      clientId = createClientId();
      setClientId(clientId);
      const firstTs = Date.now();
      addMessageToStore(clientId, "Hi! Tell us what you’re building today.", "admin", firstTs);
      updateStatus(clientId, "pending");
    }

    const store = getChatStore();
    const record = store[clientId];
    const status = Array.isArray(record) ? "pending" : (record?.status || "pending");
    if (status === "closed") {
      setInputAvailability("closed");
      return;
    }

    const userTs = Date.now();
    safeAddBubble(value, "client", userTs);
    addMessageToStore(clientId, value, "client", userTs);

    const refreshed = getChatStore();
    const refreshedRecord = refreshed[clientId];
    const messageCount = Array.isArray(refreshedRecord)
      ? refreshedRecord.length
      : (refreshedRecord?.messages?.length || 0);
    if (messageCount === 2) {
      updateStatus(clientId, "pending");
      addMessageToStore(clientId, "Waiting for admin to accept your chat...", "admin", Date.now());
    }

    chatInput.value = "";
    chatInput.focus();

    trackEvent("chat_message", { source: "widget", client_id: clientId });
    renderConversation(clientId);
  });

  endChatButton.addEventListener("click", () => {
    const clientId = getClientId();
    if (!clientId) {
      chatMessages.innerHTML = "";
      safeAddBubble("Hi! Tell us what you’re building today.", "admin", Date.now());
      setStatusBadge("pending");
      setInputAvailability("pending");
      return;
    }
    const store = getChatStore();
    const record = store[clientId];
    const status = Array.isArray(record) ? "pending" : (record?.status || "pending");
    if (status === "closed") {
      clearClientId();
      chatMessages.innerHTML = "";
      safeAddBubble("Hi! Tell us what you’re building today.", "admin", Date.now());
      setStatusBadge("pending");
      setInputAvailability("pending");
      lastKnownStatus = "pending";
      return;
    }
    updateStatus(clientId, "closed");
    addMessageToStore(clientId, "Client ended the chat.", "client", Date.now());
    renderConversation(clientId);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeChat();
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== CHAT_STORAGE_KEY) return;
    const clientId = getClientId();
    if (!clientId || !chatModal.classList.contains("open")) return;
    renderConversation(clientId);
  });

  window.setInterval(() => {
    const clientId = getClientId();
    if (!clientId || !chatModal.classList.contains("open")) return;
    renderConversation(clientId);
  }, 1500);
}

window.addEventListener("scroll", handleNavbarScroll);

if (menuBtn) menuBtn.addEventListener("click", toggleMobileMenu);
mobileLinks.forEach((link) => link.addEventListener("click", closeMobileMenu));
if (themeToggle) themeToggle.addEventListener("click", toggleTheme);


initTheme();
setupLinkUnderline();
handleNavbarScroll();
setActiveLinkByPage();
revealOnScroll();
staggerServiceCards();
setupParallax();
iconHoverBounce();
setupContactForm();
setupLeadForm();
setupChatWidget();
