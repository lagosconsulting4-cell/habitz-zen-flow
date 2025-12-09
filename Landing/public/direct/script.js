// Controle de etapas do quiz
const steps = document.querySelectorAll('.step');
let currentStep = 0;

// Meta Pixel helpers keep the browser events aligned with Conversion API
function trackFbEvent(eventName, params = {}) {
  if (typeof fbq === 'function') {
    fbq('track', eventName, params);
  }
}

function trackFbCustomEvent(eventName, params = {}) {
  if (typeof fbq === 'function') {
    fbq('trackCustom', eventName, params);
  }
}

function createFbEventId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'fb-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function rememberFbEventId(eventId, eventName = '') {
  try {
    if (eventName) {
      sessionStorage.setItem(`fb_event_id_${eventName}`, eventId);
    }
    sessionStorage.setItem('fb_last_event_id', eventId);
  } catch (err) {
    // storage may be blocked; ignore
  }
}

const trackedSteps = new Set();

function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle('active', i === index);
  });
  if (index > 0 && !trackedSteps.has(index)) {
    trackedSteps.add(index);
    const eventId = createFbEventId();
    trackFbCustomEvent('QuizProgress', { step: index + 1, eventID: eventId });
    rememberFbEventId(eventId, 'QuizProgress');
  }
  
  // Inicializar carrossel se estiver na etapa 21
  if (index === 20) {
    setTimeout(() => {
      initCarousel();
    }, 100);
  }

  // Garantir que cada novo slide comece do topo da tela
  const prefersReducedMotion = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
  const quizRoot = document.querySelector('.quiz-container');
  if (quizRoot && typeof quizRoot.scrollIntoView === 'function') {
    quizRoot.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
  } else if (typeof window.scrollTo === 'function') {
    try {
      window.scrollTo({ top: 0, behavior: scrollBehavior });
    } catch (err) {
      window.scrollTo(0, 0);
    }
  }
}

// Avança para a próxima etapa ao clicar em qualquer botão das opções
// Etapa 1 -> Etapa 2
const genderBtns = document.querySelectorAll('.gender-btn, .other-btn');
genderBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 1;
    showStep(currentStep);
  });
});

// Etapa 2 -> Etapa 3
const ageBtns = document.querySelectorAll('.age-btn');
ageBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 2;
    showStep(currentStep);
  });
});

// Etapa 3 -> Etapa 4
const motivationBtns = document.querySelectorAll('.motivation-btn');
motivationBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 3;
    showStep(currentStep);
  });
});

// Etapa 4 -> Etapa 5
const thoughtsBtns = document.querySelectorAll('.thoughts-btn');
thoughtsBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 4;
    showStep(currentStep);
  });
});

// Etapa 5 -> Etapa 6
const humorBtns = document.querySelectorAll('.humor-btn');
humorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 5;
    showStep(currentStep);
  });
});

// Etapa 6 -> Etapa 7
const esteemBtns = document.querySelectorAll('.esteem-btn');
esteemBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 6;
    showStep(currentStep);
  });
});

// Etapa 7 -> Etapa 8
const forgetBtns = document.querySelectorAll('.forget-btn');
forgetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 7;
    showStep(currentStep);
  });
});

// Etapa 8 -> Etapa 9
const wordsBtns = document.querySelectorAll('.words-btn');
wordsBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 8;
    showStep(currentStep);
  });
});

// Etapa 9 -> Etapa 10
const distractBtns = document.querySelectorAll('.distract-btn');
distractBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 9;
    showStep(currentStep);
  });
});

// Etapa 10 -> Etapa 11
const distract2Btns = document.querySelectorAll('.distract2-btn');
distract2Btns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 10;
    showStep(currentStep);
  });
});

// Etapa 11 -> Etapa 12
const overloadBtns = document.querySelectorAll('.overload-btn');
overloadBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 11;
    showStep(currentStep);
  });
});

// Etapa 12 -> Etapa 13
const stressBtns = document.querySelectorAll('.stress-btn');
stressBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 12;
    showStep(currentStep);
  });
});

// Etapa 13 -> Etapa 14
const interruptBtns = document.querySelectorAll('.interrupt-btn');
interruptBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 13;
    showStep(currentStep);
  });
});

// Etapa 14 -> Etapa 15
const lostBtns = document.querySelectorAll('.lost-btn');
lostBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 14;
    showStep(currentStep);
  });
});

// Etapa 15 -> Etapa 16
const whereBtns = document.querySelectorAll('.where-btn');
whereBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 15;
    showStep(currentStep);
  });
});

