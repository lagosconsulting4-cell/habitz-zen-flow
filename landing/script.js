const steps = Array.from(document.querySelectorAll(".step"));
let currentStepIndex = steps.findIndex((step) => step.classList.contains("active"));

if (currentStepIndex === -1 && steps.length) {
  steps[0].classList.add("active");
  currentStepIndex = 0;
}

const nextButtonClasses = new Set([
  "age-btn",
  "carousel-btn",
  "distract-btn",
  "distract2-btn",
  "esteem-btn",
  "forget-btn",
  "gender-btn",
  "guide-btn",
  "humor-btn",
  "interrupt-btn",
  "life-btn",
  "lost-btn",
  "mood-btn",
  "motiv-btn",
  "motivation-btn",
  "organized-btn",
  "other-btn",
  "overload-btn",
  "personalized-btn",
  "plan-btn",
  "priority-btn",
  "profile-btn",
  "ready-btn",
  "stress-btn",
  "thoughts-btn",
  "unique-btn",
  "where-btn",
  "words-btn",
]);

const checkoutUrl = document.body.dataset.checkoutUrl || "#";
const fixedBottomBtn = document.querySelector(".fixed-bottom-btn");

const updateFixedButton = () => {
  if (!fixedBottomBtn) {
    return;
  }
  const show = currentStepIndex === steps.length - 1;
  fixedBottomBtn.style.display = show ? "inline-flex" : "none";
};

const goToStep = (index, { scroll = true } = {}) => {
  if (index < 0 || index >= steps.length || index === currentStepIndex) {
    return;
  }

  const currentStep = steps[currentStepIndex];
  currentStep?.classList.remove("active");

  currentStepIndex = index;
  const nextStep = steps[currentStepIndex];
  nextStep?.classList.add("active");

  if (scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (nextStep?.classList.contains("step-26")) {
    startLoadingSequence(nextStep);
  }

  updateFixedButton();
};

const goForward = () => {
  goToStep(currentStepIndex + 1);
};

const goBack = () => {
  goToStep(currentStepIndex - 1);
};

const handleCheckout = () => {
  if (!checkoutUrl || checkoutUrl === "#") {
    console.warn("Configure o atributo data-checkout-url no <body> para habilitar o checkout.");
    return;
  }
  window.open(checkoutUrl, "_blank");
};

const quizContainer = document.querySelector(".quiz-container");
quizContainer?.addEventListener("click", (event) => {
  const button = event.target instanceof HTMLElement ? event.target.closest("button") : null;
  if (!button) {
    return;
  }

  if (button.classList.contains("back-btn")) {
    goBack();
    return;
  }

  if (button.classList.contains("offer-btn") || button.classList.contains("faq-offer-btn")) {
    handleCheckout();
    return;
  }

  const shouldAdvance = Array.from(button.classList).some((className) => nextButtonClasses.has(className));
  if (shouldAdvance) {
    goForward();
  }
});

fixedBottomBtn?.addEventListener("click", handleCheckout);

// --- Loading sequence (step 26) ---
let loadingHasRun = false;
const startLoadingSequence = (stepElement) => {
  if (loadingHasRun) {
    const readyButton = stepElement.querySelector(".ready-btn");
    if (readyButton) {
      readyButton.style.display = "inline-flex";
    }
    return;
  }

  loadingHasRun = true;

  const progressValue = stepElement.querySelector(".progress-value");
  const progressBar = stepElement.querySelector(".progress-loading .progress");
  const readyButton = stepElement.querySelector(".ready-btn");

  let value = 0;
  const interval = setInterval(() => {
    value = Math.min(value + 5, 100);
    if (progressValue) {
      progressValue.textContent = `${value}%`;
    }
    if (progressBar) {
      progressBar.style.width = `${value}%`;
    }

    if (value >= 100) {
      clearInterval(interval);
      if (readyButton) {
        readyButton.style.display = "inline-flex";
      }
    }
  }, 180);
};

// --- Audio controls ---
const audioPlayers = [];

const registerAudioPlayer = (wrapper) => {
  const audio = wrapper.querySelector("audio");
  const trigger = wrapper.querySelector(".audio-body");

  if (!audio || !trigger) {
    return;
  }

  audioPlayers.push(audio);

  const pauseOthers = () => {
    audioPlayers.forEach((player) => {
      if (player !== audio && !player.paused) {
        player.pause();
        player.dispatchEvent(new Event("custompause"));
      }
    });
  };

  trigger.addEventListener("click", () => {
    if (audio.paused) {
      pauseOthers();
      audio.play().catch((error) => {
        console.warn("Não foi possível iniciar o áudio:", error);
      });
      wrapper.classList.add("is-playing");
    } else {
      audio.pause();
      wrapper.classList.remove("is-playing");
    }
  });

  audio.addEventListener("pause", () => {
    wrapper.classList.remove("is-playing");
  });
  audio.addEventListener("ended", () => {
    wrapper.classList.remove("is-playing");
  });
  audio.addEventListener("custompause", () => {
    wrapper.classList.remove("is-playing");
  });
};

document.querySelectorAll(".audio-message").forEach(registerAudioPlayer);

// --- Simple carousel helpers ---
const setupScopedCarousel = (scope, imageSelector, dotSelector, interval = 4500) => {
  const images = Array.from(scope.querySelectorAll(imageSelector));
  if (images.length <= 1) {
    return;
  }

  const dots = Array.from(scope.querySelectorAll(dotSelector));
  let index = 0;

  const activate = (position) => {
    images.forEach((image, imageIndex) => {
      image.classList.toggle("active", imageIndex === position);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === position);
    });
  };

  const next = () => {
    index = (index + 1) % images.length;
    activate(index);
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      index = dotIndex;
      activate(index);
    });
  });

  activate(index);

  setInterval(() => {
    if (scope.offsetParent === null || document.hidden) {
      return;
    }
    next();
  }, interval);
};

