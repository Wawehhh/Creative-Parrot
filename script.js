const navbar = document.getElementById("navbar");
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-link");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");
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
  if (window.scrollY > 25) {
    navbar.classList.add("nav-scrolled");
  } else {
    navbar.classList.remove("nav-scrolled");
  }
}

function toggleMobileMenu() {
  mobileMenu.classList.toggle("open");
}

function closeMobileMenu() {
  mobileMenu.classList.remove("open");
}

function revealOnScroll() {
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

  if (serviceCards.length > 0) {
    observer.observe(serviceCards[0].parentElement);
  }
}

function highlightActiveLink() {
  let currentId = "home";
  sections.forEach((section) => {
    const top = section.offsetTop - 160;
    if (window.scrollY >= top) {
      currentId = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentId}`;
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

function setupSmoothAnchors() {
  const allAnchors = document.querySelectorAll('a[href^="#"]');
  allAnchors.forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMobileMenu();
    });
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

function setupContactForm() {
  if (!contactForm) return;
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }
    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = "Sent";
      submitButton.disabled = true;
    }
    setTimeout(() => {
      contactForm.reset();
      if (submitButton) {
        submitButton.textContent = "Submit";
        submitButton.disabled = false;
      }
      trackEvent("contact_submit", { form: "contact" });
      alert("Thanks for reaching out! Creative Parrot will contact you soon.");
    }, 380);
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

  const safeAddBubble = (text, who) => {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${who}`;
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const openChat = () => {
    chatModal.classList.add("open");
    if (chatMessages && chatMessages.childElementCount === 0) {
      safeAddBubble("Hi! Tell us what you’re building today.", "bot");
    }
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

    safeAddBubble(value, "user");
    chatInput.value = "";
    chatInput.focus();

    trackEvent("chat_message", { source: "widget" });

    // Premium-feeling response delay
    setTimeout(() => {
      safeAddBubble("Thanks. We’ll respond soon with a tailored suggestion.", "bot");
    }, 650);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeChat();
  });
}

window.addEventListener("scroll", () => {
  handleNavbarScroll();
  highlightActiveLink();
});


menuBtn.addEventListener("click", toggleMobileMenu);
mobileLinks.forEach((link) => link.addEventListener("click", closeMobileMenu));
if (themeToggle) themeToggle.addEventListener("click", toggleTheme);


initTheme();
setupLinkUnderline();
handleNavbarScroll();
highlightActiveLink();
revealOnScroll();
staggerServiceCards();
setupParallax();
setupSmoothAnchors();
iconHoverBounce();
setupContactForm();
setupLeadForm();
setupChatWidget();
