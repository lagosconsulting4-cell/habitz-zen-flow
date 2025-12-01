const body = document.body;
const form = document.getElementById('instant-access-form');
const submitBtn = document.getElementById('instant-access-btn');
const feedbackEl = document.getElementById('instant-access-feedback');
const membersBtn = document.getElementById('members-area-btn');
const resendBtn = document.getElementById('resend-email-btn');
const endpoint = body.dataset.passwordEndpoint || '';
const appUrl = body.dataset.appUrl || 'https://app.habitz.life';
const membersUrl = body.dataset.membersAreaUrl || 'https://app.kirvano.com/';

const buildAppAuthUrl = () => {
  try {
    const url = new URL(appUrl);
    url.pathname = '/auth';
    return url.toString();
  } catch (error) {
    return appUrl;
  }
};

const setFeedback = (message, type) => {
  if (!feedbackEl) return;
  feedbackEl.textContent = message;
  feedbackEl.classList.remove('instant-access-feedback--success', 'instant-access-feedback--error');
  if (type) {
    feedbackEl.classList.add(`instant-access-feedback--${type}`);
  }
};

if (membersBtn) {
  membersBtn.href = membersUrl;
}

if (resendBtn) {
  resendBtn.addEventListener('click', () => {
    const emailInput = document.getElementById('user-email');
    const email = emailInput?.value.trim();
    if (!email) {
      setFeedback('Digite o e-mail da compra para receber novas instruções.', 'error');
      emailInput?.focus();
      return;
    }
    setFeedback('Enviamos instruções de recuperação para o seu e-mail. Caso não veja em 5 minutos, procure nas abas Promoções ou Spam.', 'success');
  });
}

document.getElementById('year').textContent = new Date().getFullYear();

if (form && submitBtn) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = (formData.get('email') || '').toString().trim();
    const password = (formData.get('password') || '').toString().trim();

    if (!endpoint) {
      setFeedback('Endpoint de criação de senha não configurado.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Validando dados...';
    setFeedback('Verificando pagamento no Supabase...', null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível liberar o acesso.');
      }

      setFeedback('✅ Acesso liberado! Redirecionando para o app...', 'success');
      submitBtn.textContent = 'Acesso liberado';

      if (window.fbq) {
        window.fbq('track', 'Subscribe', { value: 1, currency: 'BRL' });
      }

      setTimeout(() => {
        window.location.href = buildAppAuthUrl();
      }, 1800);
    } catch (error) {
      console.error('[obrigado] create-password error', error);
      setFeedback(`❌ ${error.message || 'Erro ao liberar acesso. Tente novamente.'}`, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Liberar acesso';
    }
  });
}
