// Fernlow Plumbing & Heating — concept site by Tom Harding
// No inline handlers anywhere, so the site's strict CSP (script-src 'self') stays intact.

document.addEventListener('DOMContentLoaded', () => {
  setupSearch();
  setupCarousels();
  setupQuoteForm();
});

/* ── HERO SEARCH ──
   Matches what the visitor types against each service card's data-keywords,
   scrolls to the best match and highlights it. No match → send them to the
   quote form with their words already filled in. */
function setupSearch() {
  const form = document.getElementById('service-search');
  const input = document.getElementById('search-input');
  const hint = document.getElementById('search-hint');
  const services = [...document.querySelectorAll('.service')];
  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim().toLowerCase();
    if (!query) {
      hint.textContent = 'Type what you need help with, for example "leaking tap".';
      input.focus();
      return;
    }

    // Safety first: a gas smell is an emergency, not a quote request.
    if (/\bgas\b/.test(query) && /(smell|leak|escape)/.test(query)) {
      hint.textContent = 'Smell gas? Leave the property and call the National Gas Emergency Service on 0800 111 999 straight away.';
      return;
    }

    const words = query.split(/\s+/);
    let best = null;
    let bestScore = 0;
    services.forEach((card) => {
      const keywords = card.dataset.keywords.split(' ');
      const score = words.filter((w) => keywords.some((k) => k.startsWith(w) || w.startsWith(k))).length;
      if (score > bestScore) { best = card; bestScore = score; }
    });

    services.forEach((card) => card.classList.remove('highlight'));

    if (best) {
      const name = best.querySelector('h3').textContent;
      hint.textContent = `We can help with that: see ${name} below.`;
      best.classList.add('highlight');
      best.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => best.classList.remove('highlight'), 3000);
    } else {
      hint.textContent = "Not sure? Tell us about it and we'll come back with a quote.";
      const message = document.getElementById('q-message');
      if (message && !message.value) message.value = input.value.trim();
      document.getElementById('quote').scrollIntoView({ behavior: 'smooth' });
    }
  });
}

/* ── CAROUSELS ──
   The track scrolls natively (swipe on phones, trackpad on laptops).
   The arrow buttons just scroll it by roughly one "page" of slides. */
function setupCarousels() {
  document.querySelectorAll('.carousel-btn').forEach((btn) => {
    const track = document.getElementById(`carousel-${btn.dataset.carousel}`);
    if (!track) return;
    btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.dir);
      track.scrollBy({ left: dir * track.clientWidth * 0.9, behavior: 'smooth' });
    });
  });

  document.querySelectorAll('.carousel').forEach((track) => {
    const name = track.id.replace('carousel-', '');
    const prev = document.querySelector(`.carousel-btn[data-carousel="${name}"][data-dir="-1"]`);
    const next = document.querySelector(`.carousel-btn[data-carousel="${name}"][data-dir="1"]`);
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    };
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    // Arrow keys work when the carousel has keyboard focus
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: track.clientWidth * 0.9 }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -track.clientWidth * 0.9 }); }
    });
  });
}

/* ── QUOTE FORM ──
   Demo only: nothing is sent anywhere. For a real client this is where
   Web3Forms (or similar) would be wired up, as on tomharding.dev. */
function setupQuoteForm() {
  const form = document.getElementById('quote-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    status.textContent = 'Thanks! This is a concept site, so nothing was sent. On a real site, this is where your enquiry would arrive.';
    form.reset();
  });
}
