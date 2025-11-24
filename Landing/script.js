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
  window.location.href = 'https://pay.kirvano.com/bd2c4f4d-587a-4a3f-a6db-77fe0ef16923'; // Coloque aqui o link do seu checkout
}

// Seleciona todos os botões de checkout
const checkoutBtns = document.querySelectorAll('.offer-btn, .faq-offer-btn, .fixed-bottom-btn');
checkoutBtns.forEach(btn => {
  btn.addEventListener('click', redirectToCheckout);
}); 
