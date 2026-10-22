// Thistlewick Café: concept sites (£500 – £3,500) by Tom Harding.
// One script for every page: each feature checks its markup exists first.
// No inline handlers, so tomharding.dev's strict CSP stays intact.

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupOpenStatus();
  setupCarousel();
  setupGallery();
  setupDietFilter();
  setupBooking();
  setupOrder();
  setupVoucher();
  setupSimpleForms();
});

// Opening hours, Sunday = 0. Used by the live status and the hours table.
const HOURS = {
  0: [9, 15],   // Sunday 9am – 3pm
  1: [8, 16], 2: [8, 16], 3: [8, 16], 4: [8, 16], 5: [8, 16],
  6: [8, 17],   // Saturday 8am – 5pm
};
const fmtHour = (h) => (h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`);

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
  const update = () => {
    const now = new Date();
    const [open, close] = HOURS[now.getDay()];
    const h = now.getHours() + now.getMinutes() / 60;
    const isOpen = h >= open && h < close;
    let text;
    if (isOpen) {
      text = `Open now · until ${fmtHour(close)}`;
    } else if (h < open) {
      text = `Closed · opens ${fmtHour(open)}`;
    } else {
      const [next] = HOURS[(now.getDay() + 1) % 7];
      text = `Closed · opens ${fmtHour(next)} tomorrow`;
    }
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

/* ── DIETARY FILTER ON THE MENU (£3,500) ── */
function setupDietFilter() {
  const chips = document.querySelectorAll('[data-diet]');
  if (!chips.length) return;
  const items = document.querySelectorAll('.menu-item');
  const active = new Set();
  const apply = () => {
    items.forEach((item) => {
      const tags = (item.dataset.tags || '').split(' ');
      item.hidden = [...active].some((t) => !tags.includes(t));
    });
    document.querySelectorAll('.menu-section').forEach((section) => {
      const empty = section.querySelector('.filter-empty');
      const visible = section.querySelectorAll('.menu-item:not([hidden])').length;
      if (empty) empty.hidden = visible > 0;
    });
  };
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const tag = chip.dataset.diet;
      if (active.has(tag)) active.delete(tag); else active.add(tag);
      chip.setAttribute('aria-pressed', String(active.has(tag)));
      apply();
    });
  });
}

/* ── TABLE BOOKING (£2,000 and £3,500). Demo only: nothing is sent. ── */
function setupBooking() {
  const form = document.getElementById('booking-form');
  if (!form) return;
  const steps = [...form.querySelectorAll('.booking-step')];
  const progress = [...document.querySelectorAll('.booking-progress li')];
  const error = form.querySelector('.booking-error');
  let current = 0;

  // Guests stepper
  const guestsInput = form.querySelector('input[name="guests"]');
  const guestsOut = form.querySelector('.stepper output');
  form.querySelectorAll('[data-guests]').forEach((b) => {
    b.addEventListener('click', () => {
      const n = Math.min(12, Math.max(1, Number(guestsInput.value) + Number(b.dataset.guests)));
      guestsInput.value = n;
      guestsOut.textContent = `${n} ${n === 1 ? 'guest' : 'guests'}`;
    });
  });

  // Date + time slots
  const dateInput = form.querySelector('input[name="date"]');
  const times = form.querySelector('.time-grid');
  const timeInput = form.querySelector('input[name="time"]');
  const tomorrow = new Date(Date.now() + 86400000);
  dateInput.min = new Date().toISOString().slice(0, 10);
  dateInput.value = tomorrow.toISOString().slice(0, 10);
  const buildTimes = () => {
    times.innerHTML = '';
    timeInput.value = '';
    const d = new Date(dateInput.value + 'T12:00:00');
    if (isNaN(d)) return;
    const [open, close] = HOURS[d.getDay()];
    for (let h = open; h < close; h++) {
      for (const m of [0, 30]) {
        if (h === close - 1 && m === 30) continue;
        const label = `${h}:${m === 0 ? '00' : '30'}`;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'time-btn';
        b.textContent = label;
        b.setAttribute('aria-pressed', 'false');
        b.disabled = (d.getDate() + h + m) % 7 === 0; // a few slots already full
        b.addEventListener('click', () => {
          times.querySelectorAll('.time-btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          timeInput.value = label;
          error.textContent = '';
        });
        times.appendChild(b);
      }
    }
  };
  dateInput.addEventListener('change', buildTimes);
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
    for (const field of step.querySelectorAll('input:not([type="hidden"]), select, textarea')) {
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
    const set = (k, v) => { const el = document.querySelector(`[data-summary="${k}"]`); if (el) el.textContent = v || '—'; };
    set('guests', guestsOut.textContent);
    set('when', `${when}, ${data.get('time')}`);
    set('name', data.get('name'));
    set('occasion', data.get('occasion') || 'None');
  }
}

/* ── ORDER FOR COLLECTION (£3,500). Demo only: no payment is taken. ── */
function setupOrder() {
  const basket = document.getElementById('basket');
  if (!basket) return;
  const list = basket.querySelector('.basket-list');
  const empty = basket.querySelector('.basket-empty');
  const totalEl = basket.querySelector('[data-total]');
  const checkout = document.getElementById('checkout-btn');
  const status = document.getElementById('order-status');
  const count = document.querySelector('.order-count');
  const timeSelect = document.getElementById('collect-time');
  const items = new Map();
  const gbp = (p) => '£' + (p / 100).toFixed(2);

  // Collection times: every 15 minutes, starting 20 minutes from now, during opening hours
  const now = new Date();
  const [, close] = HOURS[now.getDay()];
  let t = new Date(now.getTime() + 20 * 60000);
  t.setMinutes(Math.ceil(t.getMinutes() / 15) * 15, 0, 0);
  const options = [];
  while (t.getHours() < close && options.length < 16) {
    if (t.getHours() >= HOURS[now.getDay()][0]) {
      options.push(t.toTimeString().slice(0, 5));
    }
    t = new Date(t.getTime() + 15 * 60000);
  }
  if (!options.length) {
    timeSelect.innerHTML = '<option value="">Tomorrow from opening (pre-order)</option>';
  } else {
    timeSelect.innerHTML = options.map((o) => `<option>${o}</option>`).join('');
  }

  const render = () => {
    list.innerHTML = '';
    let total = 0;
    let qty = 0;
    items.forEach((it, id) => {
      total += it.price * it.qty;
      qty += it.qty;
      const li = document.createElement('li');
      li.innerHTML = `<span>${it.name}</span><strong>${gbp(it.price * it.qty)}</strong>
        <span class="qty"><button type="button" aria-label="Remove one ${it.name}" data-dec="${id}">−</button>${it.qty}<button type="button" aria-label="Add another ${it.name}" data-inc="${id}">+</button></span>`;
      list.appendChild(li);
    });
    empty.hidden = items.size > 0;
    totalEl.textContent = gbp(total);
    checkout.disabled = items.size === 0;
    if (count) { count.textContent = qty; count.hidden = qty === 0; }
  };

  document.querySelectorAll('.add-btn').forEach((b) => {
    b.addEventListener('click', () => {
      const id = b.dataset.id;
      const it = items.get(id) || { name: b.dataset.name, price: Number(b.dataset.price), qty: 0 };
      it.qty += 1;
      items.set(id, it);
      status.textContent = `${b.dataset.name} added to your order.`;
      render();
    });
  });
  list.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    const id = (inc || dec)?.dataset.inc || (inc || dec)?.dataset.dec;
    if (!id) return;
    const it = items.get(id);
    it.qty += inc ? 1 : -1;
    if (it.qty <= 0) items.delete(id);
    render();
  });
  checkout.addEventListener('click', () => {
    const name = document.getElementById('order-name');
    if (!name.checkValidity()) { name.reportValidity(); return; }
    status.textContent = `Thanks ${name.value}! This is a concept site, so no order was placed and no payment taken. On a real site you'd pay securely here and get a confirmation for ${timeSelect.value || 'tomorrow'}.`;
    items.clear();
    render();
  });
  render();
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

/* ── CONTACT / PRIVATE HIRE FORMS. Demo only. ── */
function setupSimpleForms() {
  document.querySelectorAll('form[data-demo-form]').forEach((form) => {
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      status.textContent = 'Thanks! This is a concept site, so nothing was sent. On a real site, this message would arrive in the café’s inbox.';
      form.reset();
    });
  });
}