// Etapa 16 -> Etapa 17
const motivBtn = document.querySelector('.motiv-btn');
if (motivBtn) {
  motivBtn.addEventListener('click', () => {
    currentStep = 16;
    showStep(currentStep);
  });
}

// Etapa 17 -> Etapa 18
const moodBtns = document.querySelectorAll('.mood-btn');
moodBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 17;
    showStep(currentStep);
  });
});

// Etapa 18 -> Etapa 19
const priorityBtns = document.querySelectorAll('.priority-btn');
priorityBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 18;
    showStep(currentStep);
  });
});

// Etapa 19 -> Etapa 20
const planBtn = document.querySelector('.plan-btn');
if (planBtn) {
  planBtn.addEventListener('click', () => {
    currentStep = 19;
    showStep(currentStep);
  });
}

// Etapa 20 -> Etapa 21
const personalizedBtns = document.querySelectorAll('.personalized-btn');
personalizedBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 20;
    showStep(currentStep);
  });
});



// Carrossel etapa 21
const carouselImgs = document.querySelectorAll('.carousel-img');
const carouselDots = document.querySelectorAll('.carousel-dots .dot');
const carouselTrack = document.querySelector('.carousel-track');
let carouselIndex = 0;

function updateCarousel(idx) {
  // Garantir que apenas uma imagem esteja ativa por vez
  carouselImgs.forEach((img, i) => {
    img.classList.remove('active');
    if (i === idx) {
      img.classList.add('active');
    }
  });
  
  carouselDots.forEach((dot, i) => {
    dot.classList.remove('active');
    if (i === idx) {
      dot.classList.add('active');
    }
  });
}

// Inicializar carrossel
function initCarousel() {
  if (carouselImgs.length > 0) {
    carouselIndex = 0;
    updateCarousel(carouselIndex);
  }
}
// Swipe/touch events
let startX = 0;
let isDragging = false;
if (carouselTrack) {
  carouselTrack.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
  });
  carouselTrack.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        // Swipe left
        carouselIndex = (carouselIndex + 1) % carouselImgs.length;
      } else {
        // Swipe right
        carouselIndex = (carouselIndex - 1 + carouselImgs.length) % carouselImgs.length;
      }
      updateCarousel(carouselIndex);
      isDragging = false;
    }
  });
  carouselTrack.addEventListener('touchend', () => {
    isDragging = false;
  });
}
carouselDots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    carouselIndex = i;
    updateCarousel(carouselIndex);
  });
});

// Etapa 21 -> Etapa 22
const carouselBtn = document.querySelector('.carousel-btn');
if (carouselBtn) {
  carouselBtn.addEventListener('click', () => {
    currentStep = 21;
    showStep(currentStep);
  });
}

// Etapa 22 -> Etapa 23
const guideBtns = document.querySelectorAll('.guide-btn');
guideBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 22;
    showStep(currentStep);
  });
});

// Etapa 23 -> Etapa 24
const uniqueBtn = document.querySelector('.unique-btn');
if (uniqueBtn) {
  uniqueBtn.addEventListener('click', () => {
    currentStep = 23;
    showStep(currentStep);
  });
}

// Etapa 24 -> Etapa 25
const lifeBtns = document.querySelectorAll('.life-btn');
lifeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentStep = 24;
    showStep(currentStep);
  });
});

// Etapa 25 -> Etapa 26
const organizedBtn = document.querySelector('.organized-btn');
if (organizedBtn) {
  organizedBtn.addEventListener('click', () => {
    currentStep = 25;
    showStep(currentStep);
    // Iniciar animação da barra de progresso
    startProgressBar();
  });
}

// Barra de progresso animada na etapa 26
function startProgressBar() {
  const progressBar = document.querySelector('.step-26 .progress-loading .progress');
  const progressValue = document.querySelector('.step-26 .progress-value');
  const readyBtn = document.querySelector('.step-26 .ready-btn');
  let percent = 0;
  progressBar.style.width = '0%';
  progressValue.textContent = '0%';
  if (readyBtn) readyBtn.style.display = 'none';
  const interval = setInterval(() => {
    percent += 1;
    progressBar.style.width = percent + '%';
    progressValue.textContent = percent + '%';
    if (percent >= 100) {
      clearInterval(interval);
    }
  }, 200); // 0 a 100 em 20 segundos
  setTimeout(() => {
    if (readyBtn) readyBtn.style.display = 'block';
  }, 20000); // 20 segundos
}