const step21 = document.querySelector(".step-21");
if (step21) {
  setupScopedCarousel(step21, ".carousel-img", ".carousel-dots .dot", 5000);
}

const step28 = document.querySelector(".step-28");
if (step28) {
  setupScopedCarousel(step28, ".modules-carousel-img", ".modules-dot", 3500);
}

// --- Timers ---
const startCountdown = (element) => {
  if (!element) {
    return;
  }
  const initial = element.textContent.trim();
  const match = initial.match(/(\\d{1,2}):(\\d{2})/);
  if (!match) {
    return;
  }
  const [, minutesStr, secondsStr] = match;
  const initialTotal = parseInt(minutesStr, 10) * 60 + parseInt(secondsStr, 10);
  let remaining = initialTotal;

  const format = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  element.textContent = format(remaining);

  setInterval(() => {
    if (remaining <= 0) {
      remaining = initialTotal;
    } else {
      remaining -= 1;
    }
    element.textContent = format(remaining);
  }, 1000);
};

startCountdown(document.getElementById("discount-timer"));
startCountdown(document.getElementById("faq-offer-timer"));

// --- FAQ accordion ---
document.querySelectorAll(".faq-item").forEach((item) => {
  const question = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");
  const arrow = item.querySelector(".faq-arrow");

  if (!question || !answer) {
    return;
  }

  item.classList.remove("open");
  answer.style.maxHeight = "0px";

  const toggle = () => {
    const isOpen = item.classList.toggle("open");
    if (isOpen) {
      answer.style.maxHeight = `${answer.scrollHeight}px`;
      arrow?.classList.add("rotated");
    } else {
      answer.style.maxHeight = "0px";
      arrow?.classList.remove("rotated");
    }
  };

  question.setAttribute("tabindex", "0");
  question.addEventListener("click", toggle);
  question.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  });
});

updateFixedButton();
