// ===== Settings — edit here =====
const CONFIG = {
  phone: '998950767777',
  // Link to the full menu (PDF, Telegram menu, QR-menu service, etc.).
  // While empty, "Меню" buttons scroll to the menu section.
  menuUrl: '',
  // Reservation requests are sent to the manager's WhatsApp with a prefilled message.
  // Replace with a backend/Telegram-bot endpoint if needed.
  whatsapp: '998950767777',
  openHour: 11,
  closeHour: 23,
};

// Header state on scroll
const header = document.querySelector('.header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile drawer
const burger = document.querySelector('.burger');
const drawer = document.querySelector('.drawer');
const setDrawer = (open) => {
  burger.setAttribute('aria-expanded', String(open));
  drawer.classList.toggle('is-open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setDrawer(false)));

// Menu links
document.querySelectorAll('[data-menu-link]').forEach((a) => {
  if (CONFIG.menuUrl) {
    a.href = CONFIG.menuUrl;
    a.target = '_blank';
    a.rel = 'noopener';
  } else {
    a.href = '#menu';
  }
});

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  io.observe(el);
});

// Reservation form
const form = document.getElementById('reserveForm');
const status = form.querySelector('.form__status');
const timeSelect = form.elements.time;
const dateInput = form.elements.date;

for (let h = CONFIG.openHour; h < CONFIG.closeHour; h++) {
  ['00', '30'].forEach((m) => timeSelect.add(new Option(`${String(h).padStart(2, '0')}:${m}`)));
}
timeSelect.value = '19:00';

const today = new Date();
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
dateInput.min = iso(today);
dateInput.value = iso(today);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;
  ['name', 'phone', 'date'].forEach((n) => {
    const field = form.elements[n];
    const bad = !field.value.trim() || (n === 'phone' && field.value.replace(/\D/g, '').length < 9);
    field.closest('.field').classList.toggle('is-invalid', bad);
    if (bad) valid = false;
  });
  if (!valid) {
    status.textContent = 'Пожалуйста, заполните имя, телефон и дату.';
    return;
  }

  const f = form.elements;
  const [y, m, d] = f.date.value.split('-');
  const text = [
    'Здравствуйте! Хочу забронировать стол в Amarant.',
    `Имя: ${f.name.value.trim()}`,
    `Телефон: ${f.phone.value.trim()}`,
    `Дата: ${d}.${m}.${y}, ${f.time.value}`,
    `Гостей: ${f.guests.value}`,
    f.comment.value.trim() && `Пожелания: ${f.comment.value.trim()}`,
  ].filter(Boolean).join('\n');

  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  status.textContent = 'Спасибо! Отправьте сообщение — менеджер подтвердит бронь.';
  form.reset();
  dateInput.value = iso(today);
  timeSelect.value = '19:00';
});

document.getElementById('year').textContent = new Date().getFullYear();