// Etapa 26 -> próxima etapa (botão continuar)
const readyBtn = document.querySelector('.step-26 .ready-btn');
if (readyBtn) {
  readyBtn.addEventListener('click', () => {
    currentStep = 26;
    showStep(currentStep);
  });
}

// Botão de voltar global para todas as etapas
const backBtns = document.querySelectorAll('.back-btn');
backBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });
});

// Player de áudio customizado
const playSvg = document.querySelector('.play-svg');
const audioPlayer = document.getElementById('audio-player');
const audioIcon = document.querySelector('.audio-icon');
if (playSvg && audioPlayer && audioIcon) {
  playSvg.style.cursor = 'pointer';
  playSvg.addEventListener('click', () => {
    if (audioPlayer.paused) {
      audioPlayer.play();
    } else {
      audioPlayer.pause();
    }
  });
  audioIcon.style.cursor = 'pointer';
  audioIcon.addEventListener('click', () => {
    if (audioPlayer.paused) {
      audioPlayer.play();
    } else {
      audioPlayer.pause();
    }
  });
  audioPlayer.addEventListener('play', () => {
    audioIcon.innerHTML = `<svg class="pause-svg" width="28" height="28" viewBox="0 0 448 512"><path fill="#007f4d" d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"></path></svg>`;
  });
  audioPlayer.addEventListener('pause', () => {
    audioIcon.innerHTML = `<svg class="play-svg" width="28" height="28" viewBox="0 0 448 512"><path fill="#007f4d" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path></svg>`;
  });
}

// Inicializa mostrando a primeira etapa
showStep(currentStep);

function animateProfileStep27() {
  // Animação do círculo de progresso
  const graphPercent = 94;
  const graphCircle = document.querySelector('.profile-graph-circle');
  const graphText = document.querySelector('.profile-graph-percent');
  let currentGraph = 0;
  if (graphCircle && graphText) {
    const interval = setInterval(() => {
      currentGraph++;
      if (currentGraph > graphPercent) {
        clearInterval(interval);
        return;
      }
      graphText.textContent = currentGraph + '%';
      graphCircle.style.background = `conic-gradient(#1ec96b 0% ${currentGraph}%, #e6fff2 ${currentGraph}% 100%)`;
    }, 10);
  }

  // Animação das barras
  const bars = [
    { selector: '.metric-bar-red', value: 85 },
    { selector: '.metric-bar-blue', value: 30 },
    { selector: '.metric-bar-green', value: 94 }
  ];
  bars.forEach(bar => {
    const el = document.querySelector(bar.selector);
    const valueSpan = el ? el.querySelector('.metric-value') : null;
    let current = 0;
    if (el && valueSpan) {
      // Salva altura final
      const parent = el.parentElement;
      let maxHeight = 120;
      let minHeight = 90;
      if (bar.selector === '.metric-bar-blue') { maxHeight = 60; minHeight = 45; }
      const finalHeight = minHeight + (maxHeight - minHeight) * (bar.value / 100);
      el.style.height = minHeight + 'px';
      valueSpan.textContent = '0%';
      const interval = setInterval(() => {
        current++;
        if (current > bar.value) {
          clearInterval(interval);
          return;
        }
        valueSpan.textContent = current + '%';
        const h = minHeight + (maxHeight - minHeight) * (current / 100);
        el.style.height = h + 'px';
      }, 15);
    }
  });
}

// Detecta exibição da etapa 27 e dispara animação
const observer = new MutationObserver(() => {
  const step27 = document.querySelector('.step-27');
  if (step27 && step27.classList.contains('active')) {
    animateProfileStep27();
    observer.disconnect();
  }
});
observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

// Avançar da etapa 27 para a 28
const profileBtn = document.querySelector('.step-27 .profile-btn');
if (profileBtn) {
  profileBtn.addEventListener('click', () => {
    currentStep = 27;
    showStep(currentStep);
  });
}

// === TIMER REGRESSIVO DE 15 MINUTOS ===
function startDiscountTimer() {
  const timerEl = document.getElementById('discount-timer');
  if (!timerEl) return;
  let totalSeconds = 15 * 60;
  function updateTimer() {
    const min = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const sec = String(totalSeconds % 60).padStart(2, '0');
    timerEl.textContent = `${min}:${sec}`;
    if (totalSeconds > 0) {
      totalSeconds--;
      setTimeout(updateTimer, 1000);
    } else {
      timerEl.textContent = '00:00';
    }
  }
  updateTimer();
}
startDiscountTimer();

