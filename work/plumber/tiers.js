// Fernlow Plumbing & Heating: concept sites (£600, £1,000, £2,000) by Tom Harding.
// Every feature checks its markup exists first, so one file serves every page.
// No inline handlers anywhere, so tomharding.dev's strict CSP stays intact.

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupOpenStatus();
  setupGallery();
  setupBooking();
  setupSlotPicker();
  setupCalculator();
  setupQuoteForm();
});

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

/* ── LIVE OPEN / CLOSED STATUS (£2,000) ──
   Open 7am–9pm, 7 days a week. Uses the visitor's own clock. */
function setupOpenStatus() {
  const pills = document.querySelectorAll('[data-open-status]');
  if (!pills.length) return;
  const update = () => {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const open = mins >= 7 * 60 && mins < 21 * 60;
    pills.forEach((pill) => {
      pill.classList.toggle('is-open', open);
      pill.classList.toggle('is-closed', !open);
      pill.textContent = open ? 'Open now · until 9pm' : 'Closed · opens 7am';
    });
  };
  update();
  setInterval(update, 60 * 1000);
}

/* ── PROJECT GALLERY: filters + lightbox (£1,000+) ── */
function setupGallery() {
  const filters = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.filter;
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

/* ── MULTI-STEP BOOKING (£1,000 and £2,000) ──
   Demo only: nothing is sent anywhere. */
function setupBooking() {
  const form = document.getElementById('booking-form');
  if (!form) return;
  const steps = [...form.querySelectorAll('.booking-step')];
  const progress = [...document.querySelectorAll('.booking-progress li')];
  const error = form.querySelector('.booking-error');
  let current = 0;

  // Pre-select a service passed in the URL, e.g. /book/?job=boiler-repair
  const job = new URLSearchParams(location.search).get('job');
  if (job) {
    const radio = form.querySelector(`input[name="service"][value="${CSS.escape(job)}"]`);
    if (radio) radio.checked = true;
  }

  const dateInput = form.querySelector('input[type="date"]');
  if (dateInput) {
    const tomorrow = new Date(Date.now() + 86400000);
    dateInput.min = tomorrow.toISOString().slice(0, 10);
  }

  const show = (i) => {
    current = i;
    steps.forEach((s, n) => { s.hidden = n !== i; });
    progress.forEach((p, n) => {
      p.classList.toggle('is-done', n < i);
      p.classList.toggle('is-current', n === i);
    });
    error.textContent = '';
    const focusTarget = steps[i].querySelector('h2');
    if (focusTarget) { focusTarget.setAttribute('tabindex', '-1'); focusTarget.focus(); }
  };

  const validate = (step) => {
    const fields = [...step.querySelectorAll('input, select, textarea')];
    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    if (step.dataset.needs === 'slot' && !form.querySelector('input[name="slot"]').value) {
      error.textContent = 'Choose a day and a time slot first.';
      return false;
    }
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
    const service = form.querySelector('input[name="service"]:checked');
    const set = (key, value) => {
      const el = document.querySelector(`[data-summary="${key}"]`);
      if (el) el.textContent = value || '—';
    };
    set('service', service ? service.dataset.label : '');
    let date = data.get('date');
    if (date) {
      date = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
        .format(new Date(date + 'T12:00:00'));
    }
    set('when', data.get('slot-label') || [date, data.get('window')].filter(Boolean).join(', '));
    set('name', data.get('name'));
    set('postcode', data.get('postcode'));
  }
}

/* ── TIME-SLOT PICKER (£2,000) ──
   Shows the next 7 days with made-up availability. */
function setupSlotPicker() {
  const days = document.getElementById('day-picker');
  const slots = document.getElementById('slot-grid');
  if (!days || !slots) return;
  const slotInput = document.querySelector('input[name="slot"]');
  const labelInput = document.querySelector('input[name="slot-label"]');
  const times = ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
  const fmtDay = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
  const fmtDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

  for (let i = 1; i <= 7; i++) {
    const d = new Date(Date.now() + i * 86400000);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'day-btn';
    btn.setAttribute('aria-pressed', 'false');
    btn.dataset.date = d.toISOString().slice(0, 10);
    btn.dataset.label = `${fmtDay.format(d)} ${fmtDate.format(d)}`;
    btn.innerHTML = `<small>${fmtDay.format(d)}</small><strong>${d.getDate()}</strong><small>${fmtDate.format(d).split(' ')[1]}</small>`;
    btn.addEventListener('click', () => pickDay(btn, i));
    days.appendChild(btn);
  }

  function pickDay(btn, seed) {
    days.querySelectorAll('.day-btn').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    slots.innerHTML = '';
    slotInput.value = '';
    labelInput.value = '';
    times.forEach((t, n) => {
      const s = document.createElement('button');
      s.type = 'button';
      s.className = 'slot-btn';
      s.textContent = t;
      s.setAttribute('aria-pressed', 'false');
      s.disabled = (seed * 7 + n * 3) % 5 === 0; // some slots already taken
      s.addEventListener('click', () => {
        slots.querySelectorAll('.slot-btn').forEach((b) => b.setAttribute('aria-pressed', String(b === s)));
        slotInput.value = `${btn.dataset.date} ${t}`;
        const err = document.querySelector('.booking-error');
        if (err) err.textContent = '';
        labelInput.value = `${btn.dataset.label}, ${t}`;
      });
      slots.appendChild(s);
    });
  }
}

/* ── INSTANT PRICE CALCULATOR (£2,000) ── */
function setupCalculator() {
  const calc = document.getElementById('calc');
  if (!calc) return;
  const job = calc.querySelector('#calc-job');
  const qtyRow = calc.querySelector('.qty-row');
  const qty = calc.querySelector('#calc-qty');
  const urgency = calc.querySelector('#calc-urgency');
  const out = calc.querySelector('.calc-price');
  const book = calc.querySelector('.calc-book');

  const jobs = {
    'leaks':          { min: 70,   max: 110,  perUnit: false },
    'burst-pipe':     { min: 120,  max: 250,  perUnit: false },
    'boiler-repair':  { min: 85,   max: 250,  perUnit: false },
    'boiler-service': { min: 75,   max: 95,   perUnit: false },
    'radiator':       { min: 180,  max: 320,  perUnit: true },
    'power-flush':    { min: 350,  max: 550,  perUnit: false },
    'drains':         { min: 65,   max: 140,  perUnit: false },
    'bathrooms':      { min: 4500, max: 9000, perUnit: false },
  };
  const extra = { standard: 0, sameday: 40, evening: 60 };
  const gbp = (n) => '£' + n.toLocaleString('en-GB');

  const update = () => {
    const j = jobs[job.value];
    qtyRow.hidden = !j.perUnit;
    const units = j.perUnit ? Math.max(1, Math.min(10, Number(qty.value) || 1)) : 1;
    const add = extra[urgency.value] || 0;
    out.textContent = `${gbp(j.min * units + add)} – ${gbp(j.max * units + add)}`;
    const service = job.value === 'burst-pipe' ? 'leaks' : job.value === 'power-flush' || job.value === 'radiator' ? 'heating' : job.value;
    book.href = book.dataset.base + '?job=' + encodeURIComponent(service);
  };
  [job, qty, urgency].forEach((el) => el.addEventListener('input', update));
  update();
}

/* ── QUOTE FORM (contact page) ──
   Demo only: nothing is sent anywhere. */
function setupQuoteForm() {
  const form = document.getElementById('quote-form');
  const status = document.getElementById('form-status');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    status.textContent = 'Thanks! This is a concept site, so nothing was sent. On a real site, this is where your enquiry would arrive.';
    form.reset();
  });
}
