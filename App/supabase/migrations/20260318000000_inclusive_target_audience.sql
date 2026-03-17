-- Make target_audience inclusive across all journeys (remove "Homens 20-25 anos")

UPDATE public.journeys
SET target_audience = 'Quem sente que as manhãs são desperdiçadas, acorda sem energia e quer começar o dia com propósito'
WHERE slug = 'own-mornings-l1';

UPDATE public.journeys
SET target_audience = 'Quem passa tempo demais no celular, tem dificuldade de foco, dorme mal e quer retomar o controle'
WHERE slug = 'digital-detox-l1';

UPDATE public.journeys
SET target_audience = 'Quem quer começar a treinar mas não sabe por onde, sente insegurança na academia ou não consegue manter consistência'
WHERE slug = 'gym-l1';

UPDATE public.journeys
SET target_audience = 'Quem não consegue manter foco por mais de 15 minutos, vive distraído por notificações e sente que produz menos do que poderia'
WHERE slug = 'focus-protocol-l1';

UPDATE public.journeys
SET target_audience = 'Quem vive no vermelho, não sabe quanto ganha vs gasta, tem medo de olhar o extrato e sente que dinheiro escorre pelas mãos'
WHERE slug = 'finances-l1';