// === PLAYER DE ÁUDIO CUSTOMIZADO PARA ÚLTIMA ETAPA ===
// Troca o áudio para audio2.mp3 na última etapa (step-28)
const audioIconList = document.querySelectorAll('.step-28 .audio-icon');
if (audioIconList.length > 0) {
  let audio2 = document.getElementById('audio-player-2');
  if (!audio2) {
    audio2 = document.createElement('audio');
    audio2.id = 'audio-player-2';
    audio2.src = 'IMG/audio2.mp3';
    audio2.style.display = 'none';
    document.body.appendChild(audio2);
  }
  audioIconList.forEach(icon => {
    icon.style.cursor = 'pointer';
    icon.addEventListener('click', () => {
      if (audio2.paused) {
        audio2.play();
        icon.innerHTML = `<svg class="pause-svg" width="28" height="28" viewBox="0 0 448 512"><path fill="#007f4d" d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"></path></svg>`;
      } else {
        audio2.pause();
        icon.innerHTML = `<svg class="play-svg" width="28" height="28" viewBox="0 0 448 512"><path fill="#007f4d" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path></svg>`;
      }
    });
    audio2.addEventListener('play', () => {
      icon.innerHTML = `<svg class="pause-svg" width="28" height="28" viewBox="0 0 448 512"><path fill="#007f4d" d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"></path></svg>`;
    });
    audio2.addEventListener('pause', () => {
      icon.innerHTML = `<svg class="play-svg" width="28" height="28" viewBox="0 0 448 512"><path fill="#007f4d" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path></svg>`;
    });
  });
}

// === CARROSSEL DE MÓDULOS ===
(function() {
  const imgs = document.querySelectorAll('.modules-carousel-img');
  const dots = document.querySelectorAll('.modules-dot');
  const track = document.querySelector('.modules-carousel-track');
  let idx = 0;
  let lastIdx = 0;
  let isSliding = false;
  function show(idxToShow, direction = 0) {
    if (isSliding || idxToShow === lastIdx) return;
    isSliding = true;
    const prev = imgs[lastIdx];
    const next = imgs[idxToShow];
    imgs.forEach((img, i) => {
      img.classList.remove('active', 'slide-left', 'slide-right');
    });
    if (direction === 1) {
      prev.classList.add('slide-left');
      next.style.transform = 'translateX(60px)';
      next.style.opacity = '0';
      next.classList.add('active');
      setTimeout(() => {
        next.style.transform = 'translateX(0)';
        next.style.opacity = '1';
      }, 10);
    } else if (direction === -1) {
      prev.classList.add('slide-right');
      next.style.transform = 'translateX(-60px)';
      next.style.opacity = '0';
      next.classList.add('active');
      setTimeout(() => {
        next.style.transform = 'translateX(0)';
        next.style.opacity = '1';
      }, 10);
    } else {
      next.classList.add('active');
      next.style.transform = 'translateX(0)';
      next.style.opacity = '1';
    }
    dots.forEach((dot, i) => dot.classList.toggle('active', i === idxToShow));
    setTimeout(() => {
      imgs.forEach((img, i) => {
        if (i !== idxToShow) {
          img.classList.remove('active', 'slide-left', 'slide-right');
          img.style.transform = '';
          img.style.opacity = '';
        }
      });
      isSliding = false;
    }, 500);
    lastIdx = idxToShow;
  }
  if (imgs.length > 0 && track) {
    // Swipe/touch events
    let startX = 0;
    let isDragging = false;
    track.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
    });
    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const diff = e.touches[0].clientX - startX;
      if (Math.abs(diff) > 50) {
        let direction = diff < 0 ? 1 : -1;
        let newIdx = (idx + direction + imgs.length) % imgs.length;
        show(newIdx, direction);
        idx = newIdx;
        isDragging = false;
      }
    });
    track.addEventListener('touchend', () => {
      isDragging = false;
    });
    // Dots
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        let direction = i > idx ? 1 : -1;
        show(i, direction);
        idx = i;
      });
    });
    show(idx);
  }
})();

// Atalho para pular para a última etapa
const skipToEndBtn = document.querySelector('.skip-to-end-btn');
if (skipToEndBtn) {
  skipToEndBtn.addEventListener('click', () => {
    currentStep = steps.length - 1;
    showStep(currentStep);
  });
}

