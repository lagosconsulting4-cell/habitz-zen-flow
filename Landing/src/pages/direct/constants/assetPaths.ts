// Asset paths for TDAH Quiz Landing Page
// All paths are relative to /public

export const LOGO = '/direct/images/logo.webp';
export const AVATAR = '/direct/images/perfil.webp';

// Quiz step images (Steps 1-15)
export const QUIZ_IMAGES = {
  genderWoman: '/direct/images/quiz/img1.webp',      // Mulher - Step 1
  genderMan: '/direct/images/quiz/img2.webp',        // Homem - Step 1
  humor: '/direct/images/quiz/img3.webp',            // Humor illustration - Step 6
  forget: '/direct/images/quiz/img4.webp',           // Esquecimento - Step 8
  distraction: '/direct/images/quiz/img5.webp',      // Distração - Step 9
  overload: '/direct/images/quiz/img6.webp',         // Sobrecarregado - Step 12
  stress: '/direct/images/quiz/img7.webp',           // Estresse - Step 13
  lostThings: '/direct/images/quiz/img8.webp',       // Perdendo coisas - Step 15
  relaxation: '/direct/images/quiz/img9.webp',       // Meditação/relaxation - Step 16
  plan: '/direct/images/quiz/img10.webp',            // Plano illustration - Step 20
} as const;

// Testimonial carousel images (Step 21)
export const TESTIMONIAL_IMAGES = [
  '/direct/images/testimonials/img11.webp',  // Testimonial 1
  '/direct/images/testimonials/img12.webp',  // Testimonial 2
  '/direct/images/testimonials/img14.webp',  // Testimonial 3
] as const;

// Dashboard/Progress images (Step 23-25)
export const DASHBOARD_IMAGES = {
  character: '/direct/images/dashboard/img16.webp',   // Personagem - Step 23
  dashboard: '/direct/images/dashboard/img17.webp',   // Dashboard UI - Step 23
  stretching: '/direct/images/dashboard/img18.webp',  // Alongamento - Step 25
} as const;

// Before/After & Offer images (Step 27-28)
export const OFFER_IMAGES = {
  before: '/direct/images/offer/img19.webp',          // Antes
  after: '/direct/images/offer/img20.webp',           // Depois
  offerMain: '/direct/images/offer/img21.webp',       // Oferta principal (3x)
  paymentMethods: '/direct/images/offer/img22.webp',  // Bandeiras cartão (2x)
  guarantee: '/direct/images/offer/img23.webp',       // Selo garantia
} as const;

// Module carousel images (Step 28 - 10 slides)
export const MODULE_IMAGES = [
  '/direct/images/modules/img24.webp',  // Módulo 10 - Slide 1
  '/direct/images/modules/img25.webp',  // Módulo 10 - Slide 2
  '/direct/images/modules/img26.webp',  // Módulo 10 - Slide 3
  '/direct/images/modules/img27.webp',  // Módulo 10 - Slide 4
  '/direct/images/modules/img28.webp',  // Módulo 10 - Slide 5
  '/direct/images/modules/img29.webp',  // Módulo 10 - Slide 6
  '/direct/images/modules/img30.webp',  // Módulo 10 - Slide 7
  '/direct/images/modules/img31.webp',  // Módulo 10 - Slide 8
  '/direct/images/modules/img32.webp',  // Módulo 10 - Slide 9
  '/direct/images/modules/img33.webp',  // Módulo 10 - Slide 10
] as const;

// Audio files
export const AUDIO_FILES = {
  fernanda: '/direct/audio/fernanda.mp3',      // Testimonial audio (00:35) - Step 26
  fernanda2: '/direct/audio/fernanda-2.mp3',   // Testimonial audio - Step 28
} as const;

// Type exports for TypeScript
export type QuizImageKey = keyof typeof QUIZ_IMAGES;
export type DashboardImageKey = keyof typeof DASHBOARD_IMAGES;
export type OfferImageKey = keyof typeof OFFER_IMAGES;
export type AudioFileKey = keyof typeof AUDIO_FILES;
