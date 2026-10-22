// Sorrelby Hair & Beauty: concept sites (£500 – £3,500) by Tom Harding.
// One script for every page: each feature checks its markup exists first.
// No inline handlers or inline styles, so tomharding.dev's strict CSP stays intact.

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupOpenStatus();
  setupCarousel();
  setupGallery();
  setupServiceFilter();
  setupBooking();
  setupBeforeAfter();
  setupVoucher();
  setupSimpleForms();
});

// Opening hours, Sunday = 0. null = closed.
const HOURS = {
  0: null,        // Sunday closed
  1: null,        // Monday closed
  2: [9, 18], 3: [9, 18],
  4: [9, 20],     // Thursday late night
  5: [9, 18],
  6: [8, 16],     // Saturday
};
const fmtHour = (h) => (h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`);
const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* ── MOBILE NAV ── */
function setupMobileNav() {
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;
  const setOpen = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.hidden = !open;
  };
  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); }
  });
}

/* ── LIVE OPEN / CLOSED STATUS (£3,500) + today's row in the hours table ── */
function setupOpenStatus() {
  const today = new Date().getDay();
  document.querySelectorAll('.hours tr[data-day]').forEach((row) => {
    row.classList.toggle('is-today', Number(row.dataset.day) === today);
  });
  const pills = document.querySelectorAll('[data-open-status]');
  if (!pills.length) return;
  const nextOpening = (from) => {
    for (let i = 1; i <= 7; i++) {
      const d = (from + i) % 7;
      if (HOURS[d]) return i === 1 ? `${fmtHour(HOURS[d][0])} tomorrow` : `${DAY[d]} ${fmtHour(HOURS[d][0])}`;
    }
    return '';
  };
  const update = () => {
    const now = new Date();
    const hrs = HOURS[now.getDay()];
    const h = now.getHours() + now.getMinutes() / 60;
    const isOpen = !!hrs && h >= hrs[0] && h < hrs[1];
    let text;
    if (isOpen) text = `Open now · until ${fmtHour(hrs[1])}`;
    else if (hrs && h < hrs[0]) text = `Closed · opens ${fmtHour(hrs[0])}`;
    else text = `Closed · opens ${nextOpening(now.getDay())}`;
    pills.forEach((pill) => {
      pill.classList.toggle('is-open', isOpen);
      pill.classList.toggle('is-closed', !isOpen);
      pill.textContent = text;
    });
  };
  update();
  setInterval(update, 60 * 1000);
}

/* ── PHOTO CAROUSEL (£500) ── */
function setupCarousel() {
  const track = document.getElementById('carousel');
  if (!track) return;
  const prev = document.querySelector('[data-carousel="prev"]');
  const next = document.querySelector('[data-carousel="next"]');
  const step = () => track.clientWidth * 0.9;
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  const update = () => {
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  };
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ── GALLERY FILTERS + LIGHTBOX (£2,000+) ── */
function setupGallery() {
  const filters = document.querySelectorAll('[data-gallery-filter]');
  const items = document.querySelectorAll('.gallery-item');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.galleryFilter;
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      items.forEach((item) => { item.hidden = type !== 'all' && item.dataset.type !== type; });
    });
  });
  const box = document.getElementById('lightbox');
  if (!box || !items.length) return;
  const img = box.querySelector('img');
  const caption = box.querySelector('p');
  items.forEach((item) => {
    item.addEventListener('click', () => {
      const src = item.querySelector('img');
      img.src = src.src;
      img.alt = src.alt;
      caption.textContent = item.querySelector('span').textContent;
      box.showModal();
    });
  });
  box.querySelector('.lightbox-close').addEventListener('click', () => box.close());
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
}

/* ── SERVICE SEARCH + CATEGORY FILTER (£3,500) ── */
function setupServiceFilter() {
  const search = document.getElementById('service-search');
  const chips = document.querySelectorAll('[data-cat-filter]');
  if (!search && !chips.length) return;
  const rows = document.querySelectorAll('.service-row');
  const count = document.querySelector('[data-service-count]');
  let cat = 'all';
  const apply = () => {
    const q = (search?.value || '').trim().toLowerCase();
    let shown = 0;
    rows.forEach((row) => {
      const ok = (cat === 'all' || row.dataset.cat === cat) && row.textContent.toLowerCase().includes(q);
      row.hidden = !ok;
      if (ok) shown++;
    });
    document.querySelectorAll('.price-section').forEach((sec) => {
      sec.hidden = !sec.querySelector('.service-row:not([hidden])');
    });
    if (count) count.textContent = shown ? `Showing ${shown} ${shown === 1 ? 'treatment' : 'treatments'}` : 'No treatments match. Try another word, or call us and ask.';
  };
  search?.addEventListener('input', apply);
  chips.forEach((chip) => chip.addEventListener('click', () => {
    cat = chip.dataset.catFilter;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    apply();
  }));
  apply();
}

/* ── ONLINE BOOKING (£2,000 and £3,500). Demo only: nothing is sent. ── */
function setupBooking() {
  const form = document.getElementById('booking-form');
  if (!form) return;
  const steps = [...form.querySelectorAll('.booking-step')];
  const progress = [...document.querySelectorAll('.booking-progress li')];
  const error = form.querySelector('.booking-error');
  let current = 0;

  // 1. Service
  const service = form.querySelector('select[name="service"]');
  const serviceInfo = form.querySelector('[data-service-info]');
  const selected = () => service.selectedOptions[0];
  const showServiceInfo = () => {
    const o = selected();
    if (!o || !o.value) { serviceInfo.textContent = ''; return; }
    serviceInfo.textContent = `${o.dataset.mins} minutes · ${o.dataset.price}` +
      (o.dataset.cat === 'colour' ? ' · needs a quick patch test 48 hours before' : '');
  };
  service.addEventListener('change', () => { showServiceInfo(); filterStylists(); buildTimes(); });

  // 2. Stylist (only people who do that kind of treatment)
  const stylists = [...form.querySelectorAll('.stylist-choice')];
  const filterStylists = () => {
    const cat = selected()?.dataset.cat;
    stylists.forEach((s) => {
      const ok = !cat || s.dataset.does === 'any' || s.dataset.does.split(' ').includes(cat);
      s.hidden = !ok;
      if (!ok) s.querySelector('input').checked = false;
    });
    if (!form.querySelector('input[name="stylist"]:checked')) form.querySelector('input[name="stylist"][value="any"]').checked = true;
  };

  // 3. Date + time slots (every 30 minutes, finishing before closing)
  const dateInput = form.querySelector('input[name="date"]');
  const times = form.querySelector('.time-grid');
  const timeInput = form.querySelector('input[name="time"]');
  const closedMsg = form.querySelector('[data-closed-msg]');
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  dateInput.min = iso(new Date());
  let first = new Date(Date.now() + 86400000);
  while (!HOURS[first.getDay()]) first = new Date(first.getTime() + 86400000);
  dateInput.value = iso(first);
  const buildTimes = () => {
    times.innerHTML = '';
    timeInput.value = '';
    const d = new Date(dateInput.value + 'T12:00:00');
    if (isNaN(d)) return;
    const hrs = HOURS[d.getDay()];
    closedMsg.hidden = !!hrs;
    if (!hrs) { closedMsg.textContent = `We're closed on ${DAY[d.getDay()]}s. Please choose another day.`; return; }
    const mins = Number(selected()?.dataset.mins || 30);
    for (let t = hrs[0] * 60; t + mins <= hrs[1] * 60; t += 30) {
      const label = `${Math.floor(t / 60)}:${t % 60 === 0 ? '00' : '30'}`;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'time-btn';
      b.textContent = label;
      b.setAttribute('aria-pressed', 'false');
      b.disabled = (d.getDate() + t / 30) % 5 === 0; // a few slots already taken
      b.addEventListener('click', () => {
        times.querySelectorAll('.time-btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        timeInput.value = label;
        error.textContent = '';
      });
      times.appendChild(b);
    }
  };
  dateInput.addEventListener('change', buildTimes);

  // Prefill from links such as book/?service=balayage or book/?stylist=ellie
  const params = new URLSearchParams(location.search);
  if (params.get('service') && service.querySelector(`option[value="${CSS.escape(params.get('service'))}"]`)) service.value = params.get('service');
  showServiceInfo();
  filterStylists();
  const want = params.get('stylist');
  const wantInput = want && form.querySelector(`input[name="stylist"][value="${CSS.escape(want)}"]`);
  if (wantInput && !wantInput.closest('.stylist-choice').hidden) wantInput.checked = true;
  buildTimes();

  const show = (i) => {
    current = i;
    steps.forEach((s, n) => { s.hidden = n !== i; });
    progress.forEach((p, n) => { p.classList.toggle('is-done', n < i); p.classList.toggle('is-current', n === i); });
    error.textContent = '';
    const h = steps[i].querySelector('h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
  };
  const validate = (step) => {
    for (const field of step.querySelectorAll('input:not([type="hidden"]):not([type="radio"]), select, textarea')) {
      if (field.closest('[hidden]')) continue;
      if (!field.checkValidity()) { field.reportValidity(); return false; }
    }
    if (step.dataset.needs === 'time' && !timeInput.value) { error.textContent = 'Choose a time first.'; return false; }
    return true;
  };
  form.addEventListener('click', (e) => {
    const next = e.target.closest('[data-next]');
    const back = e.target.closest('[data-back]');
    if (next) {
      e.preventDefault();
      if (validate(steps[current])) {
        if (current === steps.length - 2) fillSummary();
        show(current + 1);
      }
    }
    if (back) { e.preventDefault(); show(current - 1); }
  });
  form.addEventListener('submit', (e) => e.preventDefault());

  function fillSummary() {
    const data = new FormData(form);
    const d = new Date(data.get('date') + 'T12:00:00');
    const when = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
    const o = selected();
    const st = form.querySelector('input[name="stylist"]:checked');
    const set = (k, v) => { const el = document.querySelector(`[data-summary="${k}"]`); if (el) el.textContent = v || '—'; };
    set('service', o.textContent.split(' · ')[0]);
    set('stylist', st ? st.dataset.label : 'Anyone available');
    set('when', `${when}, ${data.get('time')}`);
    set('price', o.dataset.price);
    set('name', data.get('name'));
    const patch = document.querySelector('[data-patch-note]');
    if (patch) patch.hidden = o.dataset.cat !== 'colour';
  }
}

/* ── BEFORE / AFTER SLIDER (£3,500) ── */
function setupBeforeAfter() {
  document.querySelectorAll('[data-ba]').forEach((box) => {
    const range = box.querySelector('input[type="range"]');
    const set = () => box.style.setProperty('--pos', `${range.value}%`);
    range.addEventListener('input', set);
    set();
  });
}

/* ── GIFT VOUCHERS (£3,500). Demo only. ── */
function setupVoucher() {
  const form = document.getElementById('voucher-form');
  if (!form) return;
  const amountOut = document.querySelector('.voucher-amount');
  const msgOut = document.querySelector('.voucher-msg');
  const toOut = document.querySelector('[data-voucher-to]');
  form.querySelectorAll('input[name="amount"]').forEach((r) => {
    r.addEventListener('change', () => { amountOut.textContent = '£' + r.value; });
  });
  form.querySelector('#v-message').addEventListener('input', (e) => { msgOut.textContent = e.target.value ? `"${e.target.value}"` : ''; });
  form.querySelector('#v-to').addEventListener('input', (e) => { toOut.textContent = e.target.value || 'someone special'; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    form.querySelector('.form-status').textContent = 'This is a concept site, so no voucher was bought. On a real site you would pay securely and the voucher would be emailed instantly.';
  });
}

/* ── CONTACT / CONSULTATION FORMS. Demo only. ── */
function setupSimpleForms() {
  document.querySelectorAll('form[data-demo-form]').forEach((form) => {
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      status.textContent = 'Thanks! This is a concept site, so nothing was sent. On a real site, this message would arrive in the salon’s inbox.';
      form.reset();
    });
  });
}