// Sincronizar o timer do bloco de oferta com o timer principal
function syncOfferTimer() {
  const mainTimer = document.getElementById('discount-timer');
  const offerTimer = document.getElementById('offer-timer');
  if (!mainTimer || !offerTimer) return;
  const update = () => {
    offerTimer.textContent = mainTimer.textContent;
    if (mainTimer.textContent !== '00:00') {
      setTimeout(update, 200);
    }
  };
  update();
}
syncOfferTimer();

// Sincronizar o timer do bloco de oferta extra (FAQ) com o timer principal
function syncFaqOfferTimer() {
  const mainTimer = document.getElementById('discount-timer');
  const faqOfferTimer = document.getElementById('faq-offer-timer');
  if (!mainTimer || !faqOfferTimer) return;
  const update = () => {
    faqOfferTimer.textContent = mainTimer.textContent;
    if (mainTimer.textContent !== '00:00') {
      setTimeout(update, 200);
    }
  };
  update();
}
syncFaqOfferTimer();

// FAQ toggle
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item, idx) => {
  item.addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item.active').forEach(i => i.classList.remove('active'));
    if (!isActive) {
      item.classList.add('active');
    }
  });
});

// Mostrar botão fixo apenas na última etapa
function toggleFixedBottomBtn() {
  const btn = document.querySelector('.fixed-bottom-btn');
  if (!btn) return;
  const steps = document.querySelectorAll('.step');
  let lastStepIdx = steps.length - 1;
  if (steps[lastStepIdx].classList.contains('active')) {
    btn.style.display = 'block';
  } else {
    btn.style.display = 'none';
  }
}
// Integrar ao fluxo de navegação
const observerFixedBtn = new MutationObserver(toggleFixedBottomBtn);
observerFixedBtn.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
toggleFixedBottomBtn();

// Redirecionamento para o checkout ao clicar em qualquer botão 'Quero o meu Plano Agora'
function redirectToCheckout() {
  const addToCartEventId = createFbEventId();
  trackFbEvent('AddToCart', { eventID: addToCartEventId });
  rememberFbEventId(addToCartEventId, 'AddToCart');

  const initiateCheckoutEventId = createFbEventId();
  trackFbEvent('InitiateCheckout', { eventID: initiateCheckoutEventId });
  rememberFbEventId(initiateCheckoutEventId, 'InitiateCheckout');

  const leadEventId = createFbEventId();
  trackFbEvent('Lead', { eventID: leadEventId });
  rememberFbEventId(leadEventId, 'Lead');
  window.location.href = 'https://pay.kirvano.com/5dc4f0b1-fc02-490a-863d-dd1c680f1cac'; // Coloque aqui o link do seu checkout
}

// Seleciona todos os botões de checkout - AGORA ABRE O MODAL
const checkoutBtns = document.querySelectorAll('.offer-btn, .faq-offer-btn, .fixed-bottom-btn');
checkoutBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.__pixCheckout) {
      window.__pixCheckout.openModal();
    } else {
      // Fallback para Kirvano se módulo não carregou
      redirectToCheckout();
    }
  });
});

// ===========================================
// PIX CHECKOUT MODULE
// Integrated checkout with BuckPay API
// ===========================================

(function() {
  'use strict';

  // ============ CONFIGURATION ============
  const CONFIG = {
    SUPABASE_URL: 'https://jbucnphyrziaxupdsnbn.supabase.co',
    EDGE_FUNCTION: '/functions/v1/buckpay-pix',
    PRODUCT_AMOUNT: 4700, // R$ 47,00 em centavos
    PRODUCT_NAME: 'Bora Premium - Plano de Calma e Foco',
    POLL_INTERVAL: 3000, // 3 segundos
    MAX_POLL_TIME: 900000, // 15 minutos
    QR_EXPIRY: 900, // 15 minutos em segundos
    APP_URL: 'https://app.borahabitz.com.br'
  };

  // ============ STATE ============
  const state = {
    currentStep: 'select',
    transactionId: null,
    externalId: null,
    pixCode: null,
    qrCodeBase64: null,
    pollInterval: null,
    qrTimerInterval: null,
    qrTimeRemaining: CONFIG.QR_EXPIRY,
    userData: {
      name: '',
      email: '',
      cpf: '',
      phone: ''
    }
  };

  // ============ DOM ELEMENTS ============
  let modal, overlay, steps, form;

  function initElements() {
    modal = document.getElementById('checkout-modal');
    if (!modal) return false;

    overlay = modal.querySelector('.checkout-overlay');
    steps = {
      select: modal.querySelector('[data-step="select"]'),
      form: modal.querySelector('[data-step="form"]'),
      qrcode: modal.querySelector('[data-step="qrcode"]'),
      success: modal.querySelector('[data-step="success"]'),
      error: modal.querySelector('[data-step="error"]')
    };
    form = document.getElementById('pix-form');
    return true;
  }

  // ============ MODAL CONTROL ============
  function openModal() {
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    goToStep('select');
    syncCheckoutTimer();

    // Track event
    if (typeof trackFbCustomEvent === 'function') {
      const eventId = createFbEventId();
      trackFbCustomEvent('CheckoutModalOpened', { eventID: eventId });
      rememberFbEventId(eventId, 'CheckoutModalOpened');
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
    resetState();
  }

  function resetState() {
    state.currentStep = 'select';
    state.transactionId = null;
    state.externalId = null;
    state.pixCode = null;
    state.qrCodeBase64 = null;
    clearInterval(state.pollInterval);
    clearInterval(state.qrTimerInterval);
    state.qrTimeRemaining = CONFIG.QR_EXPIRY;

    // Reset form
    if (form) form.reset();

    // Clear error states
    const inputs = modal.querySelectorAll('input.error');
    inputs.forEach(input => input.classList.remove('error'));
    const errors = modal.querySelectorAll('.form-error');
    errors.forEach(err => err.textContent = '');

    // Hide all steps, show select
    Object.values(steps).forEach(step => {
      if (step) {
        step.style.display = 'none';
        step.classList.remove('active');
      }
    });
    if (steps.select) {
      steps.select.style.display = 'block';
      steps.select.classList.add('active');
    }
  }

  function goToStep(stepName) {
    state.currentStep = stepName;

    Object.entries(steps).forEach(([name, el]) => {
      if (el) {
        el.style.display = name === stepName ? 'block' : 'none';
        el.classList.toggle('active', name === stepName);
      }
    });

    // Scroll to top of modal
    const container = modal.querySelector('.checkout-container');
    if (container) container.scrollTo(0, 0);
  }

  // ============ TIMER SYNC ============
  function syncCheckoutTimer() {
    // Sync com o timer da página principal se existir
    const pageTimer = document.getElementById('offer-timer');
    const checkoutTimer = document.getElementById('checkout-timer');
    if (pageTimer && checkoutTimer) {
      checkoutTimer.textContent = pageTimer.textContent;
    }
  }

  // ============ PAYMENT FLOW ============
  function handlePaymentSelection(method) {
    if (method === 'card') {
      // Mantém redirect para Kirvano
      closeModal();
      redirectToCheckout();
    } else if (method === 'pix') {
      goToStep('form');

      // Track PIX selection
      if (typeof trackFbCustomEvent === 'function') {
        const eventId = createFbEventId();
        trackFbCustomEvent('PixSelected', { eventID: eventId });
      }
    }
  }

  async function handlePixFormSubmit(e) {
    e.preventDefault();

    // Get inputs
    const nameInput = document.getElementById('pix-name');
    const emailInput = document.getElementById('pix-email');
    const cpfInput = document.getElementById('pix-cpf');
    const phoneInput = document.getElementById('pix-phone');

    const name = nameInput?.value?.trim();
    const email = emailInput?.value?.trim();
    const cpf = cpfInput?.value?.trim().replace(/\D/g, '');
    const phone = phoneInput?.value?.trim().replace(/\D/g, '');

    // Validate
    let hasError = false;

    if (!name || name.length < 3 || !name.includes(' ')) {
      showFieldError(nameInput, 'Digite nome e sobrenome');
      hasError = true;
    } else {
      clearFieldError(nameInput);
    }

    if (!email || !isValidEmail(email)) {
      showFieldError(emailInput, 'E-mail inválido');
      hasError = true;
    } else {
      clearFieldError(emailInput);
    }

    if (hasError) return;

    // Store user data
    state.userData = { name, email, cpf, phone };

    // Show loading
    const submitBtn = form.querySelector('.pix-submit-btn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoading = submitBtn?.querySelector('.btn-loading');

    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'flex';

    try {
      // Generate PIX via Edge Function
      const result = await createPixTransaction({
        name,
        email,
        document: cpf || undefined,
        phone: phone ? '55' + phone : undefined
      });

      if (result.success && result.data) {
        state.transactionId = result.data.id;
        state.externalId = result.external_id || result.data.external_id;
        state.pixCode = result.data.pix?.code;
        state.qrCodeBase64 = result.data.pix?.qrcode_base64;

        // Show QR code step
        displayQRCode();
        goToStep('qrcode');

        // Start polling
        startPaymentPolling();

        // Start QR timer
        startQRTimer();

        // Track event
        if (typeof trackFbEvent === 'function') {
          const eventId = createFbEventId();
          trackFbEvent('InitiateCheckout', {
            value: CONFIG.PRODUCT_AMOUNT / 100,
            currency: 'BRL',
            payment_method: 'pix',
            eventID: eventId
          });
          rememberFbEventId(eventId, 'InitiateCheckout');
        }
      } else {
        throw new Error(result.error || 'Erro ao gerar PIX');
      }
    } catch (error) {
      console.error('PIX generation error:', error);
      showError(error.message || 'Não foi possível gerar o código PIX. Tente novamente.');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoading) btnLoading.style.display = 'none';
    }
  }

  // ============ API CALLS ============
  async function createPixTransaction(buyer) {
    const externalId = `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response = await fetch(`${CONFIG.SUPABASE_URL}${CONFIG.EDGE_FUNCTION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'create',
        external_id: externalId,
        amount: CONFIG.PRODUCT_AMOUNT,
        buyer: {
          name: buyer.name,
          email: buyer.email,
          document: buyer.document,
          phone: buyer.phone
        },
        product: {
          name: CONFIG.PRODUCT_NAME
        },
        tracking: getTrackingData()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }

    // Store external_id for polling
    data.external_id = externalId;
    return data;
  }

  async function checkPaymentStatus(externalId) {
    const response = await fetch(`${CONFIG.SUPABASE_URL}${CONFIG.EDGE_FUNCTION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'status',
        external_id: externalId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao verificar status');
    }

    return data;
  }

  // ============ POLLING ============
  function startPaymentPolling() {
    let elapsedTime = 0;

    state.pollInterval = setInterval(async () => {
      elapsedTime += CONFIG.POLL_INTERVAL;

      if (elapsedTime >= CONFIG.MAX_POLL_TIME) {
        clearInterval(state.pollInterval);
        showError('Tempo expirado. Por favor, tente novamente.');
        return;
      }

      try {
        const result = await checkPaymentStatus(state.externalId);

        if (result.data?.status === 'paid' || result.data?.status === 'processed') {
          clearInterval(state.pollInterval);
          clearInterval(state.qrTimerInterval);
          handlePaymentSuccess();
        }
      } catch (error) {
        console.error('Polling error:', error);
        // Continue polling - don't stop on transient errors
      }
    }, CONFIG.POLL_INTERVAL);
  }

  function startQRTimer() {
    state.qrTimeRemaining = CONFIG.QR_EXPIRY;
    updateQRTimerDisplay();

    state.qrTimerInterval = setInterval(() => {
      state.qrTimeRemaining--;
      updateQRTimerDisplay();

      if (state.qrTimeRemaining <= 0) {
        clearInterval(state.qrTimerInterval);
        clearInterval(state.pollInterval);
        showError('O código PIX expirou. Por favor, gere um novo código.');
      }
    }, 1000);
  }

  function updateQRTimerDisplay() {
    const timerEl = document.getElementById('qr-timer');
    if (timerEl) {
      const mins = Math.floor(state.qrTimeRemaining / 60);
      const secs = state.qrTimeRemaining % 60;
      timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  }

  // ============ UI UPDATES ============
  function displayQRCode() {
    const qrImg = document.getElementById('pix-qrcode');
    const codeInput = document.getElementById('pix-code-input');

    if (qrImg && state.qrCodeBase64) {
      qrImg.src = `data:image/png;base64,${state.qrCodeBase64}`;
    }

    if (codeInput && state.pixCode) {
      codeInput.value = state.pixCode;
    }
  }

  function handlePaymentSuccess() {
    // Show success overlay on QR
    const qrOverlay = modal?.querySelector('.qr-overlay');
    const statusIndicator = modal?.querySelector('.status-indicator');

    if (qrOverlay) qrOverlay.style.display = 'flex';
    if (statusIndicator) {
      statusIndicator.classList.remove('pending');
      statusIndicator.classList.add('success');
      const statusText = statusIndicator.querySelector('.status-text');
      if (statusText) statusText.textContent = 'Pagamento confirmado!';
    }

    // Wait, then show success step
    setTimeout(() => {
      const emailEl = document.getElementById('success-email');
      if (emailEl) emailEl.textContent = state.userData.email;

      goToStep('success');
      playConfettiAnimation();

      // Track purchase
      if (typeof trackFbEvent === 'function') {
        const eventId = createFbEventId();
        trackFbEvent('Purchase', {
          value: CONFIG.PRODUCT_AMOUNT / 100,
          currency: 'BRL',
          payment_method: 'pix',
          eventID: eventId
        });
        rememberFbEventId(eventId, 'Purchase');
      }
    }, 1500);
  }

  function playConfettiAnimation() {
    const container = modal?.querySelector('.confetti-container');
    if (!container) return;

    const colors = ['#36bf9e', '#ffb788', '#e6e0ff', '#f7b955', '#ff6a5c', '#50d7c6'];

    for (let i = 0; i < 60; i++) {
      const confetti = document.createElement('div');
      const size = Math.random() * 8 + 6;
      confetti.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}%;
        top: -20px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation: confettiFall ${1.5 + Math.random() * 2}s ease-out forwards;
        animation-delay: ${Math.random() * 0.5}s;
        opacity: 0.9;
      `;
      container.appendChild(confetti);

      setTimeout(() => confetti.remove(), 4000);
    }
  }

  function showError(message) {
    const errorMsg = document.getElementById('error-message');
    if (errorMsg) errorMsg.textContent = message;
    goToStep('error');
  }

  function showFieldError(input, message) {
    if (!input) return;
    input.classList.add('error');
    const errorSpan = input.parentElement?.querySelector('.form-error');
    if (errorSpan) errorSpan.textContent = message;
  }

  function clearFieldError(input) {
    if (!input) return;
    input.classList.remove('error');
    const errorSpan = input.parentElement?.querySelector('.form-error');
    if (errorSpan) errorSpan.textContent = '';
  }

  // ============ UTILITIES ============
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function getTrackingData() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_content: params.get('utm_content') || undefined,
      utm_term: params.get('utm_term') || undefined,
      ref: params.get('ref') || undefined,
      src: params.get('src') || undefined,
      sck: params.get('sck') || undefined
    };
  }

  function copyPixCode() {
    const codeInput = document.getElementById('pix-code-input');
    const feedback = document.getElementById('copy-feedback');

    if (codeInput && state.pixCode) {
      navigator.clipboard.writeText(state.pixCode).then(() => {
        showCopyFeedback(feedback);
      }).catch(() => {
        // Fallback
        codeInput.select();
        document.execCommand('copy');
        showCopyFeedback(feedback);
      });
    }
  }

  function showCopyFeedback(feedback) {
    if (feedback) {
      feedback.style.display = 'flex';
      setTimeout(() => {
        feedback.style.display = 'none';
      }, 2500);
    }
  }

  // ============ INPUT MASKS ============
  function maskCPF(value) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  }

  function maskPhone(value) {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }

  // ============ EVENT LISTENERS ============
  function setupEventListeners() {
    if (!modal) return;

    // Payment option clicks
    const paymentOptions = modal.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
      option.addEventListener('click', () => {
        const method = option.dataset.payment;
        handlePaymentSelection(method);
      });
    });

    // Form submission
    if (form) {
      form.addEventListener('submit', handlePixFormSubmit);
    }

    // Close modal
    const closeButtons = modal.querySelectorAll('[data-close-modal]');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', closeModal);
    });

    // Back button
    const backBtn = modal.querySelector('.checkout-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => goToStep('select'));
    }

    // Copy PIX code
    const copyBtn = document.getElementById('copy-pix-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', copyPixCode);
    }

    // Retry button
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        resetState();
        goToStep('select');
      });
    }

    // Success access button
    const accessBtn = document.getElementById('success-access-btn');
    if (accessBtn) {
      accessBtn.addEventListener('click', () => {
        window.location.href = CONFIG.APP_URL;
      });
    }

    // Input masks
    const cpfInput = document.getElementById('pix-cpf');
    if (cpfInput) {
      cpfInput.addEventListener('input', (e) => {
        e.target.value = maskCPF(e.target.value);
      });
    }

    const phoneInput = document.getElementById('pix-phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        e.target.value = maskPhone(e.target.value);
      });
    }

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.style.display === 'flex') {
        closeModal();
      }
    });

    // Click outside to close
    overlay?.addEventListener('click', closeModal);
  }

  // ============ INITIALIZATION ============
  function init() {
    if (!initElements()) {
      console.warn('[PIX Checkout] Modal element not found');
      return;
    }

    setupEventListeners();
    console.log('[PIX Checkout] Module initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for external use
  window.__pixCheckout = {
    openModal,
    closeModal,
    resetState,
    state
  };

})(); 
